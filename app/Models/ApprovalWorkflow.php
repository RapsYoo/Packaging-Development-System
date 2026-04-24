<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApprovalWorkflow extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id', 'reference_type', 'reference_id', 'type',
        'status', 'current_step', 'total_steps', 'initiated_by',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function steps()
    {
        return $this->hasMany(ApprovalStep::class, 'workflow_id')->orderBy('step_order');
    }

    public function currentStepDetail()
    {
        return $this->hasOne(ApprovalStep::class, 'workflow_id')
            ->where('step_order', $this->current_step);
    }

    public function attachments()
    {
        return $this->hasMany(ApprovalAttachment::class, 'workflow_id');
    }

    /**
     * Advance to the next step or mark as completed.
     */
    public function advanceStep(): void
    {
        if ($this->current_step < $this->total_steps) {
            $this->increment('current_step');
            $this->update(['status' => 'in_progress']);
        } else {
            $this->update(['status' => 'approved']);
        }
    }

    /**
     * Reject the workflow.
     */
    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }
}
