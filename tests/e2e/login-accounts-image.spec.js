import { test, expect } from '@playwright/test';

// Skrip Playwright untuk tes login dengan email akun pada gambar
test.describe('Login dengan akun pada gambar', () => {

    const accounts = [
        { role: 'QA',          email: 'tesqa@gmail.com',         password: '12345678' },
        { role: 'QC',          email: 'tesqc@gmail.com',         password: '12345678' },
        { role: 'R&D',         email: 'tesrnd@gmail.com',        password: '12345678' },
        { role: 'BOD',         email: 'tesbod@gmail.com',        password: '12345678' },
        { role: 'Marketing',   email: 'tesmarketing@gmail.com',  password: '12345678' },
        { role: 'SCM',         email: 'tesscm@gmail.com',        password: '12345678' },
        { role: 'QC 2',        email: 'tesqc11@gmail.com',       password: '12345678' },
        { role: 'Admin',       email: 'admin@priskila.co.id',    password: 'admin123' }, // Masih sama seperti yang sebelumnya
    ];

    for (const account of accounts) {
        test(`Login berhasil sebagai ${account.role} (${account.email})`, async ({ page }) => {
            // Pergi ke halaman login
            await page.goto('/login');

            // Isi input email dan password
            await page.fill('input#email', account.email);
            await page.fill('input#password', account.password);

            // Klik tombol log in dan tunggu navigasi selesai
            await Promise.all([
                page.waitForURL(/.*dashboard/),
                page.click('button:has-text("Log in")')
            ]);

            // Verifikasi bahwa URL sudah berada di dashboard
            await expect(page).toHaveURL(/.*dashboard/);
        });
    }
});
