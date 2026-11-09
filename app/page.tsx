'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLeads } from '@/lib/leads';
import type { Lead } from '@/lib/types';

export default function Home() {
  return <Suspense fallback={<p>Loading leads…</p>}><LeadList /></Suspense>;
}

function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const search = useSearchParams();
  useEffect(() => { setLeads(getLeads()); }, []);
  return <><h1>Leads</h1>{search.get('saved') === '1' && <p role="status">Lead saved.</p>}<Link className="button" href="/leads/new">Add lead</Link>{leads.length ? <ul>{leads.map((lead) => <li key={lead.id}><strong>{lead.name}</strong> — {lead.company} <Link href={`/leads/edit?id=${lead.id}`}>Edit</Link></li>)}</ul> : <p>No leads yet.</p>}</>;
}
