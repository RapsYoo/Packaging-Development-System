<?php

namespace App\Services;

use App\Models\ApprovalWorkflow;
use App\Models\PackagingApproval;
use App\Models\Project;

/**
 * Hard Gating Rules Service
 * 
 * Aturan sesuai alur aktual:
 * NPD/EPD: Concept -> Technical Drawing -> FABK -> [Artwork (sekunder)] -> Scale Up
 * Substitusi: FABK -> [Artwork (sekunder)] -> Scale Up (Bypass Concept & Drawing)
 */
class GatingService
{
    /**
     * Cek apakah Technical Drawing Approval bisa dimulai.
     * Prasyarat:
     * - NPD/EPD: Concept Approval harus APPROVED.
     * - Substitusi: Tidak wajib.
     */
    public static function canStartDrawingApproval(Project $project): array
    {
        if (in_array($project->type, ['NPD', 'EPD'])) {
            $conceptApproved = ApprovalWorkflow::where('project_id', $project->id)
                ->where('type', 'concept')
                ->where('status', 'approved')
                ->exists();

            if (!$conceptApproved) {
                return [
                    'allowed' => false,
                    'reason' => 'Evaluasi Konsep (BOD) belum disetujui. Selesaikan Evaluasi Konsep terlebih dahulu.'
                ];
            }
        }

        $existingDrawing = ApprovalWorkflow::where('project_id', $project->id)
            ->where('type', 'drawing')
            ->whereIn('status', ['pending', 'in_progress'])
            ->exists();

        if ($existingDrawing) {
            return [
                'allowed' => false,
                'reason' => 'Sudah ada Approval Technical Drawing yang sedang berjalan untuk proyek ini.'
            ];
        }

        return ['allowed' => true, 'reason' => null];
    }

    /**
     * Cek apakah Form Approval Bahan Kemas (FABK) bisa dibuat.
     * Prasyarat:
     * - NPD/EPD: Technical Drawing harus APPROVED.
     * - Substitusi: Langsung bisa dibuat (setelah cek quotation/sampel).
     */
    public static function canCreateFABK(Project $project): array
    {
        if (in_array($project->type, ['NPD', 'EPD'])) {
            $drawingApproved = ApprovalWorkflow::where('project_id', $project->id)
                ->where('type', 'drawing')
                ->where('status', 'approved')
                ->exists();

            if (!$drawingApproved) {
                return [
                    'allowed' => false,
                    'reason' => 'Technical Drawing Approval belum disetujui. Selesaikan proses Drawing terlebih dahulu.'
                ];
            }
        }

        return ['allowed' => true, 'reason' => null];
    }

    /**
     * Cek apakah Sirkulasi Artwork bisa dimulai untuk project ini.
     * Prasyarat: FABK harus sudah FULLY APPROVED (untuk semua tipe proyek).
     */
    public static function canStartArtworkApproval(Project $project): array
    {
        // Cari FABK yang sudah fully approved untuk project ini
        if ($project->type === 'Substitusi') {
            $fabkApproved = \App\Models\SubstitutionApproval::where('project_id', $project->id)
                ->where('status', 'approved')
                ->exists();
        } else {
            $fabkApproved = PackagingApproval::where('project_id', $project->id)
                ->whereNotNull('approved_by_brand')
                ->whereNotNull('approved_by_marketing')
                ->whereNotNull('approved_by_commercial')
                ->whereNotNull('approved_by_bod')
                ->where('decision_rd', 'approved')
                ->exists();
        }

        if (!$fabkApproved) {
            return [
                'allowed' => false,
                'reason' => 'Form Approval Bahan Kemas (FABK) belum disetujui sepenuhnya. Selesaikan FABK terlebih dahulu sebelum memproses Artwork.'
            ];
        }

        $existingArtwork = ApprovalWorkflow::where('project_id', $project->id)
            ->where('type', 'artwork')
            ->whereIn('status', ['pending', 'in_progress'])
            ->exists();

        if ($existingArtwork) {
            return [
                'allowed' => false,
                'reason' => 'Sudah ada Sirkulasi Artwork yang sedang berjalan untuk proyek ini.'
            ];
        }

        return ['allowed' => true, 'reason' => null];
    }

    /**
     * Cek apakah Scale Up bisa dibuat untuk project ini.
     * Prasyarat:
     * - FABK harus sudah FULLY APPROVED.
     * - Jika ada Artwork Workflow yang dibuat (untuk sekunder/tersier), harus APPROVED.
     */
    public static function canCreateScaleUp(Project $project): array
    {
        if ($project->type === 'Substitusi') {
            $fabkApproved = \App\Models\SubstitutionApproval::where('project_id', $project->id)
                ->where('status', 'approved')
                ->exists();
        } else {
            $fabkApproved = PackagingApproval::where('project_id', $project->id)
                ->whereNotNull('approved_by_brand')
                ->whereNotNull('approved_by_marketing')
                ->whereNotNull('approved_by_commercial')
                ->whereNotNull('approved_by_bod')
                ->where('decision_rd', 'approved')
                ->exists();
        }

        if (!$fabkApproved) {
            return [
                'allowed' => false,
                'reason' => 'Form Approval Bahan Kemas (FABK) belum disetujui sepenuhnya.'
            ];
        }

        // Cek apakah ada sirkulasi artwork yang sedang berjalan atau ditolak
        // Jika ada workflow artwork, pastikan statusnya approved
        $artworkWorkflow = ApprovalWorkflow::where('project_id', $project->id)
            ->where('type', 'artwork')
            ->latest()
            ->first();

        if ($artworkWorkflow && $artworkWorkflow->status !== 'approved') {
            return [
                'allowed' => false,
                'reason' => 'Sirkulasi Artwork/CRB belum selesai/disetujui. Selesaikan sirkulasi Artwork terlebih dahulu.'
            ];
        }

        return ['allowed' => true, 'reason' => null];
    }

    /**
     * Mendapatkan ringkasan status gating untuk sebuah project.
     * Berguna untuk ditampilkan di UI sebagai checklist.
     */
    public static function getGatingSummary(Project $project): array
    {
        $conceptWorkflow = ApprovalWorkflow::where('project_id', $project->id)
            ->where('type', 'concept')
            ->latest()
            ->first();

        $drawingWorkflow = ApprovalWorkflow::where('project_id', $project->id)
            ->where('type', 'drawing')
            ->latest()
            ->first();

        // Cari FABK terbaru yang terkait project ini
        if ($project->type === 'Substitusi') {
            $fabk = \App\Models\SubstitutionApproval::where('project_id', $project->id)->latest()->first();
            $fabkApproved = $fabk && $fabk->status === 'approved';
        } else {
            $fabk = PackagingApproval::where('project_id', $project->id)->latest()->first();
            $fabkApproved = $fabk && $fabk->isFullyApproved();
        }

        $artworkWorkflow = ApprovalWorkflow::where('project_id', $project->id)
            ->where('type', 'artwork')
            ->latest()
            ->first();

        $isNpdEpd = in_array($project->type, ['NPD', 'EPD']);

        $summary = [];

        if ($isNpdEpd) {
            $summary['concept'] = [
                'label' => 'Evaluasi Konsep (BOD)',
                'status' => $conceptWorkflow?->status ?? 'not_started',
                'completed' => $conceptWorkflow?->status === 'approved',
                'blocked' => false,
            ];
            $summary['drawing'] = [
                'label' => 'Technical Drawing Approval',
                'status' => $drawingWorkflow?->status ?? 'not_started',
                'completed' => $drawingWorkflow?->status === 'approved',
                'blocked' => !($conceptWorkflow?->status === 'approved'),
            ];
        }

        $summary['fabk'] = [
            'label' => 'Form Approval Bahan Kemas (FABK)',
            'status' => $fabk ? ($fabkApproved ? 'approved' : 'in_progress') : 'not_started',
            'completed' => $fabkApproved,
            'blocked' => $isNpdEpd ? !($drawingWorkflow?->status === 'approved') : false,
            'document_id' => $fabk?->id ?? null,
        ];

        $summary['artwork'] = [
            'label' => 'Sirkulasi Artwork/CRB (Khusus Sekunder/Tersier)',
            'status' => $artworkWorkflow?->status ?? 'not_started',
            'completed' => $artworkWorkflow?->status === 'approved',
            'blocked' => !$fabkApproved,
        ];

        $summary['scale_up'] = [
            'label' => 'Scale Up',
            'status' => 'check_separately',
            'completed' => false,
            'blocked' => !$fabkApproved || ($artworkWorkflow && $artworkWorkflow->status !== 'approved'),
        ];

        // Calculate automatic progress based on completed gates
        $totalGates = count($summary);
        $completedGates = 0;
        foreach ($summary as $gate) {
            if ($gate['completed']) {
                $completedGates++;
            }
        }
        $summary['overall_progress'] = $totalGates > 0 ? round(($completedGates / $totalGates) * 100) : 0;

        return $summary;
    }
}
