import { expect, test } from '@playwright/test';

test('creates a lead and preserves it after navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Add lead' }).first().click();
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Source').selectOption('Website');
  await page.getByLabel('Service').selectOption('AI agent');
  await page.getByRole('button', { name: 'Save lead' }).click();
  await expect(page.getByRole('status')).toHaveText('Lead saved.');
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await expect(page.getByLabel('Name')).toHaveValue('Ada Lovelace');
  await expect(page.getByLabel('Service')).toHaveValue('AI agent');
});

test('form is usable at mobile and desktop widths', async ({ page }) => {
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/leads/new');
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save lead' })).toBeVisible();
  }
});
