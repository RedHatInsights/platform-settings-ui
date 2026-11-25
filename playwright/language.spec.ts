import { expect, test } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

const languageUrl = '/settings/user-preferences/language';

test.beforeEach(async ({ page }) => {
  await disableCookiePrompt(page);
});

test('Language loads directly and survives refresh', async ({ page }) => {
  await page.goto(languageUrl, { waitUntil: 'domcontentloaded' });
  const heading = page.getByRole('heading', { name: 'Language', exact: true });

  await expect(heading).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(heading).toBeVisible();
});

test('undefined Language child paths show the app fallback', async ({ page }) => {
  await page.goto(`${languageUrl}/missing`, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Language page not found' }),
  ).toBeVisible();
});
