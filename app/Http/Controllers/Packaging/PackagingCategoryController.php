<?php

namespace App\Http\Controllers\Packaging;

use App\Http\Controllers\Controller;
use App\Models\PackagingCategory;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackagingCategoryController extends Controller
{
    public function index()
    {
        $categories = PackagingCategory::withCount('masterSpecs as items_count')
            ->orderBy('id')
            ->get();

        return Inertia::render('Packaging/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, PackagingCategory $category)
    {
        $request->validate([
            'description' => 'nullable|string|max:500',
        ]);

        $old = $category->toArray();
        $category->update([
            'description' => $request->description,
        ]);

        AuditService::log('update', 'PackagingCategory', $category->id, $old, $category->fresh()->toArray(),
            "Memperbarui kategori kemasan {$category->name}");

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }
}
