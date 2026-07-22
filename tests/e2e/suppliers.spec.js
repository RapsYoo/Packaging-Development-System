import { test, expect } from '@playwright/test';

// ============================================================
// MANAJEMEN SUPPLIER
// ============================================================

test.describe('Supplier (Admin)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa melihat daftar Supplier', async ({ page }) => {
        await page.goto('/suppliers');
        await expect(page).toHaveURL(/.*\/suppliers/);
    });

    test('Admin bisa membuat Supplier baru', async ({ page }) => {
        await page.goto('/suppliers/create/new');
        await expect(page).toHaveURL(/.*\/suppliers\/create/);
    });

    test('Admin bisa akses halaman Quotation', async ({ page }) => {
        await page.goto('/suppliers/quotations');
        await expect(page).toHaveURL(/.*\/suppliers\/quotations|.*\/quotations/);
    });
});

test.describe('Supplier (SCM)', () => {
    test.use({ storageState: 'playwright/.auth/scm.json' });

    test('SCM bisa melihat daftar Supplier', async ({ page }) => {
        await page.goto('/suppliers');
        await expect(page).toHaveURL(/.*\/suppliers/);
    });

    test('SCM bisa membuat Supplier baru', async ({ page }) => {
        await page.goto('/suppliers/create/new');
        await expect(page).toHaveURL(/.*\/suppliers\/create/);
    });

    test('SCM bisa akses halaman Quotation', async ({ page }) => {
        await page.goto('/suppliers/quotations');
        await expect(page).toHaveURL(/.*\/suppliers\/quotations|.*\/quotations/);
    });
});

test.describe('Supplier (Role Supplier)', () => {
    test.use({ storageState: 'playwright/.auth/supplier.json' });

    test('Supplier bisa melihat daftar Supplier', async ({ page }) => {
        await page.goto('/suppliers');
        await expect(page).toHaveURL(/.*\/suppliers/);
    });

    test('Supplier TIDAK bisa membuat Supplier baru (role restricted)', async ({ page }) => {
        await page.goto('/suppliers/create/new');

        const url = page.url();
        expect(url).not.toContain('/suppliers/create');
    });

    test('Supplier bisa akses halaman Quotation', async ({ page }) => {
        await page.goto('/suppliers/quotations');
        await expect(page).toHaveURL(/.*\/suppliers\/quotations|.*\/quotations/);
    });
});

test.describe('Supplier (R&D)', () => {
    test.use({ storageState: 'playwright/.auth/rd.json' });

    test('R&D bisa melihat daftar Supplier', async ({ page }) => {
        await page.goto('/suppliers');
        await expect(page).toHaveURL(/.*\/suppliers/);
    });

    test('R&D TIDAK bisa membuat Supplier baru', async ({ page }) => {
        await page.goto('/suppliers/create/new');

        const url = page.url();
        expect(url).not.toContain('/suppliers/create');
    });
});

test.describe('Supplier (Marketing)', () => {
    test.use({ storageState: 'playwright/.auth/marketing.json' });

    test('Marketing bisa melihat daftar Supplier', async ({ page }) => {
        await page.goto('/suppliers');
        await expect(page).toHaveURL(/.*\/suppliers/);
    });
});

test.describe('Supplier (BOD - Read Access)', () => {
    test.use({ storageState: 'playwright/.auth/bod.json' });

    test('BOD bisa melihat daftar Supplier', async ({ page }) => {
        await page.goto('/suppliers');
        await expect(page).toHaveURL(/.*\/suppliers/);
    });
});
