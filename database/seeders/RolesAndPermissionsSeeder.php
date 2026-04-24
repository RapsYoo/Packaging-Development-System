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
            ['name' => 'Supplier', 'slug' => 'supplier', 'description' => 'Vendor/Supplier bahan kemasan'],
            ['name' => 'SCM', 'slug' => 'scm', 'description' => 'Supply Chain Management'],
            ['name' => 'QC / QA', 'slug' => 'qc', 'description' => 'Quality Control / Quality Assurance'],
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
            ['module' => 'Manajemen Proyek', 'feature' => 'Lihat Semua Project', 'slug' => 'project.view'],
            ['module' => 'Manajemen Proyek', 'feature' => 'Kelola Timeline', 'slug' => 'project.timeline'],

            // Approval
            ['module' => 'Approval', 'feature' => 'Evaluasi Konsep (BOD)', 'slug' => 'approval.concept'],
            ['module' => 'Approval', 'feature' => 'Approval Technical Drawing', 'slug' => 'approval.drawing'],
            ['module' => 'Approval', 'feature' => 'Sirkulasi Artwork', 'slug' => 'approval.artwork'],
            ['module' => 'Approval', 'feature' => 'Lihat Riwayat Approval', 'slug' => 'approval.history'],

            // Packaging
            ['module' => 'Manajemen Kemasan', 'feature' => 'CRUD Master Kemasan', 'slug' => 'packaging.master'],
            ['module' => 'Manajemen Kemasan', 'feature' => 'Approval Color Range', 'slug' => 'packaging.color'],

            // Supplier
            ['module' => 'Manajemen Supplier', 'feature' => 'CRUD Master Supplier', 'slug' => 'supplier.master'],
            ['module' => 'Manajemen Supplier', 'feature' => 'Pitching & Trial Sampel', 'slug' => 'supplier.trial'],
            ['module' => 'Manajemen Supplier', 'feature' => 'Kelola Quotation', 'slug' => 'supplier.quotation'],
            ['module' => 'Manajemen Supplier', 'feature' => 'Substitusi Bahan Kemas', 'slug' => 'supplier.substitution'],

            // QC
            ['module' => 'QC & Inspeksi', 'feature' => 'Inspeksi T0/T1/T2', 'slug' => 'qc.inspection'],
            ['module' => 'QC & Inspeksi', 'feature' => 'Transport Test', 'slug' => 'qc.transport'],
            ['module' => 'QC & Inspeksi', 'feature' => 'Lihat Riwayat Inspeksi', 'slug' => 'qc.history'],

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
                'auth.login' => 'full', 'auth.password' => 'full',
                'admin.dashboard' => 'full', 'admin.users' => 'full', 'admin.rbac' => 'full',
                'project.brief' => 'full', 'project.view' => 'full', 'project.timeline' => 'full',
                'approval.concept' => 'full', 'approval.drawing' => 'full', 'approval.artwork' => 'full', 'approval.history' => 'full',
                'packaging.master' => 'full', 'packaging.color' => 'full',
                'supplier.master' => 'full', 'supplier.trial' => 'full', 'supplier.quotation' => 'full', 'supplier.substitution' => 'full',
                'qc.inspection' => 'full', 'qc.transport' => 'full', 'qc.history' => 'full',
                'notification.receive' => 'full', 'notification.export' => 'full', 'audit.read' => 'full',
            ],
            'marketing' => [
                'auth.login' => 'full', 'auth.password' => 'full',
                'project.brief' => 'full', 'project.view' => 'full', 'project.timeline' => 'full',
                'approval.artwork' => 'full', 'approval.history' => 'full',
                'packaging.color' => 'full',
                'notification.receive' => 'full',
            ],
            'bod' => [
                'auth.login' => 'full', 'auth.password' => 'full',
                'project.view' => 'full',
                'approval.concept' => 'full', 'approval.drawing' => 'full', 'approval.history' => 'full',
                'notification.receive' => 'full',
            ],
            'rd' => [
                'auth.login' => 'full', 'auth.password' => 'full',
                'project.view' => 'full',
                'approval.drawing' => 'full', 'approval.artwork' => 'full', 'approval.history' => 'full',
                'packaging.master' => 'full', 'packaging.color' => 'full',
                'supplier.trial' => 'full', 'supplier.substitution' => 'full',
                'qc.history' => 'full',
                'notification.receive' => 'full',
            ],
            'supplier' => [
                'auth.login' => 'full', 'auth.password' => 'full',
                'project.view' => 'full',
                'approval.history' => 'read',
                'supplier.trial' => 'full', 'supplier.quotation' => 'full',
                'notification.receive' => 'full',
            ],
            'scm' => [
                'auth.login' => 'full', 'auth.password' => 'full',
                'project.view' => 'full',
                'approval.drawing' => 'full', 'approval.history' => 'full',
                'supplier.master' => 'full', 'supplier.quotation' => 'full', 'supplier.substitution' => 'full',
                'qc.history' => 'full',
                'notification.receive' => 'full', 'notification.export' => 'full',
            ],
            'qc' => [
                'auth.login' => 'full', 'auth.password' => 'full',
                'project.view' => 'full',
                'approval.artwork' => 'full', 'approval.history' => 'full',
                'packaging.color' => 'full',
                'supplier.substitution' => 'full',
                'qc.inspection' => 'full', 'qc.transport' => 'full', 'qc.history' => 'full',
                'notification.receive' => 'full', 'notification.export' => 'full',
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
        User::firstOrCreate(
            ['email' => 'admin@priskila.co.id'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'role_id' => $adminRole->id,
                'department' => 'IT',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create demo users for each role
        $demoUsers = [
            ['name' => 'Marketing User', 'email' => 'marketing@priskila.co.id', 'role' => 'marketing', 'dept' => 'Marketing'],
            ['name' => 'Director', 'email' => 'bod@priskila.co.id', 'role' => 'bod', 'dept' => 'Board of Directors'],
            ['name' => 'R&D Developer', 'email' => 'rd@priskila.co.id', 'role' => 'rd', 'dept' => 'R&D'],
            ['name' => 'Supplier Demo', 'email' => 'supplier@demo.com', 'role' => 'supplier', 'dept' => 'External'],
            ['name' => 'SCM Officer', 'email' => 'scm@priskila.co.id', 'role' => 'scm', 'dept' => 'Supply Chain'],
            ['name' => 'QC Inspector', 'email' => 'qc@priskila.co.id', 'role' => 'qc', 'dept' => 'Quality Control'],
        ];

        foreach ($demoUsers as $demo) {
            $role = Role::where('slug', $demo['role'])->first();
            User::firstOrCreate(
                ['email' => $demo['email']],
                [
                    'name' => $demo['name'],
                    'password' => Hash::make('password123'),
                    'role_id' => $role->id,
                    'department' => $demo['dept'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
