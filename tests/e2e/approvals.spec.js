import { test, expect } from '@playwright/test';

// ============================================================
// APPROVAL & WORKFLOW
// ============================================================

test.describe('Approval (Admin)', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test('Admin bisa melihat daftar Approval', async ({ page }) => {
        await page.goto('/approvals');
        await expect(page).toHaveURL(/.*\/approvals/);
    });

    test('Admin bisa melihat Riwayat Approval', async ({ page }) => {
        await page.goto('/approvals/history');
        await expect(page).toHaveURL(/.*\/approvals\/history/);
    });
});

test.describe('Approval (BOD)', () => {
    test.use({ storageState: 'playwright/.auth/bod.json' });

    test('BOD bisa melihat daftar Approval (Evaluasi Konsep)', async ({ page }) => {
        await page.goto('/approvals');
        await expect(page).toHaveURL(/.*\/approvals/);
    });

    test('BOD bisa melihat Riwayat Approval', async ({ page }) => {
        await page.goto('/approvals/history');
        await expect(page).toHaveURL(/.*\/approvals\/history/);
    });
});

test.describe('Approval (Marketing)', () => {
    test.use({ storageState: 'playwright/.auth/marketing.json' });

    test('Marketing bisa melihat daftar Approval', async ({ page }) => {
        await page.goto('/approvals');
        await expect(page).toHaveURL(/.*\/approvals/);
    });
});

test.describe('Approval (R&D)', () => {
    test.use({ storageState: 'playwright/.auth/rd.json' });

    test('R&D bisa melihat daftar Approval', async ({ page }) => {
        await page.goto('/approvals');
        await expect(page).toHaveURL(/.*\/approvals/);
    });
});

test.describe('Approval (QC)', () => {
    test.use({ storageState: 'playwright/.auth/qc.json' });

    test('QC bisa melihat daftar Approval', async ({ page }) => {
        await page.goto('/approvals');
        await expect(page).toHaveURL(/.*\/approvals/);
    });
});
