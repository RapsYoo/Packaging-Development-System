<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProjectReportExport;
use App\Exports\SupplierReportExport;
use App\Models\Project;
use App\Models\Supplier;

class ReportController extends Controller
{
    public function index()
    {
        $projectStats = [
            'total' => Project::count(),
            'active' => Project::active()->count(),
            'completed' => Project::where('status', 'completed')->count(),
            'delayed' => Project::where('status', 'delayed')->count(),
        ];

        $supplierStats = [
            'total' => Supplier::count(),
            'active' => Supplier::where('status', 'active')->count(),
        ];

        return Inertia::render('Reports/Index', [
            'projectStats' => $projectStats,
            'supplierStats' => $supplierStats,
        ]);
    }

    public function exportProjects()
    {
        return Excel::download(new ProjectReportExport, 'projects_report_' . date('Ymd_His') . '.xlsx');
    }

    public function exportSuppliers()
    {
        return Excel::download(new SupplierReportExport, 'suppliers_report_' . date('Ymd_His') . '.xlsx');
    }
}
