<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectPhase;
use App\Models\User;
use App\Services\AuditService;
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

    public function create()
    {
        // Get active users who can be PICs (exclude suppliers)
        $users = User::where('is_active', true)
            ->whereHas('role', function($q) {
                $q->where('slug', '!=', 'supplier');
            })->get(['id', 'name', 'department', 'role_id'])
            ->load('role:id,name');
            
        return Inertia::render('Projects/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:NPD,EPD,Substitusi',
            'concept' => 'nullable|string',
            'target_cogs' => 'nullable|numeric|min:0',
            'target_market' => 'nullable|string|max:255',
            'deadline' => 'nullable|date|after:today',
            'pic_id' => 'nullable|exists:users,id',
        ]);

        $project = Project::create([
            'title' => $request->title,
            'code' => Project::generateCode($request->type),
            'type' => $request->type,
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
            'Feasibility Study' => 'FS', 
            'Development' => 'Dev', 
            'Factory User Test' => 'FUT', 
            'User Acceptance Test' => 'UAT', 
            'Go Live' => 'GoLive'
        ];
        
        $order = 1;
        foreach ($phases as $name => $type) {
            $endDate = (clone $startDate)->addWeeks(2);
            ProjectPhase::create([
                'project_id' => $project->id, 
                'name' => $name, 
                'phase_type' => $type, 
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
            NotificationService::sendToRole('bod', 'Brief Baru', "Project {$project->code} - {$project->title} disubmit.", 'approval', route('projects.show', $project));
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
            'project' => $project
        ]);
    }

    public function edit(Project $project)
    {
        $users = User::where('is_active', true)
            ->whereHas('role', function($q) {
                $q->where('slug', '!=', 'supplier');
            })->get(['id', 'name', 'department', 'role_id'])
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
        return Inertia::render('Projects/Timeline', [
            'project' => $project
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
