import { expect, it } from 'vitest';
import { leadsToCsv } from './csv';
import type { Lead } from './types';

it('exports fixed headers, escaped textual cells, and raw AED values', () => {
  const lead: Lead = { id: '1', name: '=Ada, "Ace"', company: 'Line\nbreak', email: 'a@example.com', phone: '+971', source: 'Website', service: 'AI agent', estimatedValue: 1234.5, stage: 'Won', nextFollowUpDate: '2026-04-15', notes: '@note', activities: [], createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-02T00:00:00.000Z', wonAt: '2026-04-03' };
  expect(leadsToCsv([lead])).toBe('Name,Company,Email,Phone,Source,Service,Estimated value,Stage,Next follow-up date,Notes,Created at,Updated at,Won at\r\n"\'=Ada, ""Ace""","Line\nbreak",a@example.com,\'+971,Website,AI agent,1234.5,Won,2026-04-15,\'@note,2026-04-01T00:00:00.000Z,2026-04-02T00:00:00.000Z,2026-04-03');
});
