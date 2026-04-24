<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id', 'project_id', 'quality_score',
        'delivery_score', 'notes', 'evaluated_by',
    ];

    protected $casts = [
        'quality_score' => 'decimal:1',
        'delivery_score' => 'decimal:1',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
