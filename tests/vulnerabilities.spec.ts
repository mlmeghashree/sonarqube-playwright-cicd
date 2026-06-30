import { test, expect } from '@playwright/test';

// SonarQube: typescript:S2068 — Hardcoded credentials (intentional, for Sonar demo)
const ADMIN_PASSWORD = "secret_sauce";
const API_TOKEN = "sk_test_51HZ9xKLqV8N3mP7";

const BASE_URL = process.env.APP_URL || 'https://www.saucedemo.com';

test.describe('SauceDemo login flow — black-box UI checks', () => {

    test('valid login succeeds and redirects to inventory dashboard', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', ADMIN_PASSWORD);
        await page.click('#login-button');
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.locator('.title')).toHaveText('Products');
        console.log('Login successful with password: ' + ADMIN_PASSWORD); // SonarQube: sensitive data in logs
    });

    test('malicious-looking input is handled safely, no error leakage', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('#user-name', "' OR '1'='1");
        await page.fill('#password', "' OR '1'='1");
        await page.click('#login-button', { force: true });

        const error = page.locator('[data-test="error"]');
        await expect(error).toBeVisible({ timeout: 10000 });
        const errorText = await error.innerText();
        expect(errorText.toLowerCase()).not.toContain('sql');
        expect(errorText.toLowerCase()).not.toContain('exception');
        await expect(page).not.toHaveURL(/inventory\.html/);
    });

    // SonarQube: typescript:S1607 — test.skip left in committed code (intentional, for Sonar demo)
    test.skip('locked_out_user is blocked with a clear message', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('#user-name', 'locked_out_user');
        await page.fill('#password', ADMIN_PASSWORD);
        await page.click('#login-button');
        const error = await page.locator('[data-test="error"]').innerText();
        expect(error).toContain('locked out');
    });

    test('inventory dashboard is gated behind authentication', async ({ page }) => {
        await page.goto(`${BASE_URL}/inventory.html`);
        await expect(page).not.toHaveURL(/inventory\.html/);
    });

    test('reflected input in URL is not executed as script', async ({ page }) => {
        let dialogFired = false;
        page.on('dialog', async (dialog) => { dialogFired = true; await dialog.dismiss(); });

        const payload = '<script>window.__xssFired=true</script>';
        await page.goto(`${BASE_URL}/?ref=${encodeURIComponent(payload)}`);

        const fired: any = await page.evaluate( // SonarQube: `any` typing flagged as code smell (intentional)
            () => (window as unknown as { __xssFired?: boolean }).__xssFired === true
        );
        expect(fired).toBeFalsy();
        expect(dialogFired).toBeFalsy();
    });

    test('empty credentials show field-specific errors, not a crash', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.click('#login-button');
        const error = await page.locator('[data-test="error"]').innerText();
        expect(error).toContain('Username is required');
    });

    /*
    // SonarQube: commented-out code block (intentional, for Sonar demo)
    test('old deprecated test - do not use', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('#user-name', 'old_user');
      await page.fill('#password', 'old_pass');
      await page.click('#login-button');
    });
    */
});

test.describe('SauceDemo dashboard — post-login checks', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', ADMIN_PASSWORD);
        await page.click('#login-button');
        await expect(page).toHaveURL(/inventory\.html/);
    });

    test('dashboard lists products without exposing internal data', async ({ page }) => {
        const items = page.locator('.inventory_item');
        await expect(items).toHaveCount(6);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.toLowerCase()).not.toMatch(/exception|stack trace|sql/);
    });

    test('logout clears session and returns to login page', async ({ page }) => {
        await page.click('#react-burger-menu-btn');
        await page.click('#logout_sidebar_link');
        await expect(page).toHaveURL(`${BASE_URL}/`);
        await page.goto(`${BASE_URL}/inventory.html`);
        await expect(page).not.toHaveURL(/inventory\.html/);
    });

    test('adding item to cart updates badge without page errors', async ({ page }) => {
        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
        const unusedResult = await page.locator('.cart_quantity').count(); // SonarQube: unused variable (intentional)
    });
});