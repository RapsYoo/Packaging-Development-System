<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SupplierTrial;
use App\Models\SupplierEvaluation;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();
        
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $suppliers = $query->orderBy('name', 'asc')->paginate(15)->withQueryString();
        
        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Suppliers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'capacity' => 'nullable|string',
        ]);

        $supplier = Supplier::create([
            'name' => $request->name,
            'code' => Supplier::generateCode(),
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'category' => $request->category,
            'capacity' => $request->capacity,
            'status' => 'active',
        ]);

        AuditService::log('create', 'Supplier', $supplier->id, null, $supplier->toArray());

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function show(Supplier $supplier)
    {
        $supplier->load([
            'evaluations' => fn($q) => $q->orderBy('created_at', 'desc')->take(5),
            'trials' => fn($q) => $q->orderBy('created_at', 'desc')->take(5),
            'quotations' => fn($q) => $q->orderBy('created_at', 'desc')->take(5),
        ]);
        
        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier
        ]);
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'capacity' => 'nullable|string',
            'status' => 'required|in:active,inactive,blacklisted',
        ]);

        $oldValues = $supplier->toArray();
        $supplier->update($request->all());

        AuditService::log('update', 'Supplier', $supplier->id, $oldValues, $supplier->fresh()->toArray());

        return redirect()->route('suppliers.show', $supplier)->with('success', 'Data supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier)
    {
        AuditService::log('delete', 'Supplier', $supplier->id, $supplier->toArray());
        $supplier->delete();
        
        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil dihapus.');
    }

    // --- Trials & Pitching ---
    public function storeTrial(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'project_id' => 'nullable|exists:projects,id',
            'description' => 'nullable|string',
            'sample_file' => 'nullable|file|max:10240',
            'profile_file' => 'nullable|file|max:10240',
        ]);

        $data = $request->only(['supplier_id', 'project_id', 'description']);
        $data['status'] = 'pending';

        if ($request->hasFile('sample_file')) {
            $data['sample_file'] = $request->file('sample_file')->store('suppliers/trials/samples', 'public');
        }
        
        if ($request->hasFile('profile_file')) {
            $data['profile_file'] = $request->file('profile_file')->store('suppliers/trials/profiles', 'public');
        }

        $trial = SupplierTrial::create($data);

        AuditService::log('create', 'SupplierTrial', $trial->id);

        return back()->with('success', 'Trial sampel berhasil didaftarkan.');
    }

    public function reviewTrial(Request $request, SupplierTrial $supplierTrial)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'required|string',
        ]);

        $supplierTrial->update([
            'status' => $request->status,
            'review_notes' => $request->review_notes,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        AuditService::log('update', 'SupplierTrial', $supplierTrial->id, null, ['status' => $request->status]);

        return back()->with('success', 'Review trial berhasil disimpan.');
    }

    // --- Evaluations ---
    public function evaluate(Request $request, Supplier $supplier)
    {
        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'quality_score' => 'required|numeric|min:0|max:10',
            'delivery_score' => 'required|numeric|min:0|max:10',
            'notes' => 'nullable|string',
        ]);

        $evaluation = SupplierEvaluation::create([
            'supplier_id' => $supplier->id,
            'project_id' => $request->project_id,
            'quality_score' => $request->quality_score,
            'delivery_score' => $request->delivery_score,
            'notes' => $request->notes,
            'evaluated_by' => auth()->id(),
        ]);

        // Recalculate supplier average ratings
        $avgQuality = $supplier->evaluations()->avg('quality_score');
        $avgDelivery = $supplier->evaluations()->avg('delivery_score');
        
        $supplier->update([
            'quality_rating' => $avgQuality,
            'delivery_rating' => $avgDelivery,
        ]);

        AuditService::log('create', 'SupplierEvaluation', $evaluation->id);

        return back()->with('success', 'Evaluasi supplier berhasil disimpan dan rating telah diperbarui.');
    }
}
