<?php

namespace App\Http\Controllers\Approval;

use App\Http\Controllers\Controller;
use App\Models\ApprovalWorkflow;
use App\Models\ApprovalStep;
use App\Models\Project;
use App\Services\AuditService;
use App\Services\GatingService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    public function index(Request $request)
    {
        $userRole = auth()->user()->role->slug;

        // Pending: approval steps yang role_required = role user ini DAN status masih pending
        // DAN workflow-nya masih aktif (pending/in_progress)
        $pendingApprovals = ApprovalStep::with(['workflow.project', 'workflow.initiator'])
            ->where('role_required', $userRole)
            ->where('status', 'pending')
            ->whereHas('workflow', function ($q) {
                $q->whereIn('status', ['pending', 'in_progress']);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->filter(function ($step) {
                // Hanya tampilkan jika ini giliran step ini (step_order == current_step)
                return $step->workflow && $step->step_order == $step->workflow->current_step;
            })
            ->values();

        // History: approval steps yang sudah di-decide oleh role ini
        $myHistory = ApprovalStep::with(['workflow.project', 'workflow.initiator'])
            ->where('role_required', $userRole)
            ->whereIn('status', ['approved', 'rejected'])
            ->orderBy('decided_at', 'desc')
            ->get();

        return Inertia::render('Approvals/Index', [
            'pendingApprovals' => $pendingApprovals,
            'myHistory' => $myHistory,
            'filters' => $request->only(['type', 'status']),
        ]);
    }

    public function show(ApprovalWorkflow $workflow)
    {
        $workflow->load(['project', 'initiator', 'steps.assignee', 'attachments.uploader']);
        
        return Inertia::render('Approvals/Show', [
            'workflow' => $workflow
        ]);
    }

    public function createConceptApproval(Project $project)
    {
        if ($project->type === 'Substitusi') {
            return back()->with('error', 'Proyek Substitusi Bahan Kemas tidak memerlukan Evaluasi Konsep (BOD).');
        }
        $workflow = ApprovalWorkflow::create([
            'project_id' => $project->id,
            'type' => 'concept',
            'status' => 'pending',
            'current_step' => 1,
            'total_steps' => 1,
            'initiated_by' => auth()->id(),
        ]);
        
        ApprovalStep::create([
            'workflow_id' => $workflow->id, 
            'step_order' => 1, 
            'role_required' => 'bod', 
            'status' => 'pending'
        ]);
        
        NotificationService::sendToRole('bod', 'Evaluasi Konsep Baru', "Project {$project->code} membutuhkan evaluasi konsep.", 'approval', route('approvals.show', $workflow));
        
        return redirect()->route('approvals.show', $workflow)->with('success', 'Approval konsep berhasil diajukan.');
    }

    public function createArtworkApproval(Request $request, Project $project)
    {
        // Hard Gating: Concept Approval harus sudah disetujui
        $gate = GatingService::canStartArtworkApproval($project);
        if (!$gate['allowed']) {
            return back()->with('error', $gate['reason']);
        }

        $roles = ['rd', 'qc', 'qa', 'marketing']; // Paralel 4 pihak
        
        $workflow = ApprovalWorkflow::create([
            'project_id' => $project->id,
            'type' => 'artwork',
            'status' => 'in_progress',
            'current_step' => 1,
            'total_steps' => 1, // Semua langkah ada di urutan 1
            'initiated_by' => auth()->id(),
        ]);
        
        foreach ($roles as $role) {
            ApprovalStep::create([
                'workflow_id' => $workflow->id, 
                'step_order' => 1, 
                'role_required' => $role, 
                'status' => 'pending'
            ]);
        }
        
        NotificationService::sendToRoles($roles, 'Artwork Review', "Artwork project {$project->code} membutuhkan review Anda.", 'approval', route('approvals.show', $workflow));
        
        return redirect()->route('approvals.show', $workflow)->with('success', 'Sirkulasi artwork berhasil dimulai.');
    }

    public function createDrawingApproval(Request $request, Project $project)
    {
        // Hard Gating: Artwork Approval harus sudah disetujui
        $gate = GatingService::canStartDrawingApproval($project);
        if (!$gate['allowed']) {
            return back()->with('error', $gate['reason']);
        }

        $steps = ['scm' => 1, 'bod' => 2];
        
        $workflow = ApprovalWorkflow::create([
            'project_id' => $project->id, 
            'type' => 'drawing', 
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
        
        NotificationService::sendToRole('scm', 'Technical Drawing Review', "Drawing project {$project->code} membutuhkan review.", 'approval', route('approvals.show', $workflow));
        
        return redirect()->route('approvals.show', $workflow)->with('success', 'Approval technical drawing dimulai.');
    }

    public function decide(Request $request, ApprovalStep $step)
    {
        $request->validate([
            'decision' => 'required|in:approved,rejected', 
            'comment' => 'nullable|string|max:1000'
        ]);
        
        $step->update([
            'status' => $request->decision, 
            'comment' => $request->comment, 
            'decided_at' => now(), 
            'assigned_to' => auth()->id()
        ]);
        
        $workflow = $step->workflow;

        if ($request->decision === 'approved') {
            $pendingInCurrentStep = $workflow->steps()
                ->where('step_order', $workflow->current_step)
                ->where('status', '!=', 'approved')
                ->count();

            if ($pendingInCurrentStep === 0) {
                if ($workflow->current_step < $workflow->total_steps) {
                    $workflow->increment('current_step');
                    $nextSteps = $workflow->steps()->where('step_order', $workflow->current_step)->get();
                    if ($nextSteps->count() > 0) {
                        $roles = $nextSteps->pluck('role_required')->toArray();
                        NotificationService::sendToRoles($roles, 'Approval Pending', "Anda memiliki approval baru untuk ditindaklanjuti.", 'approval', route('approvals.show', $workflow));
                    }
                } else {
                    $workflow->update(['status' => 'approved']);
                    NotificationService::sendToUser($workflow->initiated_by, 'Approval Disetujui', "Approval {$workflow->type} untuk project telah disetujui sepenuhnya.", 'success', route('approvals.show', $workflow));
                }
            }
        } else {
            $workflow->update(['status' => 'rejected']);
            NotificationService::sendToUser($workflow->initiated_by, 'Approval Ditolak', "Approval {$workflow->type} ditolak. Komentar: {$request->comment}", 'error', route('approvals.show', $workflow));
        }

        AuditService::log($request->decision === 'approved' ? 'approve' : 'reject', 'ApprovalStep', $step->id, null, ['decision' => $request->decision, 'comment' => $request->comment]);
        
        return back()->with('success', 'Keputusan berhasil disimpan.');
    }

    public function history(Request $request)
    {
        $query = ApprovalWorkflow::with(['project', 'initiator', 'steps.assignee']);
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        $workflows = $query->orderBy('updated_at', 'desc')->paginate(20)->withQueryString();
        
        return Inertia::render('Approvals/History', [
            'workflows' => $workflows,
            'filters' => $request->only('type')
        ]);
    }
}
