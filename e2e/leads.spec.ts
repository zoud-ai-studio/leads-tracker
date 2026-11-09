import { expect, test } from '@playwright/test';
import { services, sources } from '../lib/types';

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

test('form is usable at mobile and desktop widths', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/leads/new');
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save lead' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`form-${viewport.width}.png`), fullPage: true });
  }
});

test('form browser boundaries save valid values, reject 501 characters, and retain every choice', async ({ page }) => {
  await page.goto('/leads/new');
  await page.getByLabel('Name').fill('A'.repeat(500));
  await page.getByLabel('Estimated value').fill('0.01');
  for (const source of sources) {
    await page.getByLabel('Source').selectOption(source);
    await expect(page.getByLabel('Source')).toHaveValue(source);
  }
  for (const service of services) {
    await page.getByLabel('Service').selectOption(service);
    await expect(page.getByLabel('Service')).toHaveValue(service);
  }
  await page.getByLabel('Source').selectOption('Referral');
  await page.getByLabel('Service').selectOption('Web app');
  await page.getByRole('button', { name: 'Save lead' }).click();
  await expect(page.getByRole('row', { name: /A{30}/ })).toBeVisible();
  await page.reload();
  await page.getByRole('link', { name: 'Edit' }).click();
  await expect(page.getByLabel('Name')).toHaveValue('A'.repeat(500));
  await expect(page.getByLabel('Estimated value')).toHaveValue('0.01');
  await expect(page.getByLabel('Source')).toHaveValue('Referral');
  await expect(page.getByLabel('Service')).toHaveValue('Web app');

  await page.goto('/leads/new');
  await page.getByLabel('Name').fill('B'.repeat(501));
  await expect(page.locator('span[role="alert"]')).toHaveText('Name must be 500 characters or less');
  await expect(page.getByRole('button', { name: 'Save lead' })).toBeDisabled();
  await page.getByLabel('Name').fill('Boundary amount');
  await page.getByLabel('Estimated value').fill('1234.50');
  await page.getByRole('button', { name: 'Save lead' }).click();
  await expect(page.getByRole('row', { name: /Boundary amount.*AED 1,234\.50/ })).toBeVisible();

  await page.getByRole('link', { name: 'Add lead' }).first().click();
  await page.getByLabel('Name').fill('Will clear');
  await page.getByLabel('Name').fill('');
  await page.getByLabel('Company').focus();
  await expect(page.locator('span[role="alert"]')).toHaveText('Name is required');
});

test('discarding an unsaved form leaves a fresh form empty on return', async ({ page }) => {
  await page.goto('/leads/new');
  await page.getByLabel('Name').fill('Unsaved Ada');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('link', { name: 'Cancel' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('link', { name: 'Add lead' }).first().click();
  await expect(page.getByLabel('Name')).toHaveValue('');
});

test('board orders stages, moves a lead, and persists the move after reload', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('leads-tracker:v1')) {
      localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [{
        id: 'ada', name: 'Ada Lovelace', company: 'Analytical Engines', source: 'Website', service: 'AI agent',
        estimatedValue: 12500, stage: 'New', activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
      }] }));
    }
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

  await page.getByRole('button', { name: 'Move to' }).click();
  await page.getByLabel('Move to').selectOption('New');
  await expect(page.locator('.board-column').filter({ has: page.getByRole('heading', { name: 'New' }) }).getByText('Ada Lovelace')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('leads-tracker:v1') ?? '{}').leads[0].wonAt)).toBeUndefined();
});

test('board synchronizes a move across tabs and formats the AED edge values', async ({ context, page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [
      { id: 'zero', name: 'Zero', source: 'Website', service: 'Website', estimatedValue: 0, stage: 'New', activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'maximum', name: 'Maximum', source: 'Website', service: 'Website', estimatedValue: 10000000, stage: 'Won', activities: [], wonAt: '2026-01-01', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
    ] }));
  });
  const secondTab = await context.newPage();
  await page.goto('/board');
  await secondTab.goto('/board');
  await expect(page.getByText('AED 0.00')).toBeVisible();
  await expect(page.getByText('AED 10,000,000.00')).toBeVisible();
  await page.locator('.lead-card').filter({ hasText: 'Zero' }).getByRole('button', { name: 'Move to' }).click();
  await page.locator('.lead-card').filter({ hasText: 'Zero' }).getByLabel('Move to').selectOption('Won');
  await secondTab.reload();
  await expect(secondTab.locator('.board-column').filter({ has: secondTab.getByRole('heading', { name: 'Won' }) }).getByText('Zero')).toBeVisible();
});

test('board shows all empty columns without horizontal scrolling at mobile and desktop widths', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/board');
    await expect(page.locator('.board-column')).toHaveCount(5);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`board-${viewport.width}.png`), fullPage: true });
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
  await page.getByRole('button', { name: 'Estimated value' }).click();
  await expect(page.getByRole('row').nth(1)).toContainText('John Smith');
  await page.getByLabel('Search leads').fill('no match');
  await expect(page.getByText('No leads found')).toBeVisible();
});

test('list filters each source and sorts missing follow-up dates last', async ({ page }) => {
  await page.addInitScript(() => {
    const sourceNames = ['Website', 'Referral', 'LinkedIn', 'WhatsApp', 'Other'] as const;
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: sourceNames.map((source, index) => ({
      id: source.toLowerCase(), name: `${source} lead`, source, service: 'Website', estimatedValue: index,
      stage: 'New', nextFollowUpDate: index === 0 ? undefined : `2026-06-0${index}`,
      activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
    })) }));
  });
  await page.goto('/');
  for (const source of sources) {
    await page.getByLabel('Source').selectOption(source);
    await expect(page.getByRole('row').nth(1)).toContainText(`${source} lead`);
    await expect(page.getByRole('row')).toHaveCount(2);
  }
  await page.getByLabel('Source').selectOption('');
  await page.getByRole('button', { name: 'Next follow-up date' }).click();
  await expect(page.getByRole('row').nth(1)).toContainText('Referral lead');
  await expect(page.getByRole('row').last()).toContainText('Website lead');
});

test('list fits at mobile and shows all columns at desktop widths', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`list-${viewport.width}.png`), fullPage: true });
  }
  await expect(page.getByRole('button', { name: 'Last updated' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('No leads yet.')).toBeVisible();
});

test('activity log orders three same-date notes and renders 100 notes', async ({ page }) => {
  await page.addInitScript(() => {
    const activities = Array.from({ length: 100 }, (_, index) => ({ id: String(index).padStart(3, '0'), body: `Seed note ${index}`, occurredOn: '2026-06-15', createdAt: `2026-06-15T12:00:${String(index % 60).padStart(2, '0')}.000Z` }));
    localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [{ id: 'ada', name: 'Ada Lovelace', source: 'Website', service: 'Website', estimatedValue: 0, stage: 'New', activities, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }] }));
  });
  await page.goto('/leads/view?id=ada');
  await expect(page.locator('.activity-log li')).toHaveCount(100);
  await page.getByLabel('Add a note').fill('First same-day note');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.getByLabel('Add a note').fill('Second same-day note');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.getByLabel('Add a note').fill('Third same-day note');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.locator('.activity-log li')).toHaveCount(103);
  await expect(page.locator('.activity-log li').first()).toContainText('Third same-day note');
  await expect(page.locator('.activity-log li').nth(1)).toContainText('Second same-day note');
  await expect(page.locator('.activity-log li').nth(2)).toContainText('First same-day note');
  expect(await page.locator('.activity-log time').evaluateAll((times) => new Set(times.slice(0, 3).map((time) => time.getAttribute('datetime'))).size)).toBe(1);
});

test('dashboard uses local calendar dates at 1 AM and 11:59 PM and updates after Won to New', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-06-15T01:00:00.000Z') });
  await page.addInitScript(() => {
    if (!localStorage.getItem('leads-tracker:v1')) localStorage.setItem('leads-tracker:v1', JSON.stringify({ version: 1, leads: [{ id: 'today', name: 'Today lead', source: 'Website', service: 'Website', estimatedValue: 1000, stage: 'Won', wonAt: '2026-06-15', nextFollowUpDate: '2026-06-15', activities: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }] }));
  });
  await page.goto('/dashboard');
  await expect(page.getByText('Today lead')).toBeVisible();
  await expect(page.getByText('AED 1,000.00')).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-06-15T23:59:00.000Z'));
  await page.reload();
  await expect(page.getByText('Today lead')).toBeVisible();
  await page.goto('/board');
  await page.getByRole('button', { name: 'Move to' }).click();
  await page.getByLabel('Move to').selectOption('New');
  await page.goto('/dashboard');
  await expect(page.locator('section').filter({ hasText: 'Open pipeline value' }).getByText('AED 0.00')).toBeVisible();
  await expect(page.getByText('—%')).toBeVisible();
});

test('dashboard shows aggregate stats and fits mobile and desktop layouts', async ({ page }, testInfo) => {
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
    await page.screenshot({ path: testInfo.outputPath(`dashboard-${viewport.width}.png`), fullPage: true });
  }
});
