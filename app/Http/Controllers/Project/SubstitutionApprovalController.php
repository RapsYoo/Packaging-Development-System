<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\SubstitutionApproval;
use App\Models\Project;
use App\Models\User;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubstitutionApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = SubstitutionApproval::with(['creator', 'project'])
            ->orderBy('created_at', 'desc');
            
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('document_no', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%");
            });
        }
        
        $approvals = $query->paginate(15)->withQueryString();
        
        return Inertia::render('SubstitutionApproval/Index', [
            'approvals' => $approvals,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        // Get active Substitusi projects
        $projects = Project::where('type', 'Substitusi')
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'code', 'title']);

        // Get active internal users who can be assigned as PIC or signers
        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');

        $masterSpecs = \App\Models\MasterPackagingSpec::select('id', 'item_code_fg', 'item_name_fg', 'item_code_rm', 'item_name_rm', 'supplier', 'tipe')
            ->orderBy('item_name_fg')
            ->orderBy('item_name_rm')
            ->get();

        return Inertia::render('SubstitutionApproval/Create', [
            'projects' => $projects,
            'users' => $users,
            'masterSpecs' => $masterSpecs,
            'nextDocumentNo' => SubstitutionApproval::generateCode()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'product_name' => 'required|string|max:255',
            'packaging_type' => 'required|in:Primer,Sekunder,Tersier',
            'supplier' => 'required|string|max:255',
            'document_date' => 'required|date',
            
            // Step 1: Alasan & Komersial
            'alasan_pengajuan' => 'required|string',
            'alasan_lainnya' => 'nullable|string',
            'harga_penawaran' => 'nullable|numeric|min:0',
            'harga_existing' => 'nullable|numeric|min:0',
            'estimasi_lead_time' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'attachment_files' => 'nullable|array',
            
            // Step 2: Trial Analisa & Lampiran Dimensi
            'trial_analisa_data' => 'nullable|array',
            'dimension_data' => 'nullable|array',
            'rekomendasi' => 'nullable|in:MS,TMS',
            'catatan_rekomendasi' => 'nullable|string',
            
            // Step 2 Ttd
            'ttd_packaging_dev_laporan' => 'nullable|array',
            'ttd_qc_manager_laporan' => 'nullable|array',
            
            // Step 3
            'status_approval' => 'nullable|in:accepted,rejected',
            'catatan_approval' => 'nullable|string',
        ]);

        $validated['document_no'] = SubstitutionApproval::generateCode();
        $validated['created_by'] = auth()->id();
        $validated['status'] = $request->has('save_draft') && $request->save_draft ? 'draft' : 'submitted';

        $approval = SubstitutionApproval::create($validated);

        AuditService::log('create', 'SubstitutionApproval', $approval->id, null, $approval->toArray(), 
            "Membuat Form Substitusi Bahan Kemas {$approval->document_no}");

        return redirect()->route('substitusi-approvals.show', $approval)
            ->with('success', 'Form Substitusi berhasil disimpan.');
    }

    public function show(SubstitutionApproval $substitutionApproval)
    {
        $substitutionApproval->load(['creator', 'project']);
        return Inertia::render('SubstitutionApproval/Show', [
            'approval' => $substitutionApproval
        ]);
    }

    public function edit(SubstitutionApproval $substitutionApproval)
    {
        if ($substitutionApproval->status === 'approved' || $substitutionApproval->status === 'rejected') {
            return redirect()->route('substitusi-approvals.show', $substitutionApproval)
                ->with('error', 'Form yang sudah selesai sirkulasi tidak dapat diubah.');
        }

        $projects = Project::where('type', 'Substitusi')
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'code', 'title']);

        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');

        $masterSpecs = \App\Models\MasterPackagingSpec::select('id', 'item_code_fg', 'item_name_fg', 'item_code_rm', 'item_name_rm', 'supplier', 'tipe')
            ->orderBy('item_name_fg')
            ->orderBy('item_name_rm')
            ->get();

        return Inertia::render('SubstitutionApproval/Edit', [
            'approval' => $substitutionApproval,
            'projects' => $projects,
            'users' => $users,
            'masterSpecs' => $masterSpecs,
        ]);
    }

    public function update(Request $request, SubstitutionApproval $substitutionApproval)
    {
        if ($substitutionApproval->status === 'approved' || $substitutionApproval->status === 'rejected') {
            return redirect()->route('substitusi-approvals.show', $substitutionApproval)
                ->with('error', 'Form yang sudah selesai sirkulasi tidak dapat diubah.');
        }

        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'product_name' => 'required|string|max:255',
            'packaging_type' => 'required|in:Primer,Sekunder,Tersier',
            'supplier' => 'required|string|max:255',
            'document_date' => 'required|date',
            
            // Step 1: Alasan & Komersial
            'alasan_pengajuan' => 'required|string',
            'alasan_lainnya' => 'nullable|string',
            'harga_penawaran' => 'nullable|numeric|min:0',
            'harga_existing' => 'nullable|numeric|min:0',
            'estimasi_lead_time' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'attachment_files' => 'nullable|array',
            
            // Step 2: Trial Analisa & Lampiran Dimensi
            'trial_analisa_data' => 'nullable|array',
            'dimension_data' => 'nullable|array',
            'rekomendasi' => 'nullable|in:MS,TMS',
            'catatan_rekomendasi' => 'nullable|string',
            
            // Step 2 Ttd
            'ttd_packaging_dev_laporan' => 'nullable|array',
            'ttd_qc_manager_laporan' => 'nullable|array',
            
            // Step 3
            'status_approval' => 'nullable|in:accepted,rejected',
            'catatan_approval' => 'nullable|string',
        ]);

        if ($request->has('save_draft') && !$request->save_draft && $substitutionApproval->status === 'draft') {
            $validated['status'] = 'submitted';
        }

        $old = $substitutionApproval->toArray();
        $substitutionApproval->update($validated);

        AuditService::log('update', 'SubstitutionApproval', $substitutionApproval->id, $old, $substitutionApproval->toArray(), 
            "Memperbarui Form Substitusi Bahan Kemas {$substitutionApproval->document_no}");

        return redirect()->route('substitusi-approvals.show', $substitutionApproval)
            ->with('success', 'Form Substitusi berhasil diperbarui.');
    }

    public function submit(SubstitutionApproval $substitutionApproval)
    {
        if ($substitutionApproval->status !== 'draft') {
            return back()->with('error', 'Hanya form berstatus Draft yang dapat dikirim.');
        }

        $substitutionApproval->update(['status' => 'submitted']);
        
        AuditService::log('update', 'SubstitutionApproval', $substitutionApproval->id, null, null, 
            "Mengirim Form Substitusi {$substitutionApproval->document_no} untuk sirkulasi approval");

        NotificationService::sendToRoles(
            ['qc', 'scm'], 
            'Form Substitusi Dikirim', 
            "Form Substitusi {$substitutionApproval->document_no} memerlukan peninjauan dan sirkulasi tanda tangan.",
            'info', 
            route('substitusi-approvals.show', $substitutionApproval)
        );

        return back()->with('success', 'Form berhasil dikirim untuk sirkulasi approval.');
    }

    public function decide(Request $request, SubstitutionApproval $substitutionApproval)
    {
        $request->validate([
            'role_type' => 'required|in:packaging_dev,qc_supervisor,qc_manager,scm_manager,qa_manager,packaging_dev_laporan,qc_manager_laporan',
            'signature' => 'required|string', // Base64 signature path data
            'name' => 'required|string', // Name of person signing
            'decision' => 'nullable|in:accepted,rejected', // only for step 3 approvers
            'notes' => 'nullable|string' // optional notes
        ]);

        $roleType = $request->role_type;
        $signature = $request->signature;
        $name = $request->name;
        $decision = $request->decision;
        $notes = $request->notes;

        $sigData = [
            'signature' => $signature,
            'name' => $name,
            'signed_at' => now()->toDateTimeString(),
            'user_id' => auth()->id()
        ];

        $updates = [];

        if ($roleType === 'packaging_dev_laporan') {
            $updates['ttd_packaging_dev_laporan'] = $sigData;
        } elseif ($roleType === 'qc_manager_laporan') {
            $updates['ttd_qc_manager_laporan'] = $sigData;
        } elseif ($roleType === 'packaging_dev') {
            $updates['ttd_packaging_dev'] = $sigData;
        } elseif ($roleType === 'qc_supervisor') {
            $updates['ttd_qc_supervisor'] = $sigData;
        } elseif ($roleType === 'qc_manager') {
            $updates['ttd_qc_manager'] = $sigData;
        } elseif ($roleType === 'scm_manager') {
            $updates['ttd_scm_manager'] = $sigData;
        } elseif ($roleType === 'qa_manager') {
            $updates['ttd_qa_manager'] = $sigData;
        }

        if ($decision) {
            $updates['status_approval'] = $decision;
            if ($notes) {
                $updates['catatan_approval'] = $notes;
            }
        }

        $substitutionApproval->update($updates);

        // Update overall status based on approvals
        $substitutionApproval->refresh();
        
        // Dibuat & Diperiksa Langkah 3, dan 3 kolom Disetujui
        $isStep3Done = $substitutionApproval->ttd_packaging_dev && 
                       $substitutionApproval->ttd_qc_supervisor && 
                       $substitutionApproval->ttd_qc_manager && 
                       $substitutionApproval->ttd_scm_manager && 
                       $substitutionApproval->ttd_qa_manager;

        if ($isStep3Done) {
            $finalStatus = ($substitutionApproval->status_approval === 'rejected') ? 'rejected' : 'approved';
            $substitutionApproval->update(['status' => $finalStatus]);
            
            AuditService::log('update', 'SubstitutionApproval', $substitutionApproval->id, null, null, 
                "Sirkulasi approval selesai untuk Form {$substitutionApproval->document_no} dengan hasil: {$finalStatus}");
        } else {
            if ($substitutionApproval->status === 'submitted') {
                $substitutionApproval->update(['status' => 'in_review']);
            }
        }

        return back()->with('success', 'Tanda tangan berhasil disimpan.');
    }

    public function destroy(SubstitutionApproval $substitutionApproval)
    {
        AuditService::log('delete', 'SubstitutionApproval', $substitutionApproval->id, $substitutionApproval->toArray(), null,
            "Menghapus Form Substitusi {$substitutionApproval->document_no}");
            
        $substitutionApproval->delete();
        
        return redirect()->route('substitusi-approvals.index')
            ->with('success', 'Form Substitusi berhasil dihapus.');
    }

    public function print(SubstitutionApproval $substitutionApproval)
    {
        $substitutionApproval->load(['creator', 'project']);
        
        return view('pdf.substitution-approval', [
            'approval' => $substitutionApproval
        ]);
    }
}
