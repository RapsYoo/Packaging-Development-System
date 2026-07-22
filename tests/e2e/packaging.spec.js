import { test, expect } from '@playwright/test';

// ============================================================
// MANAJEMEN KEMASAN (PACKAGING)
// ============================================================

test.describe('Packaging (Admin)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa melihat daftar Packaging Items', async ({ page }) => {
        await page.goto('/packaging/items');
        await expect(page).toHaveURL(/.*\/packaging\/items/);
    });

    test('Admin bisa melihat daftar Color Standards', async ({ page }) => {
        await page.goto('/packaging/colors');
        await expect(page).toHaveURL(/.*\/packaging\/colors/);
    });
});

test.describe('Packaging (R&D)', () => {
    test.use({ storageState: 'playwright/.auth/rd.json' });

    test('R&D bisa melihat daftar Packaging Items', async ({ page }) => {
        await page.goto('/packaging/items');
        await expect(page).toHaveURL(/.*\/packaging\/items/);
    });

    test('R&D bisa membuat Packaging Item baru', async ({ page }) => {
        await page.goto('/packaging/items/create');
        await expect(page).toHaveURL(/.*\/packaging\/items\/create/);
    });

    test('R&D bisa melihat daftar Color Standards', async ({ page }) => {
        await page.goto('/packaging/colors');
        await expect(page).toHaveURL(/.*\/packaging\/colors/);
    });

    test('R&D bisa membuat Color Standard baru', async ({ page }) => {
        await page.goto('/packaging/colors/create');
        await expect(page).toHaveURL(/.*\/packaging\/colors\/create/);
    });
});

test.describe('Packaging (QC)', () => {
    test.use({ storageState: 'playwright/.auth/qc.json' });

    test('QC bisa melihat daftar Packaging Items', async ({ page }) => {
        await page.goto('/packaging/items');
        await expect(page).toHaveURL(/.*\/packaging\/items/);
    });

    test('QC bisa melihat daftar Color Standards', async ({ page }) => {
        await page.goto('/packaging/colors');
        await expect(page).toHaveURL(/.*\/packaging\/colors/);
    });

    test('QC TIDAK bisa membuat Packaging Item (role restricted)', async ({ page }) => {
        await page.goto('/packaging/items/create');

        const url = page.url();
        expect(url).not.toContain('/packaging/items/create');
    });
});

test.describe('Packaging (Marketing)', () => {
    test.use({ storageState: 'playwright/.auth/marketing.json' });

    test('Marketing bisa melihat daftar Packaging Items', async ({ page }) => {
        await page.goto('/packaging/items');
        await expect(page).toHaveURL(/.*\/packaging\/items/);
    });

    test('Marketing TIDAK bisa membuat Packaging Item', async ({ page }) => {
        await page.goto('/packaging/items/create');

        const url = page.url();
        expect(url).not.toContain('/packaging/items/create');
    });
});
