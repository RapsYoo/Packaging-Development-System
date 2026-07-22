import { test, expect } from '@playwright/test';

// ============================================================
// NAVIGASI SIDEBAR - Memastikan sidebar RBAC-aware
// ============================================================

test.describe('Sidebar Navigation (Admin - Full Access)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa melihat semua menu di sidebar', async ({ page }) => {
        await page.goto('/dashboard');

        // Menu Admin Panel
        await expect(page.getByRole('link', { name: /Kelola User/i })).toBeVisible();

        // Menu Project
        await expect(page.getByRole('link', { name: /Project/i })).toBeVisible();

        // Menu Supplier
        await expect(page.getByRole('link', { name: /Supplier/i })).toBeVisible();
    });
});

test.describe('Sidebar Navigation (Marketing)', () => {
    test.use({ storageState: 'playwright/.auth/marketing.json' });

    test('Marketing TIDAK bisa melihat menu Admin Panel', async ({ page }) => {
        await page.goto('/dashboard');

        // Menu admin TIDAK ada
        await expect(page.getByRole('link', { name: /Kelola User/i })).toBeHidden();
    });

    test('Marketing BISA melihat menu Project', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page.getByRole('link', { name: /Project/i })).toBeVisible();
    });
});

test.describe('Sidebar Navigation (Supplier)', () => {
    test.use({ storageState: 'playwright/.auth/supplier.json' });

    test('Supplier TIDAK bisa melihat menu Admin Panel', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page.getByRole('link', { name: /Kelola User/i })).toBeHidden();
    });
});

// ============================================================
// PROFILE - Semua role bisa akses
// ============================================================

test.describe('Profile (Semua Role)', () => {
    const allRoles = ['admin', 'marketing', 'bod', 'rd', 'supplier', 'scm', 'qc'];

    for (const role of allRoles) {
        test(`${role} bisa mengakses halaman Profile`, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: `playwright/.auth/${role}.json` });
            const page = await ctx.newPage();

            await page.goto('/profile');
            await expect(page).toHaveURL(/.*\/profile/);

            await ctx.close();
        });
    }
});

// ============================================================
// DASHBOARD - Semua role bisa akses
// ============================================================

test.describe('Dashboard (Semua Role)', () => {
    const allRoles = ['admin', 'marketing', 'bod', 'rd', 'supplier', 'scm', 'qc'];

    for (const role of allRoles) {
        test(`${role} bisa mengakses Dashboard`, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: `playwright/.auth/${role}.json` });
            const page = await ctx.newPage();

            await page.goto('/dashboard');
            await expect(page).toHaveURL(/.*\/dashboard/);

            await ctx.close();
        });
    }
});
