<?php

namespace App\Services;

use App\Models\ApprovalWorkflow;
use App\Models\PackagingApproval;
use App\Models\Project;
use App\Models\ScaleUp;
use App\Models\SubstitutionApproval;

/**
 * Hard Gating Rules Service
 * 
 * Aturan sesuai alur aktual:
 * NPD/EPD: Concept -> Technical Drawing -> FABK -> [Artwork (sekunder)] -> Scale Up
 * Substitusi: FABK -> [Artwork (sekunder/tersier)] -> Scale Up / Pembuatan Standar
 */
class GatingService
{
    /**
     * Cek apakah Technical Drawing Approval bisa dimulai.
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
     */
    public static function canStartArtworkApproval(Project $project): array
    {
        if ($project->type === 'Substitusi') {
            $fabk = SubstitutionApproval::where('project_id', $project->id)->latest()->first();
            if ($fabk && $fabk->packaging_type === 'Primer') {
                return [
                    'allowed' => false,
                    'reason' => 'Proyek Substitusi Kemasan Primer tidak memerlukan Sirkulasi Artwork/CRB.'
                ];
            }
            $fabkApproved = $fabk && $fabk->status === 'approved';
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
     * Cek apakah Scale Up / Pembuatan Standar bisa dibuat untuk project ini.
     */
    public static function canCreateScaleUp(Project $project): array
    {
        if ($project->type === 'Substitusi') {
            $fabk = SubstitutionApproval::where('project_id', $project->id)->latest()->first();
            if (!$fabk || $fabk->status !== 'approved') {
                return [
                    'allowed' => false,
                    'reason' => 'Form Approval Bahan Kemas (FABK) belum disetujui sepenuhnya.'
                ];
            }

            if ($fabk->packaging_type === 'Primer') {
                return ['allowed' => true, 'reason' => null];
            }

            $artworkWorkflow = ApprovalWorkflow::where('project_id', $project->id)
                ->where('type', 'artwork')
                ->latest()
                ->first();

            if ($artworkWorkflow && $artworkWorkflow->status !== 'approved') {
                return [
                    'allowed' => false,
                    'reason' => 'Sirkulasi Artwork/CRB (Khusus Sekunder/Tersier) belum selesai/disetujui.'
                ];
            }

            return ['allowed' => true, 'reason' => null];
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

        $isSubstitusi = $project->type === 'Substitusi';
        $isSubstitusiPrimer = false;

        if ($isSubstitusi) {
            $fabk = SubstitutionApproval::where('project_id', $project->id)->latest()->first();
            $fabkApproved = $fabk && $fabk->status === 'approved';
            $isSubstitusiPrimer = $fabk && $fabk->packaging_type === 'Primer';
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

        if ($isSubstitusiPrimer) {
            $summary['artwork'] = [
                'label' => 'Sirkulasi Artwork/CRB (Tidak Diperlukan untuk Kemasan Primer)',
                'status' => 'not_applicable',
                'completed' => true,
                'blocked' => false,
                'not_applicable' => true,
            ];
        } else {
            $summary['artwork'] = [
                'label' => 'Sirkulasi Artwork/CRB (Khusus Sekunder/Tersier)',
                'status' => $artworkWorkflow?->status ?? 'not_started',
                'completed' => $artworkWorkflow?->status === 'approved',
                'blocked' => !$fabkApproved,
            ];
        }

        $scaleUpBlocked = !$fabkApproved;
        if (!$isSubstitusiPrimer) {
            $scaleUpBlocked = $scaleUpBlocked || ($artworkWorkflow && $artworkWorkflow->status !== 'approved');
        }

        $scaleUp = ScaleUp::where('project_id', $project->id)->latest()->first();
        $scaleUpStatus = $scaleUp ? ($scaleUp->status === 'completed' ? 'approved' : $scaleUp->status) : 'not_started';
        $scaleUpCompleted = $scaleUp && in_array($scaleUp->status, ['completed', 'approved']);

        $summary['scale_up'] = [
            'label' => $isSubstitusi ? 'Pembuatan Standar (Color Standard & Master Data)' : 'Scale Up & Mass Production',
            'status' => $scaleUpStatus,
            'completed' => $scaleUpCompleted,
            'blocked' => $scaleUpBlocked,
            'document_id' => $scaleUp?->id ?? null,
        ];

        // Calculate automatic progress based on completed gates
        $totalGates = 0;
        $completedGates = 0;
        foreach ($summary as $gate) {
            if (!empty($gate['not_applicable'])) {
                continue;
            }
            $totalGates++;
            if ($gate['completed']) {
                $completedGates++;
            }
        }
        $summary['overall_progress'] = $totalGates > 0 ? round(($completedGates / $totalGates) * 100) : 0;

        return $summary;
    }
}
