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

test('list searches, filters, sorts, and reports no results', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [
      { id: 'ada', name: 'Ada Lovelace', company: 'Acme Corp', source: 'Website', service: 'AI agent', estimatedValue: 1000, stage: 'New', nextFollowUpDate: '2026-04-20', activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-04-10T09:00:00.000Z' },
      { id: 'john', name: 'John Smith', company: 'Beacon', source: 'LinkedIn', service: 'Website', estimatedValue: 5000, stage: 'Won', nextFollowUpDate: '2026-04-10', activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-04-12T09:00:00.000Z' }
    ] }));
  });
  await page.goto('/');

  await page.getByLabel('Search leads').fill('acme');
  await expect(page.getByRole('row', { name: /Ada Lovelace/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /John Smith/ })).not.toBeVisible();
  await page.getByLabel('Search leads').fill('');
  await page.getByLabel('Stage').selectOption('Won');
  await page.getByLabel('Source').selectOption('LinkedIn');
  await expect(page.getByRole('row', { name: /John Smith/ })).toBeVisible();
  await page.getByRole('columnheader', { name: 'Estimated value' }).click();
  await expect(page.getByRole('row').nth(1)).toContainText('John Smith');
  await page.getByLabel('Search leads').fill('no match');
  await expect(page.getByText('No leads found')).toBeVisible();
});

test('list fits at mobile and shows all columns at desktop widths', async ({ page }) => {
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.getByRole('columnheader', { name: 'Last updated' })).toBeVisible();
});

test('detail page adds activities and deletes the lead after confirmation', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [{
      id: 'ada', name: 'Ada Lovelace', company: 'Analytical Engines', email: 'ada@example.com', phone: '+971', source: 'Website', service: 'AI agent', estimatedValue: 1200, stage: 'New', nextFollowUpDate: '2026-04-15', notes: 'Memo', activities: [], createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z'
    }] }));
  });
  await page.goto('/leads/view?id=ada');
  await expect(page.getByText('Analytical Engines')).toBeVisible();
  await page.getByLabel('Add a note').fill('Checked with client');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByText('Checked with client')).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Are you sure you want to delete this lead? This action cannot be undone.');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('No leads yet.')).toBeVisible();
});

test('dashboard shows aggregate stats and fits mobile and desktop layouts', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [
      { id: 'new', name: 'New', source: 'Website', service: 'Website', estimatedValue: 1000, stage: 'New', activities: [], nextFollowUpDate: '2026-11-09', createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z' },
      { id: 'won', name: 'Won', source: 'Website', service: 'Website', estimatedValue: 5000, stage: 'Won', activities: [], wonAt: '2026-11-01', createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z' },
      { id: 'lost', name: 'Lost', source: 'Website', service: 'Website', estimatedValue: 0, stage: 'Lost', activities: [], createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z' }
    ] }));
  });
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/dashboard');
    await expect(page.getByText('Open pipeline value')).toBeVisible();
    await expect(page.getByText('AED 1,000.00')).toBeVisible();
    await expect(page.getByText('50%')).toBeVisible();
    await expect(page.getByText('Follow up today')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
