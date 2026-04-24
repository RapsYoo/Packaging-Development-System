<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\Project;
use App\Models\AuditLog;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RbacController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::orderBy('module')->orderBy('feature')->get();
        
        // Format modules and permissions for frontend
        $modules = [];
        foreach ($permissions as $perm) {
            if (!isset($modules[$perm->module])) {
                $modules[$perm->module] = [];
            }
            $modules[$perm->module][] = $perm;
        }

        return Inertia::render('Admin/Rbac/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'modules' => $modules
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'matrix' => 'required|array',
        ]);

        foreach ($request->matrix as $roleId => $perms) {
            $role = Role::find($roleId);
            if (!$role) continue;

            // Sync permissions
            $syncData = [];
            foreach ($perms as $permId => $accessLevel) {
                if ($accessLevel !== 'none') {
                    $syncData[$permId] = ['access_level' => $accessLevel];
                }
            }

            $role->permissions()->sync($syncData);
        }

        AuditService::log('update', 'RBAC', null, null, null, 'RBAC matrix updated');

        return redirect()->route('admin.rbac.index')->with('success', 'Matriks RBAC berhasil diperbarui.');
    }

    public function dashboard()
    {
        $data = [
            'totalUsers' => User::where('is_active', true)->count(),
            'inactiveUsers' => User::where('is_active', false)->count(),
            'totalProjects' => Project::count(),
            'activeProjects' => Project::active()->count(),
            'recentLogs' => AuditLog::with('user')->orderBy('created_at', 'desc')->take(10)->get(),
            'usersByRole' => User::with('role')
                ->where('is_active', true)
                ->get()
                ->groupBy(fn($u) => $u->role ? $u->role->name : 'No Role')
                ->map->count(),
            'dailyLogins' => AuditLog::where('action', 'login')
                ->where('created_at', '>=', now()->subDays(7))
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date'),
        ];

        return Inertia::render('Admin/Dashboard', $data);
    }
}
