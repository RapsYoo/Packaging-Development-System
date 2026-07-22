<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackagingApproval extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id', 'document_no', 'product_name', 'packaging_type', 'supplier', 'document_date',
        'attachment_file',
        'status', 'created_by',
        'checked_by_rd', 'checked_at_rd', 'decision_rd', 'notes_rd',
        'approved_by_brand', 'approved_at_brand',
        'approved_by_marketing', 'approved_at_marketing',
        'approved_by_commercial', 'approved_at_commercial',
        'approved_by_bod', 'approved_at_bod',
        'rejection_reason',
    ];

    protected $casts = [
        'document_date' => 'date',
        'checked_at_rd' => 'datetime',
        'approved_at_brand' => 'datetime',
        'approved_at_marketing' => 'datetime',
        'approved_at_commercial' => 'datetime',
        'approved_at_bod' => 'datetime',
    ];

    // ── Relationships ──

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function approverRd()
    {
        return $this->belongsTo(User::class, 'checked_by_rd');
    }

    public function approverBrand()
    {
        return $this->belongsTo(User::class, 'approved_by_brand');
    }

    public function approverMarketing()
    {
        return $this->belongsTo(User::class, 'approved_by_marketing');
    }

    public function approverCommercial()
    {
        return $this->belongsTo(User::class, 'approved_by_commercial');
    }

    public function approverBod()
    {
        return $this->belongsTo(User::class, 'approved_by_bod');
    }

    // ── Helper Methods ──

    public static function generateCode(): string
    {
        $year = date('Y');
        $month = date('m');
        $prefix = 'FABK';

        $last = self::withTrashed()
            ->where('document_no', 'like', "{$prefix}-{$year}{$month}-%")
            ->orderBy('document_no', 'desc')
            ->first();

        $sequence = 1;
        if ($last) {
            $parts = explode('-', $last->document_no);
            $sequence = intval(end($parts)) + 1;
        }

        return sprintf('%s-%s%s-%03d', $prefix, $year, $month, $sequence);
    }

    public function isFullyApproved(): bool
    {
        // Brand Innovation dan Commercial Director tidak lagi wajib di sistem
        return $this->decision_rd === 'approved'
            && $this->approved_by_marketing !== null
            && $this->approved_by_bod !== null;
    }

    public function isRejected(): bool
    {
        return $this->decision_rd === 'rejected'; 
    }

    public function getApprovalProgressAttribute(): array
    {
        $total = 3; // RD, Marketing, BOD (Brand dan Commercial diabaikan di sistem)
        $approved = 0;
        
        if ($this->decision_rd === 'approved') $approved++;
        if ($this->approved_by_marketing) $approved++;
        if ($this->approved_by_bod) $approved++;

        return [
            'total' => $total,
            'approved' => $approved,
            'pending' => $total - $approved,
        ];
    }
}
