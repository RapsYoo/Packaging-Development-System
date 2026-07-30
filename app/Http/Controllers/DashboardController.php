<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\ApprovalWorkflow;
use App\Models\Inspection;
use App\Models\AppNotification;
use App\Models\Quotation;
use App\Models\SubstitutionApproval;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $role = $user->role ? $user->role->slug : null;

        // Common data for all roles
        $data = [
            'role' => $role,
        ];

        // Role-specific data
        switch ($role) {
            case 'admin':
                $data['totalUsers'] = User::where('is_active', true)->count();
                $data['inactiveUsers'] = User::where('is_active', false)->count();
                $data['totalProjects'] = Project::active()->count();
                $data['pendingApprovals'] = ApprovalWorkflow::whereIn('status', ['pending', 'in_progress'])->count();
                $data['recentInspections'] = Inspection::with('inspector')
                    ->orderBy('created_at', 'desc')->take(5)->get();
                $data['projectsByType'] = Project::active()
                    ->selectRaw('type, count(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type');
                $data['projectsByStatus'] = Project::selectRaw('status, count(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status');
                $data['usersByRole'] = User::with('role')
                    ->where('is_active', true)
                    ->get()
                    ->groupBy(fn($u) => $u->role ? $u->role->name : 'No Role')
                    ->map->count();
                $data['pendingSubstitutions'] = SubstitutionApproval::whereIn('status', ['submitted', 'in_review'])->count();
                break;

            case 'marketing':
                $data['myProjects'] = Project::where('created_by', $user->id)
                    ->with('pic')
                    ->orderBy('created_at', 'desc')
                    ->take(10)->get();
                $data['pendingApprovals'] = ApprovalWorkflow::where('initiated_by', $user->id)
                    ->whereIn('status', ['pending', 'in_progress'])->count();
                $data['totalProjects'] = Project::active()->count();
                break;

            case 'bod':
                $data['pendingConcepts'] = ApprovalWorkflow::where('type', 'concept')
                    ->whereIn('status', ['pending', 'in_progress'])->count();
                $data['pendingDrawings'] = ApprovalWorkflow::where('type', 'drawing')
                    ->whereIn('status', ['pending', 'in_progress'])->count();
                $data['totalProjects'] = Project::active()->count();
                break;

            case 'rd':
                $data['totalProjects'] = Project::active()->count();
                $data['pendingReviews'] = ApprovalWorkflow::whereHas('steps', function ($q) {
                    $q->where('role_required', 'rd')->where('status', 'pending');
                })->count();
                $data['pendingSamples'] = \App\Models\SampleReview::where('status', 'pending')->count();
                break;

            case 'qc':
                $data['pendingInspections'] = Inspection::where('result', 'Pending')->count();
                $data['recentInspections'] = Inspection::where('inspector_id', $user->id)
                    ->with(['packagingItem', 'project'])
                    ->orderBy('created_at', 'desc')
                    ->take(10)->get();
                $data['totalProjects'] = Project::active()->count();
                $data['pendingArtworkReviews'] = ApprovalWorkflow::whereHas('steps', function ($q) {
                    $q->where('role_required', 'qc')->where('status', 'pending');
                })->count();
                $data['pendingSubstitutions'] = SubstitutionApproval::whereIn('status', ['submitted', 'in_review'])
                    ->where(function ($q) {
                        $q->whereNull('ttd_qc_supervisor')
                          ->orWhereNull('ttd_qc_manager');
                    })->count();
                break;

            case 'scm':
                $data['totalProjects'] = Project::active()->count();
                $data['pendingQuotations'] = Quotation::where('status', 'pending')->count();
                $data['pendingDrawings'] = ApprovalWorkflow::whereHas('steps', function ($q) {
                    $q->where('role_required', 'scm')->where('status', 'pending');
                })->count();
                $data['pendingSubstitutions'] = SubstitutionApproval::whereIn('status', ['submitted', 'in_review'])
                    ->whereNull('ttd_scm_manager')
                    ->whereNotNull('ttd_qc_manager')
                    ->count();
                break;

            case 'qa':
                $data['totalProjects'] = Project::active()->count();
                $data['pendingApprovals'] = ApprovalWorkflow::whereHas('steps', function ($q) {
                    $q->where('role_required', 'qa')->where('status', 'pending');
                })->count();
                $data['pendingPackagingApprovals'] = \App\Models\PackagingApproval::where('status', 'submitted')
                    ->where('decision_qa', 'pending')
                    ->count();
                $data['pendingSubstitutions'] = SubstitutionApproval::whereIn('status', ['submitted', 'in_review'])
                    ->whereNull('ttd_qa_manager')
                    ->whereNotNull('ttd_scm_manager')
                    ->count();
                break;

            default:
                $data['totalProjects'] = Project::active()->count();
                break;
        }

        // Active projects for all roles
        $data['activeProjects'] = Project::active()
            ->with(['creator', 'pic'])
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', $data);
    }
}
