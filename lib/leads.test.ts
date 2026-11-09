import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addActivity, createLead, deleteLead, getLeads, localDate, queryLeads, saveLead, updateLeadStage, validateDraft } from './leads';
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

    updateLeadStage(lead.id, 'New');
    expect(getLeads()[0]).toMatchObject({ stage: 'New' });
    expect(getLeads()[0]).not.toHaveProperty('wonAt');
  });

  it('adds activities using the local calendar date and orders tied entries newest first', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 1, 0));
    const item = createLead({ name: 'Ada', estimatedValue: '', source: 'Website', service: 'Website', stage: 'New' });
    saveLead(item);
    addActivity(item.id, 'First note');
    vi.setSystemTime(new Date(2026, 3, 15, 1, 1));
    addActivity(item.id, 'Second note');

    expect(getLeads()[0].activities.map((activity) => activity.body)).toEqual(['Second note', 'First note']);
    expect(getLeads()[0].activities[0].occurredOn).toBe('2026-04-15');
    vi.useRealTimers();
  });

  it('keeps a 100-note activity log newest first', () => {
    const item = lead({ id: 'many-notes' });
    saveLead(item);
    for (let index = 0; index < 100; index += 1) addActivity(item.id, `Note ${index}`);

    const activities = getLeads()[0].activities;
    expect(activities).toHaveLength(100);
    expect(activities.map((activity) => activity.createdAt)).toEqual([...activities].map((activity) => activity.createdAt).sort().reverse());
  });

  it('uses the browser-local date at early and late local times', () => {
    expect(localDate(new Date(2026, 3, 15, 1, 0))).toBe('2026-04-15');
    expect(localDate(new Date(2026, 3, 15, 23, 59))).toBe('2026-04-15');
  });

  it('deletes a lead and all of its activities', () => {
    const item = lead({ id: 'delete-me', activities: [{ id: 'activity', body: 'Remove me', occurredOn: '2026-04-15', createdAt: '2026-04-15T01:00:00.000Z' }] });
    saveLead(item);

    deleteLead(item.id);

    expect(getLeads()).toEqual([]);
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

  it('filters every supported source and retains undated leads at the end of follow-up sorting', () => {
    const bySource = ['Website', 'Referral', 'LinkedIn', 'WhatsApp', 'Other'] as const;
    const sourceLeads = bySource.map((source, index) => lead({ id: source, source, nextFollowUpDate: index === 0 ? undefined : `2026-04-0${index}` }));
    for (const source of bySource) expect(queryLeads(sourceLeads, { source }).map((item) => item.source)).toEqual([source]);
    expect(queryLeads(sourceLeads, { sort: 'nextFollowUpDate' }).at(-1)?.source).toBe('Website');
  });

  it('accepts boundary values and rejects a 501-character name', () => {
    const draft = { name: 'A'.repeat(500), estimatedValue: '0.01', source: 'Website' as const, service: 'Website' as const, stage: 'New' as const };
    expect(validateDraft(draft)).toEqual({});
    expect(validateDraft({ ...draft, estimatedValue: '1234.50' })).toEqual({});
    expect(validateDraft({ ...draft, name: 'A'.repeat(501) })).toMatchObject({ name: 'Name must be 500 characters or less' });
  });
});
