import type { Lead, LeadDraft, Stage } from './types';

const storageKey = 'leads-tracker:v1';
type StoredLeads = { version: 1; leads: Lead[] };

export function validateDraft(draft: LeadDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = 'Name is required';
  if (draft.name.length > 500) errors.name = 'Name must be 500 characters or less';
  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) errors.email = 'Enter a valid email address';
  if (draft.estimatedValue) {
    const value = Number(draft.estimatedValue);
    if (!Number.isFinite(value) || value < 0 || value > 10_000_000) errors.estimatedValue = 'Value must be 10,000,000 or less';
    else if (!/^\d+(\.\d{1,2})?$/.test(draft.estimatedValue)) errors.estimatedValue = 'Value must have at most 2 decimal places';
  }
  return errors;
}

export function getLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    const stored = JSON.parse(raw) as StoredLeads;
    return stored.version === 1 && Array.isArray(stored.leads) ? stored.leads : [];
  } catch { return []; }
}

export function getLead(id: string): Lead | undefined { return getLeads().find((lead) => lead.id === id); }

export function saveLead(lead: Lead): void {
  const leads = getLeads();
  const index = leads.findIndex((item) => item.id === lead.id);
  const existing = leads[index];
  const stageChanged = Boolean(existing && existing.stage !== lead.stage);
  const persisted = existing ? {
    ...lead,
    updatedAt: new Date().toISOString(),
    wonAt: stageChanged ? (lead.stage === 'Won' ? localDate() : undefined) : lead.wonAt
  } : lead;
  if (index === -1) leads.push(persisted); else leads[index] = persisted;
  window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, leads } satisfies StoredLeads));
}

export function updateLeadStage(id: string, stage: Stage): Lead | undefined {
  const lead = getLead(id);
  if (!lead) return undefined;
  const updated = { ...lead, stage };
  saveLead(updated);
  return getLead(id);
}

function localDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createLead(draft: LeadDraft): Lead {
  const now = new Date().toISOString();
  return { ...draft, name: draft.name.trim(), estimatedValue: Number(draft.estimatedValue || 0), id: crypto.randomUUID(), activities: [], createdAt: now, updatedAt: now };
}

export function toDraft(lead: Lead): LeadDraft {
  return {
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    service: lead.service,
    estimatedValue: String(lead.estimatedValue),
    stage: lead.stage,
    nextFollowUpDate: lead.nextFollowUpDate,
    notes: lead.notes
  };
}
