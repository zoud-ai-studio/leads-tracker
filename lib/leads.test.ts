import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLead, getLeads, queryLeads, saveLead, updateLeadStage } from './leads';
import type { Lead } from './types';

const lead = (overrides: Partial<Lead>): Lead => ({
  id: crypto.randomUUID(),
  name: 'Ada Lovelace',
  company: 'Analytical Engines',
  source: 'Website',
  service: 'AI agent',
  estimatedValue: 1000,
  stage: 'New',
  activities: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
});

describe('lead repository', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('persists a valid lead in the versioned envelope', () => {
    const lead = createLead({ name: 'Ada', email: 'ada@example.com', estimatedValue: '0', source: 'Website', service: 'Website', stage: 'New' });
    saveLead(lead);

    expect(getLeads()).toEqual([lead]);
    expect(JSON.parse(localStorage.getItem('leads-tracker:v1') ?? '')).toMatchObject({ version: 1, leads: [lead] });
  });

  it('updates an existing lead and sets the update timestamp', () => {
    const lead = createLead({ name: 'Ada', estimatedValue: '', source: 'Website', service: 'Website', stage: 'New' });
    saveLead(lead);
    const changed = { ...lead, name: 'Grace', updatedAt: new Date(Date.now() + 1).toISOString() };
    saveLead(changed);

    expect(getLeads()).toHaveLength(1);
    expect(getLeads()[0].name).toBe('Grace');
  });

  it('persists a stage move and records the Won transition', () => {
    const lead = createLead({ name: 'Ada', estimatedValue: '12500', source: 'Website', service: 'Website', stage: 'New' });
    saveLead(lead);

    updateLeadStage(lead.id, 'Won');

    expect(getLeads()[0]).toMatchObject({ stage: 'Won', wonAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) });
    expect(JSON.parse(localStorage.getItem('leads-tracker:v1') ?? '').leads[0].stage).toBe('Won');
  });

  it('does not read browser storage during module import', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    await import('./leads');
    expect(getItem).not.toHaveBeenCalled();
  });
});

describe('lead list queries', () => {
  const leads = [
    lead({ id: 'ada', name: 'Ada Lovelace', company: 'Acme Corp', source: 'Website', stage: 'New', estimatedValue: 1000, nextFollowUpDate: '2026-04-20', updatedAt: '2026-04-10T09:00:00.000Z' }),
    lead({ id: 'john', name: 'John Smith', company: 'Beacon', source: 'LinkedIn', stage: 'Won', estimatedValue: 5000, nextFollowUpDate: '2026-04-10', updatedAt: '2026-04-12T09:00:00.000Z' }),
    lead({ id: 'grace', name: 'Grace Hopper', company: 'ACME Labs', source: 'LinkedIn', stage: 'Won', estimatedValue: 2500, updatedAt: '2026-04-11T09:00:00.000Z' })
  ];

  it('finds names and companies case-insensitively', () => {
    expect(queryLeads(leads, { search: 'john' }).map((item) => item.id)).toEqual(['john']);
    expect(queryLeads(leads, { search: 'acme' }).map((item) => item.id)).toEqual(['ada', 'grace']);
  });

  it('combines stage and source filters', () => {
    expect(queryLeads(leads, { stage: 'Won', source: 'LinkedIn' }).map((item) => item.id)).toEqual(['john', 'grace']);
  });

  it('sorts follow-up dates ascending with undated leads last', () => {
    expect(queryLeads(leads, { sort: 'nextFollowUpDate' }).map((item) => item.id)).toEqual(['john', 'ada', 'grace']);
  });

  it('sorts estimated value and last updated descending', () => {
    expect(queryLeads(leads, { sort: 'estimatedValue' }).map((item) => item.id)).toEqual(['john', 'grace', 'ada']);
    expect(queryLeads(leads, { sort: 'updatedAt' }).map((item) => item.id)).toEqual(['john', 'grace', 'ada']);
  });
});
