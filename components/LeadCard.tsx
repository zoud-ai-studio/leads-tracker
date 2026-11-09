'use client';

import { useState } from 'react';
import { formatAed } from '@/lib/format';
import { stages, type Lead, type Stage } from '@/lib/types';
import Link from 'next/link';

export function LeadCard({ lead, onMove }: { lead: Lead; onMove: (id: string, stage: Stage) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return <article className="lead-card">
    <Link href={`/leads/view?id=${lead.id}`}><strong>{lead.name}</strong></Link>
    {lead.company && <span>{lead.company}</span>}
    <span>{formatAed(lead.estimatedValue)}</span>
    <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>Move to</button>
    {menuOpen && <label className="move-to">Move to
      <select aria-label="Move to" value={lead.stage} onChange={(event) => {
        const stage = event.target.value as Stage;
        if (stage !== lead.stage) onMove(lead.id, stage);
        setMenuOpen(false);
      }}>
        {stages.map((stage) => <option key={stage} value={stage} disabled={stage === lead.stage}>{stage}</option>)}
      </select>
    </label>}
  </article>;
}
