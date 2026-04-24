<?php

namespace App\Http\Controllers\QC;

use App\Http\Controllers\Controller;
use App\Models\Inspection;
use App\Models\TransportTest;
use App\Models\PackagingItem;
use App\Models\Project;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InspectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Inspection::with(['packagingItem', 'project', 'inspector']);
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('result')) {
            $query->where('result', $request->result);
        }
        
        $inspections = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        return Inertia::render('QC/Inspections/Index', [
            'inspections' => $inspections,
            'filters' => $request->only(['type', 'result'])
        ]);
    }

    public function create()
    {
        $packagingItems = PackagingItem::where('status', 'active')->get(['id', 'name', 'code']);
        $projects = Project::active()->get(['id', 'title', 'code']);
        
        return Inertia::render('QC/Inspections/Create', [
            'packagingItems' => $packagingItems,
            'projects' => $projects
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'packaging_item_id' => 'nullable|exists:packaging_items,id',
            'project_id' => 'nullable|exists:projects,id',
            'type' => 'required|in:T0,T1,T2',
            'checklist' => 'nullable|array',
            'result' => 'required|in:Pass,Fail,Pending',
            'notes' => 'nullable|string',
            'photos.*' => 'nullable|image|max:10240',
        ]);

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $photos[] = $photo->store('inspections/photos', 'public');
            }
        }

        $inspection = Inspection::create([
            'packaging_item_id' => $request->packaging_item_id,
            'project_id' => $request->project_id,
            'type' => $request->type,
            'checklist' => $request->checklist ?? [],
            'result' => $request->result,
            'notes' => $request->notes,
            'photos' => $photos,
            'inspector_id' => auth()->id(),
        ]);

        AuditService::log('create', 'Inspection', $inspection->id, null, $inspection->toArray());
        
        return redirect()->route('qc.inspections.show', $inspection)->with('success', 'Inspeksi berhasil disimpan.');
    }

    public function show(Inspection $inspection)
    {
        $inspection->load(['packagingItem', 'project', 'inspector', 'transportTests.tester']);
        
        return Inertia::render('QC/Inspections/Show', [
            'inspection' => $inspection
        ]);
    }

    public function createTransportTest(Request $request, Inspection $inspection)
    {
        $request->validate([
            'conditions' => 'nullable|array',
            'findings' => 'required|string',
            'recommendations' => 'nullable|string',
        ]);

        $test = TransportTest::create([
            'inspection_id' => $inspection->id,
            'project_id' => $inspection->project_id,
            'conditions' => $request->conditions ?? [],
            'findings' => $request->findings,
            'recommendations' => $request->recommendations,
            'tester_id' => auth()->id(),
        ]);

        AuditService::log('create', 'TransportTest', $test->id);
        
        return back()->with('success', 'Transport test berhasil disimpan.');
    }
    
    public function history(Request $request)
    {
        $query = Inspection::with(['packagingItem', 'project', 'inspector']);
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        $inspections = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();
        
        return Inertia::render('QC/History', [
            'inspections' => $inspections,
            'filters' => $request->only(['type'])
        ]);
    }
}
