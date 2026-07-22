<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScaleUp extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'project_id', 'master_spec_id',
        'packaging_category', 'material_name', 'material_type', 'description',
        'bentuk', 'warna_dasar', 'warna_cetakan',
        'tebal', 'diameter_dalam', 'diameter_luar', 'panjang_selang',
        'berat', 'test_kebocoran', 'test_kekuatan',
        'kesesuaian_desain', 'kesesuaian_teks',
        'metode_bentuk', 'metode_warna', 'metode_dimensi',
        'metode_berat', 'metode_kebocoran', 'metode_kekuatan', 'metode_kesesuaian',
        'proofprint_notes', 'proofprint_file', 'master_product_notes',
        'status', 'document_number', 'valid_date',
        'created_by', 'checked_by', 'approved_by',
        'checked_at', 'approved_at', 'rejection_reason',
    ];

    protected $casts = [
        'valid_date' => 'date',
        'checked_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // ── Relationships ──

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function masterSpec()
    {
        return $this->belongsTo(MasterPackagingSpec::class, 'master_spec_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checker()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ── Helpers ──

    public static function generateCode(): string
    {
        $year = now()->year;
        $lastCode = static::withTrashed()
            ->where('code', 'like', "SU-{$year}-%")
            ->orderByDesc('code')
            ->value('code');

        if ($lastCode) {
            $lastNum = (int) substr($lastCode, -3);
            $nextNum = $lastNum + 1;
        } else {
            $nextNum = 1;
        }

        return sprintf("SU-%d-%03d", $year, $nextNum);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'draft' => 'Draft',
            'in_review' => 'Dalam Review',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'published' => 'Diterbitkan',
            default => $this->status,
        };
    }
}
