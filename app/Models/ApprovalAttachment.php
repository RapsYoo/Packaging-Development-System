<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id', 'step_id', 'file_name', 'file_path',
        'file_type', 'file_size', 'version', 'uploaded_by',
    ];

    public function workflow()
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function step()
    {
        return $this->belongsTo(ApprovalStep::class, 'step_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
