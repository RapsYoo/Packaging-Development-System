<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id', 'step_order', 'role_required',
        'assigned_to', 'status', 'comment', 'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function workflow()
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function attachments()
    {
        return $this->hasMany(ApprovalAttachment::class, 'step_id');
    }
}
