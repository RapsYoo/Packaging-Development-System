import { test, expect } from '@playwright/test';

// ============================================================
// MANAJEMEN PROYEK - Akses untuk semua role yang diizinkan
// ============================================================

test.describe('Proyek (Admin)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });

    test('Admin bisa membuka form buat proyek baru', async ({ page }) => {
        await page.goto('/projects/create/new');
        await expect(page).toHaveURL(/.*\/projects\/create/);
    });
});

test.describe('Proyek (Marketing)', () => {
    test.use({ storageState: 'playwright/.auth/marketing.json' });

    test('Marketing bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });

    test('Marketing bisa membuka form buat proyek baru', async ({ page }) => {
        await page.goto('/projects/create/new');
        await expect(page).toHaveURL(/.*\/projects\/create/);
    });
});

test.describe('Proyek (BOD - Read Only)', () => {
    test.use({ storageState: 'playwright/.auth/bod.json' });

    test('BOD bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });

    test('BOD TIDAK bisa membuat proyek baru (role restricted)', async ({ page }) => {
        await page.goto('/projects/create/new');

        // Seharusnya ditolak/redirect (bukan role admin/marketing)
        const url = page.url();
        expect(url).not.toContain('/projects/create');
    });
});

test.describe('Proyek (Supplier - Read Only)', () => {
    test.use({ storageState: 'playwright/.auth/supplier.json' });

    test('Supplier bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });

    test('Supplier TIDAK bisa membuat proyek baru', async ({ page }) => {
        await page.goto('/projects/create/new');

        const url = page.url();
        expect(url).not.toContain('/projects/create');
    });
});

test.describe('Proyek (R&D)', () => {
    test.use({ storageState: 'playwright/.auth/rd.json' });

    test('R&D bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });
});

test.describe('Proyek (SCM)', () => {
    test.use({ storageState: 'playwright/.auth/scm.json' });

    test('SCM bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });
});

test.describe('Proyek (QC)', () => {
    test.use({ storageState: 'playwright/.auth/qc.json' });

    test('QC bisa melihat daftar proyek', async ({ page }) => {
        await page.goto('/projects');
        await expect(page).toHaveURL(/.*\/projects/);
    });
});
