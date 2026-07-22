<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectPhase;
use App\Models\User;
use App\Services\AuditService;
use App\Services\GatingService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['creator', 'pic']);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('title', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('status')) $query->where('status', $request->status);
        
        $projects = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'type', 'status'])
        ]);
    }

    public function npdIndex(Request $request)
    {
        $query = Project::with(['creator', 'pic'])->where('type', 'NPD');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('title', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        
        $projects = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        return Inertia::render('Projects/Npd/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function npdCreate(Request $request)
    {
        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');
            
        return Inertia::render('Projects/Npd/Create', [
            'users' => $users,
        ]);
    }

    public function npdStore(Request $request)
    {
        return $this->storeProjectWithType($request, 'NPD');
    }

    public function epdIndex(Request $request)
    {
        $query = Project::with(['creator', 'pic'])->where('type', 'EPD');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('title', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        
        $projects = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        return Inertia::render('Projects/Epd/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function epdCreate(Request $request)
    {
        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');
            
        return Inertia::render('Projects/Epd/Create', [
            'users' => $users,
        ]);
    }

    public function epdStore(Request $request)
    {
        return $this->storeProjectWithType($request, 'EPD');
    }

    public function substitusiIndex(Request $request)
    {
        $query = Project::with(['creator', 'pic'])->where('type', 'Substitusi');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('title', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        
        $projects = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        
        return Inertia::render('Projects/Substitusi/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function substitusiCreate(Request $request)
    {
        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');
            
        return Inertia::render('Projects/Substitusi/Create', [
            'users' => $users,
        ]);
    }

    public function substitusiStore(Request $request)
    {
        return $this->storeProjectWithType($request, 'Substitusi');
    }

    public function create(Request $request)
    {
        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');
            
        return Inertia::render('Projects/Create', [
            'users' => $users,
            'preselectedType' => $request->query('type', 'NPD'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:NPD,EPD,Substitusi',
        ]);
        return $this->storeProjectWithType($request, $request->type);
    }

    private function storeProjectWithType(Request $request, string $type)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'concept' => 'nullable|string',
            'target_cogs' => 'nullable|numeric|min:0',
            'target_market' => 'nullable|string|max:255',
            'deadline' => 'nullable|date|after:today',
            'pic_id' => 'nullable|exists:users,id',
        ]);

        $project = Project::create([
            'title' => $request->title,
            'code' => Project::generateCode($type),
            'type' => $type,
            'concept' => $request->concept,
            'target_cogs' => $request->target_cogs,
            'target_market' => $request->target_market,
            'status' => $request->has('save_draft') && $request->save_draft ? 'draft' : 'submitted',
            'created_by' => auth()->id(),
            'pic_id' => $request->pic_id,
            'deadline' => $request->deadline,
            'notes' => $request->notes,
        ]);

        // Create default phases (Bug fix: removed static order variable)
        $startDate = now();
        $phases = [
            'Evaluasi Konsep & Brief' => 'Concept', 
            'Sourcing & Technical Drawing' => 'Drawing', 
            'Inspeksi Kemasan & Dummy' => 'Inspection', 
            'Artwork & Approval Akhir' => 'Artwork', 
            'Scale Up & Mass Production' => 'ScaleUp'
        ];
        
        $order = 1;
        foreach ($phases as $name => $phaseType) {
            $endDate = (clone $startDate)->addWeeks(2);
            ProjectPhase::create([
                'project_id' => $project->id, 
                'name' => $name, 
                'phase_type' => $phaseType, 
                'start_date' => $startDate, 
                'end_date' => $endDate, 
                'status' => 'pending', 
                'order' => $order
            ]);
            $startDate = $endDate->addDay();
            $order++;
        }

        AuditService::log('create', 'Project', $project->id, null, $project->toArray());
        
        if ($project->status === 'submitted') {
            // Otomatis buat Approval Workflow (Evaluasi Konsep oleh BOD)
            $workflow = \App\Models\ApprovalWorkflow::create([
                'project_id' => $project->id,
                'type' => 'concept',
                'status' => 'pending',
                'current_step' => 1,
                'total_steps' => 1,
                'initiated_by' => auth()->id(),
            ]);

            \App\Models\ApprovalStep::create([
                'workflow_id' => $workflow->id,
                'step_order' => 1,
                'role_required' => 'bod',
                'status' => 'pending',
            ]);

            NotificationService::sendToRole('bod', 'Evaluasi Konsep Baru',
                "Project {$project->code} - {$project->title} membutuhkan evaluasi konsep Anda.",
                'approval', route('approvals.show', $workflow));
        }
        
        return redirect()->route('projects.show', $project)->with('success', 'Project berhasil dibuat.');
    }

    public function show(Project $project)
    {
        $project->load([
            'creator', 
            'pic', 
            'phases', 
            'attachments.uploader', 
            'approvalWorkflows.steps.assignee'
        ]);
        
        return Inertia::render('Projects/Show', [
            'project' => $project,
            'gatingSummary' => GatingService::getGatingSummary($project),
        ]);
    }

    public function edit(Project $project)
    {
        $users = User::where('is_active', true)
            ->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');
            
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'users' => $users
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $request->validate(['title' => 'required|string|max:255']);
        $old = $project->toArray();
        $project->update($request->only(['title', 'concept', 'target_cogs', 'target_market', 'deadline', 'pic_id', 'notes']));
        
        AuditService::log('update', 'Project', $project->id, $old, $project->fresh()->toArray());
        
        return redirect()->route('projects.show', $project)->with('success', 'Project berhasil diperbarui.');
    }

    public function archive(Project $project)
    {
        $project->update(['status' => 'archived']);
        return back()->with('success', 'Project berhasil diarsipkan.');
    }

    public function timeline(Project $project)
    {
        $project->load('phases');

        // Add computed progress to each phase for the frontend based on DB status
        $phases = $project->phases->map(function ($phase) {
            $phaseArr = $phase->toArray();
            $phaseArr['progress'] = match($phase->status) {
                'completed' => 100,
                'in_progress' => 50,
                'overdue' => 75,
                default => 0,
            };
            return $phaseArr;
        });

        return Inertia::render('Projects/Timeline', [
            'project' => $project,
            'phases' => $phases,
        ]);
    }

    public function updatePhase(Request $request, ProjectPhase $phase)
    {
        $request->validate([
            'start_date' => 'required|date', 
            'end_date' => 'required|date|after_or_equal:start_date', 
            'status' => 'required|in:pending,in_progress,completed,overdue'
        ]);
        
        $phase->update($request->only(['start_date', 'end_date', 'status']));
        
        $project = $phase->project;
        $total = $project->phases()->count();
        $done = $project->phases()->where('status', 'completed')->count();
        $project->update(['progress' => round(($done / $total) * 100)]);
        
        return back()->with('success', 'Timeline fase berhasil diperbarui.');
    }

    public function phasesJson(Project $project)
    {
        return response()->json($project->phases->map(fn($p) => [
            'id' => (string)$p->id, 
            'name' => $p->name, 
            'start' => $p->start_date->format('Y-m-d'),
            'end' => $p->end_date->format('Y-m-d'), 
            'progress' => $p->status === 'completed' ? 100 : ($p->status === 'in_progress' ? 50 : 0),
            'custom_class' => 'phase-' . $p->status,
        ]));
    }

    public function destroy(Project $project)
    {
        // Delete project (this will cascade or soft delete depending on the model setup)
        // Since it's critical, we log it before deletion
        \App\Services\AuditService::log('delete', 'Project', $project->id, $project->toArray(), null, "Menghapus proyek {$project->code}");
        
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project berhasil dihapus.');
    }
}
