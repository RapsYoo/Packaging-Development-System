<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_id', 'project_id', 'conditions',
        'findings', 'recommendations', 'tester_id',
    ];

    protected $casts = [
        'conditions' => 'array',
    ];

    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function tester()
    {
        return $this->belongsTo(User::class, 'tester_id');
    }
}
