import { test, expect } from '@playwright/test';

// ============================================================
// ADMIN PANEL - Role: Admin
// ============================================================
test.describe('Admin Panel (Role Admin)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa akses Dashboard Admin', async ({ page }) => {
        await page.goto('/admin/dashboard');
        await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    });

    test('Admin bisa akses Manajemen User', async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page).toHaveURL(/.*\/admin\/users/);
        await expect(page.getByText('Daftar Pengguna Sistem')).toBeVisible();
    });

    test('Admin bisa membuka halaman Tambah User', async ({ page }) => {
        await page.goto('/admin/users/create');
        await expect(page).toHaveURL(/.*\/admin\/users\/create/);
    });

    test('Admin bisa akses Matriks RBAC', async ({ page }) => {
        await page.goto('/admin/rbac');
        await expect(page).toHaveURL(/.*\/admin\/rbac/);
        await expect(page.getByText('Matriks Hak Akses Sistem')).toBeVisible();
    });

    test('Admin bisa akses Audit Trail', async ({ page }) => {
        await page.goto('/admin/audit-logs');
        await expect(page).toHaveURL(/.*\/admin\/audit/);
    });
});

// ============================================================
// ADMIN PANEL - Non-Admin role harus ditolak
// ============================================================
test.describe('Admin Panel (Role Non-Admin Ditolak)', () => {

    const nonAdminRoles = ['marketing', 'bod', 'rd', 'supplier', 'scm', 'qc'];

    for (const role of nonAdminRoles) {
        test(`${role} TIDAK bisa akses halaman Kelola User`, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: `playwright/.auth/${role}.json` });
            const page = await ctx.newPage();

            await page.goto('/admin/users');

            // Harus redirect keluar dari admin area atau tampilkan 403
            const url = page.url();
            expect(url).not.toContain('/admin/users');

            await ctx.close();
        });

        test(`${role} TIDAK bisa akses RBAC`, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: `playwright/.auth/${role}.json` });
            const page = await ctx.newPage();

            await page.goto('/admin/rbac');

            const url = page.url();
            expect(url).not.toContain('/admin/rbac');

            await ctx.close();
        });
    }
});
