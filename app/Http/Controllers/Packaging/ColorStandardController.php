<?php

namespace App\Http\Controllers\Packaging;

use App\Http\Controllers\Controller;
use App\Models\ColorStandard;
use App\Models\ApprovalWorkflow;
use App\Models\ApprovalStep;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ColorStandardController extends Controller
{
    public function index(Request $request)
    {
        $query = ColorStandard::with('creator');
        
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $colors = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $masterSpecs = \App\Models\MasterPackagingSpec::select('id', 'item_code_rm', 'item_name_rm')
            ->orderBy('item_name_rm')->get();
        
        return Inertia::render('Packaging/Colors/Index', [
            'colors' => $colors,
            'masterSpecs' => $masterSpecs,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Packaging/Colors/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:color_standards,code',
            'file' => 'required|file|max:10240', // 10MB PDF/Image
        ]);

        $filePath = $request->file('file')->store('packaging/colors', 'public');

        $color = ColorStandard::create([
            'name' => $request->name,
            'code' => $request->code,
            'file_path' => $filePath,
            'status' => 'draft',
            'version' => 1,
            'created_by' => auth()->id(),
        ]);

        AuditService::log('create', 'ColorStandard', $color->id, null, $color->toArray());

        return redirect()->route('packaging.colors.index')->with('success', 'Standar warna berhasil ditambahkan (Draft).');
    }

    public function edit(ColorStandard $colorStandard)
    {
        return Inertia::render('Packaging/Colors/Edit', [
            'color' => $colorStandard
        ]);
    }

    public function update(Request $request, ColorStandard $colorStandard)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'nullable|file|max:10240',
        ]);

        $oldValues = $colorStandard->toArray();
        $data = ['name' => $request->name];

        if ($request->hasFile('file')) {
            if ($colorStandard->file_path) {
                Storage::disk('public')->delete($colorStandard->file_path);
            }
            $data['file_path'] = $request->file('file')->store('packaging/colors', 'public');
            $data['version'] = $colorStandard->version + 1; // Increment version on new file
        }

        $colorStandard->update($data);

        AuditService::log('update', 'ColorStandard', $colorStandard->id, $oldValues, $colorStandard->fresh()->toArray());

        return redirect()->route('packaging.colors.index')->with('success', 'Standar warna berhasil diperbarui.');
    }

    public function createApproval(Request $request, ColorStandard $colorStandard)
    {
        if ($colorStandard->status === 'pending_approval') {
            return back()->with('error', 'Standar warna ini sedang dalam proses approval.');
        }

        $colorStandard->update(['status' => 'pending_approval']);

        // Workflow sirkulasi approval color range: QC → QA → R&D → Marketing
        $steps = ['qc' => 1, 'rd' => 2, 'marketing' => 3]; // Simplified from requirement
        
        $workflow = ApprovalWorkflow::create([
            'reference_type' => 'color_standard',
            'reference_id' => $colorStandard->id,
            'type' => 'color_range',
            'status' => 'in_progress',
            'current_step' => 1,
            'total_steps' => count($steps),
            'initiated_by' => auth()->id(),
        ]);
        
        foreach ($steps as $role => $order) {
            ApprovalStep::create([
                'workflow_id' => $workflow->id, 
                'step_order' => $order, 
                'role_required' => $role, 
                'status' => 'pending'
            ]);
        }
        
        NotificationService::sendToRole('qc', 'Color Range Review', "Standar warna {$colorStandard->code} membutuhkan review.", 'approval', route('approvals.show', $workflow));
        
        return back()->with('success', 'Sirkulasi approval standar warna berhasil dimulai.');
    }
}
