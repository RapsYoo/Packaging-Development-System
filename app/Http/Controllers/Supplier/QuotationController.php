<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\Supplier;
use App\Models\Project;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index(Request $request)
    {
        $query = Quotation::with(['supplier', 'project', 'submitter']);
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $quotations = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        $suppliers = Supplier::where('status', 'active')->get(['id', 'name']);
        $projects = Project::active()->get(['id', 'code', 'title']);
        
        return Inertia::render('Suppliers/Quotations/Index', [
            'quotations' => $quotations,
            'suppliers' => $suppliers,
            'projects' => $projects,
            'filters' => $request->only(['status'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'project_id' => 'nullable|exists:projects,id',
            'price' => 'required|numeric|min:0',
            'moq' => 'nullable|integer|min:1',
            'lead_time' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $quotation = Quotation::create([
            'supplier_id' => $request->supplier_id,
            'project_id' => $request->project_id,
            'price' => $request->price,
            'moq' => $request->moq,
            'lead_time' => $request->lead_time,
            'notes' => $request->notes,
            'status' => 'pending',
            'submitted_by' => auth()->id(),
        ]);

        AuditService::log('create', 'Quotation', $quotation->id, null, $quotation->toArray());
        
        NotificationService::sendToRole('scm', 'Quotation Baru', "Quotation baru telah disubmit oleh supplier.", 'info', route('suppliers.quotations.index'));

        return back()->with('success', 'Quotation berhasil disubmit.');
    }

    public function review(Request $request, Quotation $quotation)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        $quotation->update([
            'status' => $request->status,
            'review_notes' => $request->review_notes,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        AuditService::log('update', 'Quotation', $quotation->id, null, ['status' => $request->status]);
        
        NotificationService::sendToUser($quotation->submitted_by, 'Update Quotation', "Quotation Anda telah di-{$request->status}.", 'info');

        return back()->with('success', 'Review quotation berhasil disimpan.');
    }
}
