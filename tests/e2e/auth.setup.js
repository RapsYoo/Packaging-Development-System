import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';


if (!fs.existsSync('playwright/.auth')) {
    fs.mkdirSync('playwright/.auth', { recursive: true });
}


const users = [
    { role: 'admin', email: 'admin@priskila.co.id', password: 'admin123' },
    { role: 'marketing', email: 'tesmarketing@gmail.com', password: '12345678' },
    { role: 'bod', email: 'tesbod@gmail.com', password: '12345678' },
    { role: 'rd', email: 'tesrnd@gmail.com', password: '12345678' },
    { role: 'scm', email: 'tesscm@gmail.com', password: '12345678' },
    { role: 'qc', email: 'tesqc@gmail.com', password: '12345678' },
    { role: 'qa', email: 'tesqa@gmail.com', password: '12345678' },
    { role: 'supplier', email: 'supplier@demo.com', password: '12345678' },
];

users.forEach((user) => {
    setup(`Autentikasi sebagai ${user.role}`, async ({ page }) => {
        const authFile = `playwright/.auth/${user.role}.json`;

        // Proses Login
        await page.goto('/login');
        await page.fill('input[type="email"]', user.email);

        // Set password sesuai akun masing-masing
        await page.fill('input[type="password"]', user.password);

        // Tunggu navigasi selesai agar tidak kena error React Hydration
        await Promise.all([
            page.waitForNavigation(),
            page.click('button:has-text("Log in")')
        ]);

        await expect(page).toHaveURL(/.*dashboard/);

        // Simpan sesi login ke file JSON
        await page.context().storageState({ path: authFile });
    });
});
