<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'code', 'type', 'concept', 'target_cogs',
        'target_market', 'status', 'progress', 'created_by',
        'pic_id', 'deadline', 'notes',
    ];

    protected $casts = [
        'target_cogs' => 'decimal:2',
        'deadline' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pic()
    {
        return $this->belongsTo(User::class, 'pic_id');
    }

    public function phases()
    {
        return $this->hasMany(ProjectPhase::class)->orderBy('order');
    }

    public function attachments()
    {
        return $this->hasMany(ProjectAttachment::class);
    }

    public function approvalWorkflows()
    {
        return $this->hasMany(ApprovalWorkflow::class);
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    /**
     * Generate a unique project code.
     */
    public static function generateCode(string $type): string
    {
        $prefix = match($type) {
            'NPD' => 'NPD',
            'EPD' => 'EPD',
            'Substitusi' => 'SUB',
            default => 'PRJ',
        };

        $year = date('Y');
        $month = date('m');
        $lastProject = self::where('code', 'like', "{$prefix}-{$year}{$month}-%")
            ->orderBy('code', 'desc')
            ->first();

        $sequence = 1;
        if ($lastProject) {
            $parts = explode('-', $lastProject->code);
            $sequence = intval(end($parts)) + 1;
        }

        return sprintf('%s-%s%s-%03d', $prefix, $year, $month, $sequence);
    }

    /**
     * Check if project is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->deadline && $this->deadline->isPast() && !in_array($this->status, ['completed', 'cancelled', 'archived']);
    }

    /**
     * Scope for active projects.
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['completed', 'cancelled', 'archived']);
    }
}
