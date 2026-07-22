<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackagingCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];
    public function masterSpecs()
    {
        return $this->hasMany(MasterPackagingSpec::class, 'tipe', 'name');
    }
}
