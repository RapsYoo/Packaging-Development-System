<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', 'like', "%{$request->model_type}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('user', function($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%");
            })->orWhere('description', 'like', "%{$s}%");
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(30)->withQueryString();

        // Get unique actions and models for filter dropdowns
        $actions = AuditLog::select('action')->distinct()->pluck('action');
        $models = AuditLog::whereNotNull('model_type')->select('model_type')->distinct()->pluck('model_type');

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $logs,
            'actions' => $actions,
            'models' => $models,
            'filters' => $request->only(['action', 'model_type', 'date', 'search']),
        ]);
    }
}
