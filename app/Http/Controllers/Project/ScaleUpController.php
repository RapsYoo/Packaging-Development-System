<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\ScaleUp;
use App\Models\Project;
use App\Models\MasterPackagingSpec;
use App\Services\AuditService;
use App\Services\GatingService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ScaleUpController extends Controller
{
    public function index(Request $request)
    {
        $query = ScaleUp::with(['project', 'masterSpec', 'creator']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('code', 'like', "%{$s}%")
                ->orWhere('material_name', 'like', "%{$s}%")
                ->orWhereHas('project', fn($pq) => $pq->where('title', 'like', "%{$s}%"))
            );
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('packaging_category', $request->category);
        }

        $scaleUps = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('ScaleUp/Index', [
            'scaleUps' => $scaleUps,
            'filters' => $request->only(['search', 'status', 'category']),
        ]);
    }

    public function create(Request $request)
    {
        $projects = Project::where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'code', 'title', 'type']);

        // Tambahkan info gating eligibility per project
        $projectsWithGating = $projects->map(function ($project) {
            $gate = GatingService::canCreateScaleUp($project);
            return array_merge($project->toArray(), [
                'gating_allowed' => $gate['allowed'],
                'gating_reason' => $gate['reason'],
            ]);
        });

        $masterSpecs = MasterPackagingSpec::select('id', 'item_code_rm', 'item_name_rm', 'material', 'bentuk', 'warna_dasar', 'warna_cetakan', 'panjang', 'lebar', 'tinggi', 'tebal', 'diameter_dalam', 'diameter_luar', 'panjang_selang', 'berat', 'volume')->orderBy('item_name_rm')->get();

        return Inertia::render('ScaleUp/Create', [
            'projects' => $projectsWithGating,
            'masterSpecs' => $masterSpecs,
            'preselectedProject' => $request->project_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'master_spec_id' => 'nullable|exists:master_packaging_specs,id',
            'packaging_category' => 'required|in:Primer,Sekunder,Tersier',
            'material_name' => 'required|string|max:255',
            'material_type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'bentuk' => 'nullable|string|max:100',
            'warna_dasar' => 'nullable|string',
            'warna_cetakan' => 'nullable|string|max:100',
            'tebal' => 'nullable|string|max:50',
            'diameter_dalam' => 'nullable|string|max:50',
            'diameter_luar' => 'nullable|string|max:50',
            'panjang_selang' => 'nullable|string|max:50',
            'berat' => 'nullable|string|max:50',
            'test_kebocoran' => 'nullable|string|max:100',
            'test_kekuatan' => 'nullable|string|max:255',
            'kesesuaian_desain' => 'nullable|string|max:100',
            'kesesuaian_teks' => 'nullable|string|max:100',
            'proofprint_notes' => 'nullable|string',
            'proofprint_file' => 'nullable|file|max:10240',
            'master_product_notes' => 'nullable|string',
            'document_number' => 'nullable|string|max:50',
            'valid_date' => 'nullable|date',
        ]);

        $validated['code'] = ScaleUp::generateCode();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'draft';

        // Hard Gating: Cek prasyarat sebelum membuat Scale Up
        $project = Project::findOrFail($validated['project_id']);
        $gate = GatingService::canCreateScaleUp($project);
        if (!$gate['allowed']) {
            return back()->with('error', $gate['reason'])->withInput();
        }

        // Handle file upload
        if ($request->hasFile('proofprint_file')) {
            $validated['proofprint_file'] = $request->file('proofprint_file')
                ->store('scale-ups/proofprints', 'public');
        }

        $scaleUp = ScaleUp::create($validated);

        AuditService::log('create', 'ScaleUp', $scaleUp->id, null, $scaleUp->toArray());

        return redirect()->route('scaleups.show', $scaleUp)
            ->with('success', 'Scale Up berhasil dibuat.');
    }

    public function show(ScaleUp $scaleUp)
    {
        $scaleUp->load(['project', 'masterSpec', 'creator', 'checker', 'approver']);

        return Inertia::render('ScaleUp/Show', [
            'scaleUp' => $scaleUp,
        ]);
    }

    public function edit(ScaleUp $scaleUp)
    {
        if (!in_array($scaleUp->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Hanya Scale Up berstatus Draft atau Ditolak yang bisa diedit.');
        }

        $projects = Project::where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'code', 'title', 'type']);

        $masterSpecs = MasterPackagingSpec::select('id', 'item_code_rm', 'item_name_rm', 'material', 'bentuk', 'warna_dasar', 'warna_cetakan', 'panjang', 'lebar', 'tinggi', 'tebal', 'diameter_dalam', 'diameter_luar', 'panjang_selang', 'berat', 'volume')->orderBy('item_name_rm')->get();

        return Inertia::render('ScaleUp/Edit', [
            'scaleUp' => $scaleUp,
            'projects' => $projects,
            'masterSpecs' => $masterSpecs,
        ]);
    }

    public function update(Request $request, ScaleUp $scaleUp)
    {
        if (!in_array($scaleUp->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Hanya Scale Up berstatus Draft atau Ditolak yang bisa diedit.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'master_spec_id' => 'nullable|exists:master_packaging_specs,id',
            'packaging_category' => 'required|in:Primer,Sekunder,Tersier',
            'material_name' => 'required|string|max:255',
            'material_type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'bentuk' => 'nullable|string|max:100',
            'warna_dasar' => 'nullable|string',
            'warna_cetakan' => 'nullable|string|max:100',
            'tebal' => 'nullable|string|max:50',
            'diameter_dalam' => 'nullable|string|max:50',
            'diameter_luar' => 'nullable|string|max:50',
            'panjang_selang' => 'nullable|string|max:50',
            'berat' => 'nullable|string|max:50',
            'test_kebocoran' => 'nullable|string|max:100',
            'test_kekuatan' => 'nullable|string|max:255',
            'kesesuaian_desain' => 'nullable|string|max:100',
            'kesesuaian_teks' => 'nullable|string|max:100',
            'proofprint_notes' => 'nullable|string',
            'proofprint_file' => 'nullable|file|max:10240',
            'master_product_notes' => 'nullable|string',
            'document_number' => 'nullable|string|max:50',
            'valid_date' => 'nullable|date',
        ]);

        if ($request->hasFile('proofprint_file')) {
            // Delete old file
            if ($scaleUp->proofprint_file) {
                Storage::disk('public')->delete($scaleUp->proofprint_file);
            }
            $validated['proofprint_file'] = $request->file('proofprint_file')
                ->store('scale-ups/proofprints', 'public');
        }

        $old = $scaleUp->toArray();
        $scaleUp->update($validated);

        AuditService::log('update', 'ScaleUp', $scaleUp->id, $old, $scaleUp->fresh()->toArray());

        return redirect()->route('scaleups.show', $scaleUp)
            ->with('success', 'Scale Up berhasil diperbarui.');
    }

    public function submitReview(ScaleUp $scaleUp)
    {
        if ($scaleUp->status !== 'draft') {
            return back()->with('error', 'Hanya Scale Up berstatus Draft yang bisa diajukan.');
        }

        // Hard Gating: Validasi ulang prasyarat sebelum submit
        $gate = GatingService::canCreateScaleUp($scaleUp->project);
        if (!$gate['allowed']) {
            return back()->with('error', 'Tidak dapat submit: ' . $gate['reason']);
        }

        $scaleUp->update(['status' => 'in_review']);

        AuditService::log('update', 'ScaleUp', $scaleUp->id, ['status' => 'draft'], ['status' => 'in_review'], 'Submit Scale Up untuk review');

        // Notify QC Manager / Admin
        NotificationService::sendToRole('qc', 'Scale Up Perlu Review',
            "Scale Up {$scaleUp->code} - {$scaleUp->material_name} menunggu review Anda.",
            'approval', route('scaleups.show', $scaleUp));

        return back()->with('success', 'Scale Up berhasil diajukan untuk review.');
    }

    public function approve(Request $request, ScaleUp $scaleUp)
    {
        if ($scaleUp->status !== 'in_review') {
            return back()->with('error', 'Hanya Scale Up dalam review yang bisa di-approve.');
        }

        $scaleUp->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        AuditService::log('update', 'ScaleUp', $scaleUp->id,
            ['status' => 'in_review'], ['status' => 'approved'],
            "Approved oleh " . auth()->user()->name);

        NotificationService::sendToRole('admin', 'Scale Up Disetujui',
            "Scale Up {$scaleUp->code} telah disetujui dan siap dipublikasikan.",
            'info', route('scaleups.show', $scaleUp));

        return back()->with('success', 'Scale Up berhasil disetujui.');
    }

    public function reject(Request $request, ScaleUp $scaleUp)
    {
        $request->validate(['rejection_reason' => 'required|string|max:500']);

        if ($scaleUp->status !== 'in_review') {
            return back()->with('error', 'Hanya Scale Up dalam review yang bisa ditolak.');
        }

        $scaleUp->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        AuditService::log('update', 'ScaleUp', $scaleUp->id,
            ['status' => 'in_review'], ['status' => 'rejected'],
            "Ditolak: " . $request->rejection_reason);

        return back()->with('success', 'Scale Up ditolak dengan alasan.');
    }

    public function publish(ScaleUp $scaleUp)
    {
        if ($scaleUp->status !== 'approved') {
            return back()->with('error', 'Hanya Scale Up yang sudah disetujui yang bisa diterbitkan.');
        }

        $scaleUp->update(['status' => 'published']);

        AuditService::log('update', 'ScaleUp', $scaleUp->id,
            ['status' => 'approved'], ['status' => 'published'],
            "Diterbitkan sebagai standar resmi");

        return back()->with('success', 'Scale Up berhasil diterbitkan sebagai standar resmi!');
    }

    public function destroy(ScaleUp $scaleUp)
    {
        if (!in_array($scaleUp->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Hanya Scale Up berstatus Draft atau Ditolak yang bisa dihapus.');
        }

        AuditService::log('delete', 'ScaleUp', $scaleUp->id, $scaleUp->toArray(), null, "Menghapus Scale Up {$scaleUp->code}");
        $scaleUp->delete();

        return redirect()->route('scaleups.index')->with('success', 'Scale Up berhasil dihapus.');
    }

    public function print(ScaleUp $scaleUp)
    {
        // Pastikan hanya bisa dicetak jika sudah published
        if ($scaleUp->status !== 'published') {
            abort(403, 'Hanya dokumen Scale Up yang sudah diterbitkan (Published) yang dapat dicetak.');
        }

        $scaleUp->load(['project', 'creator.role', 'checker.role', 'approver.role']);
        $printMode = true;

        return view('pdf.scale-up-spec', compact('scaleUp', 'printMode'));
    }
}
