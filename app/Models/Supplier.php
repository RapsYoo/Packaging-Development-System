<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'code', 'contact_person', 'email', 'phone',
        'address', 'category', 'capacity', 'status',
        'quality_rating', 'delivery_rating',
    ];

    protected $casts = [
        'quality_rating' => 'decimal:1',
        'delivery_rating' => 'decimal:1',
    ];

    public function trials()
    {
        return $this->hasMany(SupplierTrial::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function evaluations()
    {
        return $this->hasMany(SupplierEvaluation::class);
    }

    public function averageRating(): float
    {
        return ($this->quality_rating + $this->delivery_rating) / 2;
    }

    public static function generateCode(): string
    {
        $last = self::withTrashed()->orderBy('id', 'desc')->first();
        $sequence = $last ? $last->id + 1 : 1;
        return sprintf('SUP-%04d', $sequence);
    }
}
