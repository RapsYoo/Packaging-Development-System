<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create Roles
        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Administrator sistem dengan akses penuh'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'description' => 'Tim Marketing untuk brief NPD/EPD'],
            ['name' => 'BOD', 'slug' => 'bod', 'description' => 'Board of Directors untuk approval konsep'],
            ['name' => 'R&D / Package Developer', 'slug' => 'rd', 'description' => 'Research & Development / Package Developer'],
            ['name' => 'SCM', 'slug' => 'scm', 'description' => 'Supply Chain Management'],
            ['name' => 'QC', 'slug' => 'qc', 'description' => 'Quality Control - Pelaksana inspeksi & uji kualitas'],
            ['name' => 'QA', 'slug' => 'qa', 'description' => 'Quality Assurance - Pengawas sirkulasi approval & standar mutu'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }

        // Create Permissions
        $permissions = [
            // Auth
            ['module' => 'Autentikasi', 'feature' => 'Login/Logout', 'slug' => 'auth.login'],
            ['module' => 'Autentikasi', 'feature' => 'Reset/Ganti Password', 'slug' => 'auth.password'],

            // Admin Panel
            ['module' => 'Admin Panel', 'feature' => 'Dashboard Admin', 'slug' => 'admin.dashboard'],
            ['module' => 'Admin Panel', 'feature' => 'CRUD & Kelola User', 'slug' => 'admin.users'],
            ['module' => 'Admin Panel', 'feature' => 'Assign Role & RBAC', 'slug' => 'admin.rbac'],

            // Project Management
            ['module' => 'Manajemen Proyek', 'feature' => 'Buat/Edit Brief NPD/EPD', 'slug' => 'project.brief'],
            ['module' => 'Manajemen Proyek', 'feature' => 'Inisiasi Substitusi', 'slug' => 'project.substitution'],
            ['module' => 'Manajemen Proyek', 'feature' => 'Lihat Semua Project', 'slug' => 'project.view'],
            ['module' => 'Manajemen Proyek', 'feature' => 'Kelola Timeline', 'slug' => 'project.timeline'],

            // Approval
            ['module' => 'Approval', 'feature' => 'Evaluasi Konsep (BOD)', 'slug' => 'approval.concept'],
            ['module' => 'Approval', 'feature' => 'Approval Technical Drawing', 'slug' => 'approval.drawing'],
            ['module' => 'Approval', 'feature' => 'Sirkulasi Artwork/CRB', 'slug' => 'approval.artwork'],
            ['module' => 'Approval', 'feature' => 'Form Approval Bahan Kemas', 'slug' => 'approval.packaging'],
            ['module' => 'Approval', 'feature' => 'Lihat Riwayat Approval', 'slug' => 'approval.history'],

            // Packaging
            ['module' => 'Manajemen Kemasan', 'feature' => 'CRUD Master Kemasan', 'slug' => 'packaging.master'],
            ['module' => 'Manajemen Kemasan', 'feature' => 'Approval Color Range', 'slug' => 'packaging.color'],

            // Sourcing & Supplier
            ['module' => 'Sourcing & Supplier', 'feature' => 'CRUD Master Supplier', 'slug' => 'supplier.master'],
            ['module' => 'Sourcing & Supplier', 'feature' => 'Pitching & Trial Sampel', 'slug' => 'supplier.trial'],
            ['module' => 'Sourcing & Supplier', 'feature' => 'Kelola Quotation', 'slug' => 'supplier.quotation'],

            // QC & Inspeksi
            ['module' => 'QC & Inspeksi', 'feature' => 'Inspeksi T0/T1/T2', 'slug' => 'qc.inspection'],
            ['module' => 'QC & Inspeksi', 'feature' => 'Transport Test', 'slug' => 'qc.transport'],
            ['module' => 'QC & Inspeksi', 'feature' => 'Lihat Riwayat Inspeksi', 'slug' => 'qc.history'],

            // Scale Up & Standarisasi
            ['module' => 'Scale Up', 'feature' => 'Kelola Scale Up', 'slug' => 'scaleup.manage'],
            ['module' => 'Scale Up', 'feature' => 'Approve & Publish Scale Up', 'slug' => 'scaleup.approve'],

            // Notification & Audit
            ['module' => 'Notifikasi & Audit', 'feature' => 'Terima Notifikasi', 'slug' => 'notification.receive'],
            ['module' => 'Notifikasi & Audit', 'feature' => 'Export Laporan', 'slug' => 'notification.export'],
            ['module' => 'Notifikasi & Audit', 'feature' => 'Audit Trail (Baca)', 'slug' => 'audit.read'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['slug' => $perm['slug']], $perm);
        }

        // RBAC Matrix: role_slug => [permission_slug => access_level]
        $matrix = [
            'admin' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'admin.dashboard' => 'all', 'admin.users' => 'all', 'admin.rbac' => 'all',
                'project.brief' => 'all', 'project.substitution' => 'all', 'project.view' => 'all', 'project.timeline' => 'all',
                'approval.concept' => 'all', 'approval.drawing' => 'all', 'approval.artwork' => 'all', 'approval.packaging' => 'all', 'approval.history' => 'all',
                'packaging.master' => 'all', 'packaging.color' => 'all',
                'supplier.master' => 'all', 'supplier.trial' => 'all', 'supplier.quotation' => 'all',
                'qc.inspection' => 'all', 'qc.transport' => 'all', 'qc.history' => 'all',
                'scaleup.manage' => 'all', 'scaleup.approve' => 'all',
                'notification.receive' => 'all', 'notification.export' => 'all', 'audit.read' => 'all',
            ],
            'marketing' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'project.brief' => 'all', 'project.view' => 'all', 'project.timeline' => 'all',
                'approval.artwork' => 'all', 'approval.history' => 'all',
                'packaging.color' => 'all',
                'notification.receive' => 'all',
            ],
            'bod' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'project.view' => 'all',
                'approval.concept' => 'all', 'approval.drawing' => 'all', 'approval.history' => 'all',
                'notification.receive' => 'all',
            ],
            'rd' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'project.view' => 'all',
                'approval.drawing' => 'all', 'approval.artwork' => 'all', 'approval.packaging' => 'all', 'approval.history' => 'all',
                'packaging.master' => 'all', 'packaging.color' => 'all',
                'supplier.trial' => 'all',
                'qc.history' => 'all',
                'scaleup.manage' => 'all',
                'notification.receive' => 'all',
            ],
            'scm' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'project.substitution' => 'all', 'project.view' => 'all', 'project.timeline' => 'read',
                'approval.packaging' => 'all', 'approval.history' => 'all',
                'supplier.master' => 'all', 'supplier.quotation' => 'all', 'supplier.trial' => 'all',
                'qc.history' => 'all',
                'scaleup.manage' => 'read',
                'notification.receive' => 'all', 'notification.export' => 'all',
            ],
            'qc' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'project.substitution' => 'all', 'project.view' => 'all',
                'approval.artwork' => 'all', 'approval.packaging' => 'all', 'approval.history' => 'all',
                'packaging.color' => 'all',
                'qc.inspection' => 'all', 'qc.transport' => 'all', 'qc.history' => 'all',
                'scaleup.manage' => 'all', 'scaleup.approve' => 'all',
                'notification.receive' => 'all', 'notification.export' => 'all',
            ],
            'qa' => [
                'auth.login' => 'all', 'auth.password' => 'all',
                'project.view' => 'all',
                'approval.artwork' => 'all', 'approval.packaging' => 'all', 'approval.history' => 'all',
                'packaging.color' => 'all',
                'qc.history' => 'read',
                'scaleup.manage' => 'read',
                'notification.receive' => 'all',
            ],
        ];

        foreach ($matrix as $roleSlug => $perms) {
            $role = Role::where('slug', $roleSlug)->first();
            if (!$role) continue;

            foreach ($perms as $permSlug => $accessLevel) {
                $permission = Permission::where('slug', $permSlug)->first();
                if (!$permission) continue;

                $role->permissions()->syncWithoutDetaching([
                    $permission->id => ['access_level' => $accessLevel]
                ]);
            }
        }

        // Create default admin user
        $adminRole = Role::where('slug', 'admin')->first();
        $adminUser = User::withTrashed()->where('email', 'admin@priskila.co.id')->first();
        if ($adminUser) {
            if ($adminUser->trashed()) $adminUser->restore();
            $adminUser->update([
                'name' => 'System Administrator',
                'role_id' => $adminRole->id,
                'department' => 'IT',
                'is_active' => true,
            ]);
        } else {
            User::create([
                'email' => 'admin@priskila.co.id',
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'role_id' => $adminRole->id,
                'department' => 'IT',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Create demo users for each role
        $demoUsers = [
            ['name' => 'Marketing User', 'email' => 'marketing@priskila.co.id', 'role' => 'marketing', 'dept' => 'Marketing'],
            ['name' => 'Director', 'email' => 'bod@priskila.co.id', 'role' => 'bod', 'dept' => 'Board of Directors'],
            ['name' => 'R&D Developer', 'email' => 'rd@priskila.co.id', 'role' => 'rd', 'dept' => 'R&D'],
            ['name' => 'SCM Officer', 'email' => 'scm@priskila.co.id', 'role' => 'scm', 'dept' => 'Supply Chain'],
            ['name' => 'QC Inspector', 'email' => 'qc@priskila.co.id', 'role' => 'qc', 'dept' => 'Quality Control'],
            ['name' => 'QA Supervisor', 'email' => 'qa@priskila.co.id', 'role' => 'qa', 'dept' => 'Quality Assurance'],
        ];

        foreach ($demoUsers as $demo) {
            $role = Role::where('slug', $demo['role'])->first();
            $user = User::withTrashed()->where('email', $demo['email'])->first();
            
            if ($user) {
                // If it was soft-deleted, restore it
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->update([
                    'name' => $demo['name'],
                    'role_id' => $role->id,
                    'department' => $demo['dept'],
                    'is_active' => true,
                ]);
            } else {
                User::create([
                    'name' => $demo['name'],
                    'email' => $demo['email'],
                    'password' => Hash::make('password123'),
                    'role_id' => $role->id,
                    'department' => $demo['dept'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }
        }
    }
}
