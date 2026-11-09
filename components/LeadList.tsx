'use client';

import { useMemo, useState } from 'react';
import { Filters } from '@/components/Filters';
import { LeadRow } from '@/components/LeadRow';
import { SearchBar } from '@/components/SearchBar';
import { queryLeads } from '@/lib/leads';
import { leadsToCsv } from '@/lib/csv';
import type { Lead, Source, Stage } from '@/lib/types';

export function LeadList({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<Stage>();
  const [source, setSource] = useState<Source>();
  const [sort, setSort] = useState<'nextFollowUpDate' | 'estimatedValue' | 'updatedAt'>();
  const displayedLeads = useMemo(() => queryLeads(leads, { search, stage, source, sort }), [leads, search, stage, source, sort]);
  const sortBy = (field: typeof sort) => setSort(field);
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([leadsToCsv(displayedLeads)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'leads.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return <section className="lead-list">
    <div className="lead-list-controls"><SearchBar value={search} onChange={setSearch} /><Filters stage={stage} source={source} onStageChange={setStage} onSourceChange={setSource} /><button type="button" onClick={exportCsv}>Export CSV</button></div>
    <div className="lead-table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Stage</th><th>Source</th><th><button type="button" onClick={() => sortBy('nextFollowUpDate')}>Next follow-up date</button></th><th><button type="button" onClick={() => sortBy('estimatedValue')}>Estimated value</button></th><th><button type="button" onClick={() => sortBy('updatedAt')}>Last updated</button></th><th>Actions</th></tr></thead><tbody>{displayedLeads.map((lead) => <LeadRow key={lead.id} lead={lead} />)}</tbody></table></div>
    {!displayedLeads.length && <p>{leads.length ? 'No leads found' : 'No leads yet.'}</p>}
  </section>;
}
