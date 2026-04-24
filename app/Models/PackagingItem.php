<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackagingItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'code', 'type', 'specification', 'dimensions',
        'material', 'photo', 'status', 'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function standards()
    {
        return $this->hasMany(PackagingStandard::class);
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    public function activeStandard()
    {
        return $this->hasOne(PackagingStandard::class)->where('is_active', true)->latestOfMany();
    }
}
