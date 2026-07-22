import { test, expect } from '@playwright/test';

// ============================================================
// QC & INSPEKSI
// ============================================================

test.describe('Inspeksi (Admin)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa melihat daftar Inspeksi', async ({ page }) => {
        await page.goto('/qc/inspections');
        await expect(page).toHaveURL(/.*\/qc\/inspections/);
    });

    test('Admin bisa membuat Inspeksi baru', async ({ page }) => {
        await page.goto('/qc/inspections/create');
        await expect(page).toHaveURL(/.*\/qc\/inspections\/create/);
    });

    test('Admin bisa melihat Riwayat Inspeksi', async ({ page }) => {
        await page.goto('/qc/history');
        await expect(page).toHaveURL(/.*\/qc\/history/);
    });
});

test.describe('Inspeksi (QC)', () => {
    test.use({ storageState: 'playwright/.auth/qc.json' });

    test('QC bisa melihat daftar Inspeksi', async ({ page }) => {
        await page.goto('/qc/inspections');
        await expect(page).toHaveURL(/.*\/qc\/inspections/);
    });

    test('QC bisa membuat Inspeksi baru', async ({ page }) => {
        await page.goto('/qc/inspections/create');
        await expect(page).toHaveURL(/.*\/qc\/inspections\/create/);
    });

    test('QC bisa melihat Riwayat Inspeksi', async ({ page }) => {
        await page.goto('/qc/history');
        await expect(page).toHaveURL(/.*\/qc\/history/);
    });
});

test.describe('Inspeksi (R&D - History Only)', () => {
    test.use({ storageState: 'playwright/.auth/rd.json' });

    test('R&D bisa melihat Riwayat Inspeksi', async ({ page }) => {
        await page.goto('/qc/history');
        await expect(page).toHaveURL(/.*\/qc\/history/);
    });

    test('R&D TIDAK bisa membuat Inspeksi baru (role restricted)', async ({ page }) => {
        await page.goto('/qc/inspections/create');

        const url = page.url();
        expect(url).not.toContain('/qc/inspections/create');
    });
});

test.describe('Inspeksi (SCM - History Only)', () => {
    test.use({ storageState: 'playwright/.auth/scm.json' });

    test('SCM bisa melihat Riwayat Inspeksi', async ({ page }) => {
        await page.goto('/qc/history');
        await expect(page).toHaveURL(/.*\/qc\/history/);
    });

    test('SCM TIDAK bisa membuat Inspeksi baru', async ({ page }) => {
        await page.goto('/qc/inspections/create');

        const url = page.url();
        expect(url).not.toContain('/qc/inspections/create');
    });
});

test.describe('Inspeksi (Marketing - Tidak Ada Akses)', () => {
    test.use({ storageState: 'playwright/.auth/marketing.json' });

    test('Marketing TIDAK bisa akses halaman Inspeksi', async ({ page }) => {
        await page.goto('/qc/inspections');

        const url = page.url();
        expect(url).not.toContain('/qc/inspections');
    });

    test('Marketing TIDAK bisa akses Riwayat Inspeksi', async ({ page }) => {
        await page.goto('/qc/history');

        const url = page.url();
        expect(url).not.toContain('/qc/history');
    });
});

test.describe('Inspeksi (BOD - Tidak Ada Akses)', () => {
    test.use({ storageState: 'playwright/.auth/bod.json' });

    test('BOD TIDAK bisa akses halaman Inspeksi', async ({ page }) => {
        await page.goto('/qc/inspections');

        const url = page.url();
        expect(url).not.toContain('/qc/inspections');
    });
});

test.describe('Inspeksi (Supplier - Tidak Ada Akses)', () => {
    test.use({ storageState: 'playwright/.auth/supplier.json' });

    test('Supplier TIDAK bisa akses halaman Inspeksi', async ({ page }) => {
        await page.goto('/qc/inspections');

        const url = page.url();
        expect(url).not.toContain('/qc/inspections');
    });
});
