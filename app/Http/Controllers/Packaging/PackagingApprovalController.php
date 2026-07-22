<?php

namespace App\Http\Controllers\Packaging;

use App\Http\Controllers\Controller;
use App\Models\PackagingApproval;
use App\Models\Project;
use App\Models\PackagingItem;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PackagingApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = PackagingApproval::with(['creator'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('packaging_type', 'like', '%' . $request->category . '%');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('document_no', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('packaging_type', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        $packagingApprovals = $query->paginate(15)->withQueryString();

        return Inertia::render('PackagingApproval/Index', [
            'packagingApprovals' => $packagingApprovals,
            'filters' => $request->only(['search', 'status', 'category']),
        ]);
    }

    public function create(Request $request)
    {
        $projects = Project::where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'code', 'title', 'type']);
            
        return Inertia::render('PackagingApproval/Create', [
            'projects' => $projects,
            'preselectedProject' => $request->project_id
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'document_date' => 'required|date',
            'product_name' => 'required|string|max:255',
            'packaging_type' => 'required|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'attachment_file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        $project = Project::findOrFail($request->project_id);
        $gating = \App\Services\GatingService::canCreateFABK($project);
        if (!$gating['allowed']) {
            return back()->with('error', $gating['reason']);
        }

        $validated['document_no'] = PackagingApproval::generateCode();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'draft';

        if ($request->hasFile('attachment_file')) {
            $validated['attachment_file'] = $request->file('attachment_file')
                ->store('packaging-approvals', 'public');
        }

        $approval = PackagingApproval::create($validated);

        AuditService::log('create', 'PackagingApproval', $approval->id, null, $approval->toArray(),
            "Membuat Form Approval Bahan Kemas {$approval->document_no}");

        return redirect()->route('packaging-approvals.show', $approval)
            ->with('success', "Form Approval Bahan Kemas {$approval->document_no} berhasil dibuat.");
    }

    public function show(PackagingApproval $packagingApproval)
    {
        $packagingApproval->load([
            'creator', 'approverRd', 'approverBrand', 'approverMarketing', 'approverCommercial', 'approverBod',
        ]);

        return Inertia::render('PackagingApproval/Show', [
            'approval' => $packagingApproval,
            'approvalProgress' => $packagingApproval->approval_progress,
        ]);
    }

    public function edit(PackagingApproval $packagingApproval)
    {
        if (!in_array($packagingApproval->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Form hanya bisa diedit saat berstatus Draft atau Ditolak.');
        }

        $projects = Project::where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'code', 'title', 'type']);

        return Inertia::render('PackagingApproval/Edit', [
            'approval' => $packagingApproval,
            'projects' => $projects,
        ]);
    }

    public function update(Request $request, PackagingApproval $packagingApproval)
    {
        if (!in_array($packagingApproval->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Form hanya bisa diedit saat berstatus Draft atau Ditolak.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'document_date' => 'required|date',
            'product_name' => 'required|string|max:255',
            'packaging_type' => 'required|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'attachment_file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        if ($request->hasFile('attachment_file')) {
            if ($packagingApproval->attachment_file) {
                Storage::disk('public')->delete($packagingApproval->attachment_file);
            }
            $validated['attachment_file'] = $request->file('attachment_file')
                ->store('packaging-approvals', 'public');
        }

        if ($packagingApproval->status === 'rejected') {
            $validated['status'] = 'draft';
            $validated['decision_rd'] = 'pending';
            $validated['checked_by_rd'] = null;
            $validated['checked_at_rd'] = null;
            $validated['notes_rd'] = null;
            $validated['approved_by_brand'] = null;
            $validated['approved_at_brand'] = null;
            $validated['approved_by_marketing'] = null;
            $validated['approved_at_marketing'] = null;
            $validated['approved_by_commercial'] = null;
            $validated['approved_at_commercial'] = null;
            $validated['approved_by_bod'] = null;
            $validated['approved_at_bod'] = null;
            $validated['rejection_reason'] = null;
        }

        $old = $packagingApproval->toArray();
        $packagingApproval->update($validated);

        AuditService::log('update', 'PackagingApproval', $packagingApproval->id, $old, $packagingApproval->toArray(),
            "Mengupdate Form Approval Bahan Kemas {$packagingApproval->document_no}");

        return redirect()->route('packaging-approvals.show', $packagingApproval)
            ->with('success', 'Form berhasil diperbarui.');
    }

    public function submit(PackagingApproval $packagingApproval)
    {
        if ($packagingApproval->status !== 'draft') {
            return back()->with('error', 'Hanya form berstatus Draft yang bisa diajukan.');
        }

        $packagingApproval->update(['status' => 'submitted']);

        AuditService::log('update', 'PackagingApproval', $packagingApproval->id, null, null,
            "Mengajukan Form Approval Bahan Kemas {$packagingApproval->document_no} untuk review");

        NotificationService::sendToRoles(
            ['rd', 'marketing', 'bod'],
            'Form Approval Bahan Kemas',
            "Form {$packagingApproval->document_no} menunggu persetujuan Anda.",
            'info',
            route('packaging-approvals.show', $packagingApproval)
        );

        return back()->with('success', 'Form berhasil diajukan untuk review.');
    }

    public function decide(Request $request, PackagingApproval $packagingApproval)
    {
        $request->validate([
            'role_action' => 'required|string',
            'decision' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        $userRole = auth()->user()->role->slug;
        $roleAction = $request->role_action; // rd, brand, marketing, commercial, bod
        $decision = $request->decision;
        $notes = $request->notes;

        // Permissions mapping
        $canApprove = false;
        if ($userRole === 'admin') {
            $canApprove = true;
        } else {
            if ($roleAction === 'rd' && $userRole === 'rd') $canApprove = true;
            if ($roleAction === 'brand' && $userRole === 'marketing') $canApprove = true;
            if ($roleAction === 'marketing' && $userRole === 'marketing') $canApprove = true;
            if ($roleAction === 'commercial' && in_array($userRole, ['bod', 'marketing'])) $canApprove = true;
            if ($roleAction === 'bod' && $userRole === 'bod') $canApprove = true;
        }

        if (!$canApprove) {
            return back()->with('error', 'Anda tidak memiliki hak untuk menyetujui sebagai role tersebut.');
        }

        $updates = [];
        if ($roleAction === 'rd') {
            $updates['decision_rd'] = $decision;
            $updates['checked_by_rd'] = auth()->id();
            $updates['checked_at_rd'] = now();
            $updates['notes_rd'] = $notes;
        } else {
            // For other roles, decision "rejected" means overall rejection. "approved" just signs it.
            $column_by = "approved_by_{$roleAction}";
            $column_at = "approved_at_{$roleAction}";
            $updates[$column_by] = auth()->id();
            $updates[$column_at] = now();
        }

        $packagingApproval->update($updates);

        $roleName = strtoupper($roleAction);
        AuditService::log('update', 'PackagingApproval', $packagingApproval->id, null, null,
            "{$roleName} memberikan keputusan/tanda tangan pada Form {$packagingApproval->document_no}");

        if ($decision === 'rejected') {
            $packagingApproval->update([
                'status' => 'rejected',
                'rejection_reason' => "Ditolak oleh {$roleName}: " . ($notes ?: 'Tanpa alasan.'),
            ]);
            return back()->with('success', "Form ditolak oleh {$roleName}.");
        }

        $packagingApproval->refresh();
        if ($packagingApproval->isFullyApproved()) {
            $packagingApproval->update(['status' => 'approved']);

            NotificationService::sendToRoles(
                ['scm', 'rd'],
                'Form Approval Disetujui',
                "Form {$packagingApproval->document_no} telah disetujui sepenuhnya.",
                'success',
                route('packaging-approvals.show', $packagingApproval)
            );

            return back()->with('success', 'Form telah disetujui oleh semua pihak!');
        }

        return back()->with('success', "Keputusan/Tanda tangan {$roleName} berhasil disimpan.");
    }

    public function destroy(PackagingApproval $packagingApproval)
    {
        if (!in_array($packagingApproval->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Hanya form berstatus Draft atau Ditolak yang bisa dihapus.');
        }

        AuditService::log('delete', 'PackagingApproval', $packagingApproval->id,
            $packagingApproval->toArray(), null,
            "Menghapus Form Approval Bahan Kemas {$packagingApproval->document_no}");

        $packagingApproval->delete();

        return redirect()->route('packaging-approvals.index')
            ->with('success', 'Form Approval Bahan Kemas berhasil dihapus.');
    }

    public function print(PackagingApproval $packagingApproval)
    {
        $packagingApproval->load(['creator', 'approverRd', 'approverBrand', 'approverMarketing', 'approverCommercial', 'approverBod']);
        
        return view('pdf.packaging-approval', [
            'approval' => $packagingApproval
        ]);
    }
}
