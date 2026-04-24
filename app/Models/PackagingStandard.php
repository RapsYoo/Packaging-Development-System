<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackagingStandard extends Model
{
    use HasFactory;

    protected $fillable = [
        'packaging_item_id', 'version', 'content',
        'file_path', 'is_active', 'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function packagingItem()
    {
        return $this->belongsTo(PackagingItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
