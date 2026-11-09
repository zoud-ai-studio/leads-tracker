import type { Lead } from './types';

const header = ['Name', 'Company', 'Email', 'Phone', 'Source', 'Service', 'Estimated value', 'Stage', 'Next follow-up date', 'Notes', 'Created at', 'Updated at', 'Won at'];
const escapeCell = (value: string, textual = true) => {
  const safe = textual && /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

export function leadsToCsv(leads: Lead[]): string {
  const rows = leads.map((lead) => [lead.name, lead.company ?? '', lead.email ?? '', lead.phone ?? '', lead.source, lead.service, String(lead.estimatedValue), lead.stage, lead.nextFollowUpDate ?? '', lead.notes ?? '', lead.createdAt, lead.updatedAt, lead.wonAt ?? ''].map((value, index) => escapeCell(value, index !== 6)).join(','));
  return [header.join(','), ...rows].join('\r\n');
}
