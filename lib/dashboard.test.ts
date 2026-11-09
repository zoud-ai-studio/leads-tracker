import { describe, expect, it } from 'vitest';
import { dashboardSummary } from './dashboard';
import type { Lead } from './types';

const lead = (overrides: Partial<Lead>): Lead => ({
  id: crypto.randomUUID(), name: 'Lead', source: 'Website', service: 'Website', estimatedValue: 0,
  stage: 'New', activities: [], createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z', ...overrides
});

describe('dashboard summary', () => {
  it('calculates stage totals, open value, won value, and win rate', () => {
    const summary = dashboardSummary([
      lead({ stage: 'New', estimatedValue: 1000 }), lead({ stage: 'Contacted', estimatedValue: 2000 }),
      lead({ stage: 'Quoted', estimatedValue: 3000 }), lead({ stage: 'Won', estimatedValue: 5000, wonAt: '2026-04-10' }),
      lead({ stage: 'Won' }), lead({ stage: 'Won' }), lead({ stage: 'Lost' })
    ], '2026-04-15');
    expect(summary.perStage).toEqual({ New: 1, Contacted: 1, Quoted: 1, Won: 3, Lost: 1 });
    expect(summary.openPipelineValue).toBe(6000);
    expect(summary.wonThisMonth).toBe(5000);
    expect(summary.winRate).toBe(75);
  });

  it('uses local date strings for due and past-due follow-ups and handles zero closed leads', () => {
    expect(dashboardSummary([lead({ nextFollowUpDate: '2026-04-15' }), lead({ nextFollowUpDate: '2026-04-14' }), lead({ nextFollowUpDate: '2026-04-16' })], '2026-04-15').followUpToday).toHaveLength(2);
    expect(dashboardSummary([lead({ stage: 'Lost' })], '2026-04-15').winRate).toBe(0);
    expect(dashboardSummary([lead({ stage: 'New' })], '2026-04-15').winRate).toBeNull();
  });
});
