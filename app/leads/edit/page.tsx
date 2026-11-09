'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LeadForm } from '@/components/LeadForm';
import { getLead, saveLead, toDraft } from '@/lib/leads';
import type { Lead } from '@/lib/types';

export default function EditLeadPage() {
  return <Suspense fallback={<p>Loading lead…</p>}><EditLeadForm /></Suspense>;
}

function EditLeadForm() {
  const router = useRouter(); const search = useSearchParams(); const [lead, setLead] = useState<Lead>();
  useEffect(() => { const id = search.get('id'); if (id) setLead(getLead(id)); }, [search]);
  if (!lead) return <p>Lead not found.</p>;
  return <><h1>Edit lead</h1><LeadForm initial={toDraft(lead)} onSave={(draft) => { saveLead({ ...lead, ...draft, name: draft.name.trim(), estimatedValue: Number(draft.estimatedValue || 0), updatedAt: new Date().toISOString() }); router.push('/?saved=1'); }} /></>;
}
