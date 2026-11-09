import { sources, stages } from '@/lib/types';
import type { Source, Stage } from '@/lib/types';

type FiltersProps = {
  stage?: Stage;
  source?: Source;
  onStageChange: (stage: Stage | undefined) => void;
  onSourceChange: (source: Source | undefined) => void;
};

export function Filters({ stage, source, onStageChange, onSourceChange }: FiltersProps) {
  return <div className="filters">
    <label>Stage<select aria-label="Stage" value={stage ?? ''} onChange={(event) => onStageChange(event.target.value as Stage || undefined)}><option value="">All stages</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label>Source<select aria-label="Source" value={source ?? ''} onChange={(event) => onSourceChange(event.target.value as Source || undefined)}><option value="">All sources</option>{sources.map((item) => <option key={item}>{item}</option>)}</select></label>
  </div>;
}
