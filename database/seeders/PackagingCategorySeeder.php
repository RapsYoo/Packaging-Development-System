<?php

namespace Database\Seeders;

use App\Models\PackagingCategory;
use Illuminate\Database\Seeder;

class PackagingCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Premier',
                'description' => 'Kemasan primer yang bersentuhan langsung dengan produk (botol, tube, sachet, dll).',
            ],
            [
                'name' => 'Sekunder',
                'description' => 'Kemasan sekunder sebagai pelindung/pengelompok kemasan primer (box, carton, display, dll).',
            ],
            [
                'name' => 'Tersier',
                'description' => 'Kemasan tersier untuk pengiriman dan penyimpanan (pallet, shrink wrap, corrugated box, dll).',
            ],
        ];

        foreach ($categories as $category) {
            PackagingCategory::updateOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}
