'use client';

import { useEffect, useState } from 'react';
import { BoardColumn } from '@/components/BoardColumn';
import { getLeads, updateLeadStage } from '@/lib/leads';
import { stages, type Lead, type Stage } from '@/lib/types';

export default function BoardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const refresh = () => setLeads(getLeads());
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const moveLead = (id: string, stage: Stage) => {
    updateLeadStage(id, stage);
    setLeads(getLeads());
  };

  return <><h1>Pipeline board</h1><div className="pipeline-board">
    {stages.map((stage) => <BoardColumn key={stage} stage={stage} leads={leads.filter((lead) => lead.stage === stage)} onMove={moveLead} />)}
  </div></>;
}
