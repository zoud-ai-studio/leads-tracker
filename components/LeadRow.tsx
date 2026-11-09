import Link from 'next/link';
import { formatAed } from '@/lib/format';
import type { Lead } from '@/lib/types';

export function LeadRow({ lead }: { lead: Lead }) {
  return <tr>
    <td><strong>{lead.name}</strong></td><td>{lead.company || '—'}</td><td>{lead.stage}</td><td>{lead.source}</td>
    <td>{lead.nextFollowUpDate || '—'}</td><td>{formatAed(lead.estimatedValue)}</td><td>{new Date(lead.updatedAt).toLocaleDateString('en-AE')}</td>
    <td><Link href={`/leads/edit?id=${lead.id}`}>Edit</Link></td>
  </tr>;
}
