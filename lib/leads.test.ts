import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLead, getLeads, saveLead } from './leads';

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

  it('does not read browser storage during module import', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    await import('./leads');
    expect(getItem).not.toHaveBeenCalled();
  });
});
