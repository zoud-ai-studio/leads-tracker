'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActivityLog } from '@/components/ActivityLog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { addActivity, deleteLead, getLead } from '@/lib/leads';
import { formatAed } from '@/lib/format';
import type { Lead } from '@/lib/types';

export default function LeadDetailPage() { return <Suspense fallback={<p>Loading lead…</p>}><LeadDetail /></Suspense>; }
function LeadDetail() {
  const id = useSearchParams().get('id') ?? '';
  const router = useRouter();
  const [lead, setLead] = useState<Lead>();
  const [confirming, setConfirming] = useState(false);
  const refresh = () => setLead(getLead(id));
  useEffect(() => { setLead(getLead(id)); }, [id]);
  if (!lead) return <><h1>Lead not found</h1><Link href="/">Back to leads</Link></>;
  const fields: [string, string][] = [['Name', lead.name], ['Company', lead.company || '—'], ['Email', lead.email || '—'], ['Phone', lead.phone || '—'], ['Source', lead.source], ['Service', lead.service], ['Estimated value', formatAed(lead.estimatedValue)], ['Stage', lead.stage], ['Next follow-up date', lead.nextFollowUpDate || '—'], ['Notes', lead.notes || '—']];
  return <><div className="page-heading"><h1>{lead.name}</h1><div className="actions"><Link className="button" href={`/leads/edit?id=${lead.id}`}>Edit</Link><button type="button" onClick={() => setConfirming(true)}>Delete</button></div></div><dl className="lead-details">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><ActivityLog activities={lead.activities} onAdd={(body) => { addActivity(lead.id, body); refresh(); }} /><ConfirmDialog open={confirming} onCancel={() => setConfirming(false)} onConfirm={() => { deleteLead(lead.id); router.push('/'); }} /></>;
}
