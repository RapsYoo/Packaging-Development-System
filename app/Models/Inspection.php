<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inspection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'master_spec_id', 'project_id', 'type', 'checklist',
        'result', 'notes', 'photos', 'inspector_id',
    ];

    protected $casts = [
        'checklist' => 'array',
        'photos' => 'array',
    ];

    public function masterSpec()
    {
        return $this->belongsTo(MasterPackagingSpec::class, 'master_spec_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function transportTests()
    {
        return $this->hasMany(TransportTest::class);
    }
}
