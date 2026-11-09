'use client';

import { useRouter } from 'next/navigation';
import { LeadForm } from '@/components/LeadForm';
import { createLead, saveLead } from '@/lib/leads';

export default function NewLeadPage() {
  const router = useRouter();
  return <><h1>Add lead</h1><LeadForm onSave={(draft) => { saveLead(createLead(draft)); router.push('/?saved=1'); }} /></>;
}
