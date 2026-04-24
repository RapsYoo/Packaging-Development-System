<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\AuditLog;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role');

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('role', fn($q) => $q->where('slug', $request->role));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        $roles = Role::all();
        $departments = User::distinct()->pluck('department')->filter()->values();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'departments' => $departments,
            'filters' => $request->only(['search', 'role', 'status', 'department']),
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('Admin/Users/Create', compact('roles'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'department' => $request->department,
            'phone' => $request->phone,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        AuditService::log('create', 'User', $user->id, null, $user->toArray(), "Created user: {$user->name}");

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('role'),
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role_id' => 'required|exists:roles,id',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $oldValues = $user->toArray();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'department' => $request->department,
            'phone' => $request->phone,
        ]);

        AuditService::log('update', 'User', $user->id, $oldValues, $user->fresh()->toArray(), "Updated user: {$user->name}");

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $oldStatus = $user->is_active;
        $user->update(['is_active' => !$user->is_active]);

        $action = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        AuditService::log('update', 'User', $user->id,
            ['is_active' => $oldStatus],
            ['is_active' => $user->is_active],
            "User {$user->name} {$action}"
        );

        return back()->with('success', "User berhasil {$action}.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        AuditService::log('delete', 'User', $user->id, $user->toArray(), null, "Soft deleted user: {$user->name}");
        $user->delete(); // soft delete

        return back()->with('success', 'User berhasil dihapus.');
    }

    public function resetPassword(User $user)
    {
        // Send password reset link via email instead of generating a random password
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            AuditService::log('update', 'User', $user->id, null, null, "Password reset link sent for user: {$user->name}");
            return back()->with('success', "Link reset password telah dikirim ke email {$user->email}.");
        }

        // Fallback: generate temporary password if email fails
        $tempPassword = 'Reset' . rand(1000, 9999) . '!';
        $user->update(['password' => Hash::make($tempPassword)]);
        AuditService::log('update', 'User', $user->id, null, null, "Password reset for user: {$user->name}");

        return back()->with('success', "Password user {$user->name} telah direset. Password sementara: {$tempPassword}");
    }

    public function activityLog(User $user)
    {
        $logs = AuditLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Users/Activity', [
            'user' => $user->load('role'),
            'logs' => $logs,
        ]);
    }
}
