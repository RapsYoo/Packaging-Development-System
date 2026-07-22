<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubstitutionApproval extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'document_no',
        'product_name',
        'packaging_type',
        'supplier',
        'document_date',
        'alasan_pengajuan',
        'alasan_lainnya',
        'harga_penawaran',
        'harga_existing',
        'estimasi_lead_time',
        'attachment_files',
        'notes',
        'trial_analisa_data',
        'dimension_data',
        'rekomendasi',
        'catatan_rekomendasi',
        'ttd_packaging_dev_laporan',
        'ttd_qc_manager_laporan',
        'status_approval',
        'catatan_approval',
        'ttd_packaging_dev',
        'ttd_qc_supervisor',
        'ttd_qc_manager',
        'ttd_scm_manager',
        'ttd_qa_manager',
        'status',
        'created_by',
    ];

    protected $casts = [
        'document_date' => 'date',
        'attachment_files' => 'json',
        'trial_analisa_data' => 'json',
        'dimension_data' => 'json',
        'ttd_packaging_dev_laporan' => 'json',
        'ttd_qc_manager_laporan' => 'json',
        'ttd_packaging_dev' => 'json',
        'ttd_qc_supervisor' => 'json',
        'ttd_qc_manager' => 'json',
        'ttd_scm_manager' => 'json',
        'ttd_qa_manager' => 'json',
    ];

    protected $appends = ['status_doc_label', 'status_approval_label', 'current_pic'];

    /**
     * PDF-mapped document status label: Draft / Pending / Closed / Cancel
     */
    public function getStatusDocLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'submitted', 'in_review' => 'Pending',
            'approved' => 'Closed',
            'rejected' => 'Cancel',
            default => '-',
        };
    }

    /**
     * PDF-mapped approval status label: Waiting Approval / Approved / Reject Approval / -
     */
    public function getStatusApprovalLabelAttribute(): string
    {
        if ($this->status === 'draft') {
            return '-';
        }

        if ($this->status === 'approved') {
            return 'Approved';
        }

        if ($this->status === 'rejected') {
            return 'Reject Approval';
        }

        // submitted or in_review → check which stage
        if (in_array($this->status, ['submitted', 'in_review'])) {
            // Stage 1: still waiting for QC Supervisor check
            if (!$this->ttd_qc_supervisor) {
                return 'Waiting Approval';
            }
            // Stage 2: waiting for final approvers
            return 'Waiting Approval';
        }

        return '-';
    }

    /**
     * Current PIC (Person In Charge) based on workflow stage.
     */
    public function getCurrentPicAttribute(): string
    {
        if ($this->status === 'draft') {
            return 'Packaging Dev Staff';
        }

        if (in_array($this->status, ['submitted', 'in_review'])) {
            // Stage 1: QC Supervisor as checker
            if (!$this->ttd_qc_supervisor) {
                return 'QC Supervisor';
            }
            // Stage 2: determine which approver is next
            if (!$this->ttd_qc_manager) {
                return 'QC Manager';
            }
            if (!$this->ttd_scm_manager) {
                return 'SCM Manager';
            }
            if (!$this->ttd_qa_manager) {
                return 'QA Manager';
            }
        }

        return '-';
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public static function generateCode(): string
    {
        $year = date('Y');
        $prefix = 'SUB';

        $last = self::withTrashed()
            ->where('document_no', 'like', "{$prefix}-{$year}-%")
            ->orderBy('document_no', 'desc')
            ->first();

        $sequence = 1;
        if ($last) {
            $parts = explode('-', $last->document_no);
            $sequence = intval(end($parts)) + 1;
        }

        return sprintf('%s-%s-%04d', $prefix, $year, $sequence);
    }
}
