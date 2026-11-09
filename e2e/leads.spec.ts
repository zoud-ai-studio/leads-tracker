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

test('board orders stages, moves a lead, and persists the move after reload', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [{
      id: 'ada', name: 'Ada Lovelace', company: 'Analytical Engines', source: 'Website', service: 'AI agent',
      estimatedValue: 12500, stage: 'New', activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
    }] }));
  });
  await page.goto('/board');

  await expect(page.locator('.board-column h2')).toHaveText(['New', 'Contacted', 'Quoted', 'Won', 'Lost']);
  await expect(page.getByText('AED 12,500.00')).toBeVisible();
  await page.getByRole('button', { name: 'Move to' }).click();
  await expect(page.getByRole('option')).toHaveCount(5);
  await page.getByLabel('Move to').selectOption('Won');
  await expect(page.locator('.board-column').filter({ has: page.getByRole('heading', { name: 'Won' }) }).getByText('Ada Lovelace')).toBeVisible();

  await page.reload();
  await expect(page.locator('.board-column').filter({ has: page.getByRole('heading', { name: 'Won' }) }).getByText('Ada Lovelace')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('leads-tracker:v1') ?? '{}').leads[0].stage)).toBe('Won');
});

test('board shows all empty columns without horizontal scrolling at mobile and desktop widths', async ({ page }) => {
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/board');
    await expect(page.locator('.board-column')).toHaveCount(5);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
