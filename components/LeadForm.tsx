'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { services, sources, stages, type LeadDraft } from '@/lib/types';
import { validateDraft } from '@/lib/leads';

const blank: LeadDraft = { name: '', company: '', email: '', phone: '', source: 'Website', service: 'Website', estimatedValue: '', stage: 'New', nextFollowUpDate: '', notes: '' };

export function LeadForm({ initial = blank, onSave }: { initial?: LeadDraft; onSave: (draft: LeadDraft) => void }) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const errors = useMemo(() => validateDraft(draft), [draft]);
  const change = (field: keyof LeadDraft, value: string) => { setDirty(true); setDraft((current) => ({ ...current, [field]: value })); };
  const discard = () => !dirty || window.confirm('You have unsaved changes. Discard them?');

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  return <form onSubmit={(event) => { event.preventDefault(); if (!Object.keys(errors).length) onSave(draft); }}>
    <fieldset><legend>Lead details</legend>
      <Field label="Name" value={draft.name} onChange={(value) => change('name', value)} error={errors.name} required />
      <Field label="Company" value={draft.company ?? ''} onChange={(value) => change('company', value)} />
      <Field label="Email" type="email" value={draft.email ?? ''} onChange={(value) => change('email', value)} error={errors.email} />
      <Field label="Phone" value={draft.phone ?? ''} onChange={(value) => change('phone', value)} />
      <Select label="Source" value={draft.source} options={sources} onChange={(value) => change('source', value)} />
      <Select label="Service" value={draft.service} options={services} onChange={(value) => change('service', value)} />
      <Field label="Estimated value" type="number" value={draft.estimatedValue} onChange={(value) => change('estimatedValue', value)} error={errors.estimatedValue} />
      <Select label="Stage" value={draft.stage} options={stages} onChange={(value) => change('stage', value)} />
      <Field label="Next follow-up date" type="date" value={draft.nextFollowUpDate ?? ''} onChange={(value) => change('nextFollowUpDate', value)} />
      <label>Notes<textarea value={draft.notes ?? ''} onChange={(event) => change('notes', event.target.value)} /></label>
    </fieldset>
    <div className="actions"><button type="submit" disabled={Object.keys(errors).length > 0}>Save lead</button><Link href="/" onClick={(event) => { if (!discard()) event.preventDefault(); }}>Cancel</Link></div>
  </form>;
}

function Field({ label, error, ...props }: { label: string; value: string; error?: string; type?: string; required?: boolean; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replaceAll(' ', '-');
  const errorId = `${id}-error`;
  return <div><label htmlFor={id}>{label}</label><input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...props} onChange={(event) => props.onChange(event.target.value)} />{error && <span id={errorId} role="alert">{error}</span>}</div>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
