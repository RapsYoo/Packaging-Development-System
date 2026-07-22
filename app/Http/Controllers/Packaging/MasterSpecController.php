<?php

namespace App\Http\Controllers\Packaging;

use App\Http\Controllers\Controller;
use App\Models\MasterPackagingSpec;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterSpecController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterPackagingSpec::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('item_name_fg', 'like', "%{$s}%")
                  ->orWhere('item_code_fg', 'like', "%{$s}%")
                  ->orWhere('item_name_rm', 'like', "%{$s}%")
                  ->orWhere('item_code_rm', 'like', "%{$s}%")
                  ->orWhere('supplier', 'like', "%{$s}%");
            });
        }

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        if ($request->filled('fg_code')) {
            $query->where('item_code_fg', $request->fg_code);
        }

        $specs = $query->orderBy('item_code_fg')->orderBy('id')->paginate(25)->withQueryString();

        // Get unique FG products for filter dropdown
        $products = MasterPackagingSpec::select('item_code_fg', 'item_name_fg')
            ->distinct()
            ->orderBy('item_code_fg')
            ->get();

        // Get unique groups
        $groups = MasterPackagingSpec::select('group')
            ->distinct()
            ->whereNotNull('group')
            ->where('group', '!=', '')
            ->pluck('group');

        return Inertia::render('Packaging/MasterSpec/Index', [
            'specs' => $specs,
            'products' => $products,
            'groups' => $groups,
            'filters' => $request->only(['search', 'group', 'fg_code']),
        ]);
    }
}
