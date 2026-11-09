export const stages = ['New', 'Contacted', 'Quoted', 'Won', 'Lost'] as const;
export const sources = ['Website', 'Referral', 'LinkedIn', 'WhatsApp', 'Other'] as const;
export const services = ['Website', 'Web app', 'AI agent', 'Other'] as const;

export type Stage = (typeof stages)[number];
export type Source = (typeof sources)[number];
export type Service = (typeof services)[number];

export type Lead = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: Source;
  service: Service;
  estimatedValue: number;
  stage: Stage;
  nextFollowUpDate?: string;
  notes?: string;
  activities: [];
  createdAt: string;
  updatedAt: string;
  wonAt?: string;
};

export type LeadDraft = Omit<Lead, 'id' | 'activities' | 'createdAt' | 'updatedAt' | 'wonAt' | 'estimatedValue'> & { estimatedValue: string };
