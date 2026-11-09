'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatTile } from '@/components/StatTile';
import { dashboardSummary } from '@/lib/dashboard';
import { formatAed } from '@/lib/format';
import { getLeads } from '@/lib/leads';
import type { Lead } from '@/lib/types';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  useEffect(() => { const refresh = () => setLeads(getLeads()); refresh(); window.addEventListener('storage', refresh); return () => window.removeEventListener('storage', refresh); }, []);
  const summary = dashboardSummary(leads);
  return <><h1>Dashboard</h1><div className="stat-grid"><StatTile label="Open pipeline value" value={formatAed(summary.openPipelineValue)} /><StatTile label="Won this month" value={formatAed(summary.wonThisMonth)} /><StatTile label="Win rate" value={summary.winRate === null ? '—%' : `${summary.winRate}%`} /></div><section><h2>Leads per stage</h2><div className="stat-grid stage-grid">{Object.entries(summary.perStage).map(([stage, count]) => <StatTile key={stage} label={stage} value={count} />)}</div></section><section><h2>Follow up today</h2>{summary.followUpToday.length ? <ul>{summary.followUpToday.map((lead) => <li key={lead.id}><Link href={`/leads/view?id=${lead.id}`}>{lead.name}</Link> — {lead.nextFollowUpDate}</li>)}</ul> : <p>No follow-ups due.</p>}</section></>;
}
