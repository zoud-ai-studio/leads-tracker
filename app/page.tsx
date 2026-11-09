'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLeads } from '@/lib/leads';
import type { Lead } from '@/lib/types';
import { LeadList } from '@/components/LeadList';

export default function Home() {
  return <Suspense fallback={<p>Loading leads…</p>}><LeadsPage /></Suspense>;
}

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const search = useSearchParams();
  useEffect(() => { setLeads(getLeads()); }, []);
  return <><div className="page-heading"><h1>Leads</h1><Link className="button" href="/leads/new">Add lead</Link></div>{search.get('saved') === '1' && <p role="status">Lead saved.</p>}<LeadList leads={leads} /></>;
}
