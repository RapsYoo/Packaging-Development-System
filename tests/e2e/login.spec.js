import { test, expect } from '@playwright/test';

// ============================================================
// MODUL AUTENTIKASI: LOGIN
// ============================================================
test.describe('Login - Semua Role', () => {

    const accounts = [
        { role: 'Admin',    email: 'admin@priskila.co.id',      password: 'admin123' },
        { role: 'Marketing', email: 'tesmarketing@gmail.com',    password: '12345678' },
        { role: 'BOD',      email: 'tesbod@gmail.com',          password: '12345678' },
        { role: 'R&D',      email: 'tesrnd@gmail.com',          password: '12345678' },
        { role: 'Supplier', email: 'supplier@demo.com',         password: '12345678' },
        { role: 'SCM',      email: 'tesscm@gmail.com',          password: '12345678' },
        { role: 'QC',       email: 'tesqc@gmail.com',           password: '12345678' },
        { role: 'QA',       email: 'tesqa@gmail.com',           password: '12345678' },
    ];

    for (const account of accounts) {
        test(`${account.role} berhasil login dengan ${account.email}`, async ({ page }) => {
            await page.goto('/login');

            await page.fill('input#email', account.email);
            await page.fill('input#password', account.password);

            await Promise.all([
                page.waitForURL(/.*dashboard/),
                page.click('button:has-text("Log in")')
            ]);

            await expect(page).toHaveURL(/.*dashboard/);
        });
    }

    test('Login gagal dengan password salah', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input#email', 'admin@priskila.co.id');
        await page.fill('input#password', 'passwordSALAH');

        await page.click('button:has-text("Log in")');

        // Harus tetap di halaman login dan muncul error
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('.text-red-600, .text-sm.text-red-600')).toBeVisible();
    });

    test('Login gagal dengan email tidak terdaftar', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input#email', 'tidakada@priskila.co.id');
        await page.fill('input#password', 'password123');

        await page.click('button:has-text("Log in")');

        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('.text-red-600, .text-sm.text-red-600')).toBeVisible();
    });
});

// ============================================================
// MODUL AUTENTIKASI: REGISTER
// ============================================================
test.describe('Register - User Baru', () => {

    test('Register berhasil dengan data valid', async ({ page }) => {
        await page.goto('/register');
        await expect(page).toHaveURL(/.*register/);

        // Isi form registrasi
        await page.fill('input#name', 'Test User Playwright');
        await page.fill('input#email', 'playwright-test@priskila.co.id');
        await page.fill('input#password', 'password123');
        await page.fill('input#password_confirmation', 'password123');

        await Promise.all([
            page.waitForURL(/.*dashboard/),
            page.click('button:has-text("Register")')
        ]);

        // Setelah register sukses, user otomatis masuk ke dashboard
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('Register gagal jika email sudah terdaftar', async ({ page }) => {
        await page.goto('/register');

        await page.fill('input#name', 'Duplicate User');
        await page.fill('input#email', 'admin@priskila.co.id'); // sudah ada
        await page.fill('input#password', 'password123');
        await page.fill('input#password_confirmation', 'password123');

        await page.click('button:has-text("Register")');

        // Harus tetap di halaman register dan muncul error email
        await expect(page).toHaveURL(/.*register/);
        await expect(page.locator('.text-red-600, .text-sm.text-red-600')).toBeVisible();
    });

    test('Register gagal jika password tidak cocok', async ({ page }) => {
        await page.goto('/register');

        await page.fill('input#name', 'Mismatch User');
        await page.fill('input#email', 'mismatch@priskila.co.id');
        await page.fill('input#password', 'password123');
        await page.fill('input#password_confirmation', 'BEDA_PASSWORD');

        await page.click('button:has-text("Register")');

        await expect(page).toHaveURL(/.*register/);
        await expect(page.locator('.text-red-600, .text-sm.text-red-600')).toBeVisible();
    });

    test('Register gagal jika field kosong', async ({ page }) => {
        await page.goto('/register');

        // Langsung klik Register tanpa mengisi apa pun
        // Browser akan memvalidasi 'required' attribute
        await page.click('button:has-text("Register")');

        // Tetap di halaman register
        await expect(page).toHaveURL(/.*register/);
    });
});

// ============================================================
// MODUL AUTENTIKASI: LOGOUT
// ============================================================
test.describe('Logout', () => {

    test('User bisa logout setelah login', async ({ page }) => {
        // Login dulu
        await page.goto('/login');
        await page.fill('input#email', 'admin@priskila.co.id');
        await page.fill('input#password', 'admin123');

        await Promise.all([
            page.waitForURL(/.*dashboard/),
            page.click('button:has-text("Log in")')
        ]);

        await expect(page).toHaveURL(/.*dashboard/);

        // Cari dan klik dropdown user profile / tombol logout
        // Cek apakah ada tombol nama user di navbar
        const userButton = page.locator('button:has-text("System Administrator"), button:has-text("Admin")').first();
        if (await userButton.isVisible()) {
            await userButton.click();
        }

        // Klik tombol Log Out
        await Promise.all([
            page.waitForURL(/.*login/),
            page.click('button:has-text("Log Out"), a:has-text("Log Out")')
        ]);

        await expect(page).toHaveURL(/.*login/);
    });
});
