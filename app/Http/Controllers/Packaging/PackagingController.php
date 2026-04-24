<?php

namespace App\Http\Controllers\Packaging;

use App\Http\Controllers\Controller;
use App\Models\PackagingItem;
use App\Models\SampleReview;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PackagingController extends Controller
{
    public function index(Request $request)
    {
        $query = PackagingItem::with('creator');
        
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        $items = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        return Inertia::render('Packaging/Items/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'type'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Packaging/Items/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:packaging_items,code',
            'type' => 'required|in:Primer,Sekunder,Tersier',
            'specification' => 'nullable|string',
            'dimensions' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:5120', // 5MB max
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('packaging', 'public');
        }

        $item = PackagingItem::create([
            'name' => $request->name,
            'code' => $request->code,
            'type' => $request->type,
            'specification' => $request->specification,
            'dimensions' => $request->dimensions,
            'material' => $request->material,
            'photo' => $photoPath,
            'status' => 'active',
            'created_by' => auth()->id(),
        ]);

        AuditService::log('create', 'PackagingItem', $item->id, null, $item->toArray());

        return redirect()->route('packaging.items.index')->with('success', 'Master kemasan berhasil ditambahkan.');
    }

    public function show(PackagingItem $item)
    {
        $item->load(['creator', 'standards', 'inspections' => function($q) {
            $q->orderBy('created_at', 'desc')->take(5);
        }]);
        
        return Inertia::render('Packaging/Items/Show', [
            'item' => $item
        ]);
    }

    public function edit(PackagingItem $item)
    {
        return Inertia::render('Packaging/Items/Edit', [
            'item' => $item
        ]);
    }

    public function update(Request $request, PackagingItem $item)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Primer,Sekunder,Tersier',
            'specification' => 'nullable|string',
            'dimensions' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:5120',
            'status' => 'required|in:active,inactive,draft',
        ]);

        $oldValues = $item->toArray();
        $data = $request->only(['name', 'type', 'specification', 'dimensions', 'material', 'status']);

        if ($request->hasFile('photo')) {
            if ($item->photo) {
                Storage::disk('public')->delete($item->photo);
            }
            $data['photo'] = $request->file('photo')->store('packaging', 'public');
        }

        $item->update($data);

        AuditService::log('update', 'PackagingItem', $item->id, $oldValues, $item->fresh()->toArray());

        return redirect()->route('packaging.items.show', $item)->with('success', 'Master kemasan berhasil diperbarui.');
    }

    public function destroy(PackagingItem $item)
    {
        AuditService::log('delete', 'PackagingItem', $item->id, $item->toArray());
        $item->delete();
        
        return redirect()->route('packaging.items.index')->with('success', 'Master kemasan berhasil dihapus.');
    }

    // --- Sample Reviews ---
    public function storeSample(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'type' => 'required|string',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB
            'photo' => 'nullable|image|max:5120',
        ]);

        $filePath = null;
        $photoPath = null;
        
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('samples/files', 'public');
        }
        
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('samples/photos', 'public');
        }

        $sample = SampleReview::create([
            'project_id' => $request->project_id,
            'type' => $request->type,
            'file_path' => $filePath,
            'photo' => $photoPath,
            'description' => $request->description,
            'status' => 'pending',
            'uploaded_by' => auth()->id(),
        ]);

        AuditService::log('create', 'SampleReview', $sample->id);

        return back()->with('success', 'Sampel berhasil diunggah untuk direview.');
    }

    public function reviewSample(Request $request, SampleReview $sampleReview)
    {
        $request->validate([
            'status' => 'required|in:ok,revision',
            'review_notes' => 'required|string',
        ]);

        $sampleReview->update([
            'status' => $request->status,
            'review_notes' => $request->review_notes,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        AuditService::log('update', 'SampleReview', $sampleReview->id, null, ['status' => $request->status]);

        return back()->with('success', 'Review sampel berhasil disimpan.');
    }
}
