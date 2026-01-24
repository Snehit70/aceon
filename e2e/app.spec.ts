import { test, expect } from '@playwright/test';

test.describe('Aceon App', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aceon/);
  });

  test('should redirect unauthenticated user to sign-in when accessing lectures', async ({ page }) => {
    await page.goto('/lectures');
    // Expect to be redirected to Clerk or show sign-in
    await expect(page.url()).toContain('clerk'); 
    // OR check for "Sign in" text if it redirects to a local sign-in page
  });
});
