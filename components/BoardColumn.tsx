import { LeadCard } from '@/components/LeadCard';
import type { Lead, Stage } from '@/lib/types';

export function BoardColumn({ stage, leads, onMove }: { stage: Stage; leads: Lead[]; onMove: (id: string, stage: Stage) => void }) {
  return <section className="board-column" aria-labelledby={`stage-${stage}`}>
    <h2 id={`stage-${stage}`}>{stage}</h2>
    <div className="board-cards">{leads.map((lead) => <LeadCard key={lead.id} lead={lead} onMove={onMove} />)}</div>
  </section>;
}
