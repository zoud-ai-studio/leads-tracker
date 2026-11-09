import { stages, type Lead, type Stage } from './types';
import { localDate } from './leads';

export type DashboardSummary = {
  perStage: Record<Stage, number>;
  openPipelineValue: number;
  wonThisMonth: number;
  winRate: number | null;
  followUpToday: Lead[];
};

export function dashboardSummary(leads: Lead[], today = localDate()): DashboardSummary {
  const perStage = Object.fromEntries(stages.map((stage) => [stage, 0])) as Record<Stage, number>;
  for (const lead of leads) perStage[lead.stage] += 1;
  const closed = perStage.Won + perStage.Lost;
  return {
    perStage,
    openPipelineValue: leads.filter((lead) => ['New', 'Contacted', 'Quoted'].includes(lead.stage)).reduce((sum, lead) => sum + lead.estimatedValue, 0),
    wonThisMonth: leads.filter((lead) => lead.stage === 'Won' && lead.wonAt?.slice(0, 7) === today.slice(0, 7)).reduce((sum, lead) => sum + lead.estimatedValue, 0),
    winRate: closed ? Math.round((perStage.Won / closed) * 100) : null,
    followUpToday: leads.filter((lead) => Boolean(lead.nextFollowUpDate && lead.nextFollowUpDate <= today)).sort((a, b) => (a.nextFollowUpDate ?? '').localeCompare(b.nextFollowUpDate ?? ''))
  };
}
