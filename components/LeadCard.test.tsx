import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeadCard } from './LeadCard';
import type { Lead } from '@/lib/types';

const lead: Lead = {
  id: 'ada', name: 'Ada Lovelace', company: 'Analytical Engines', estimatedValue: 12500,
  source: 'Website', service: 'AI agent', stage: 'New', activities: [],
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('LeadCard', () => {
  it('shows the name, company, AED value, and all pipeline stages in Move to', () => {
    render(<LeadCard lead={lead} onMove={vi.fn()} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Analytical Engines')).toBeInTheDocument();
    expect(screen.getByText('AED 12,500.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Move to' }));
    expect(screen.getAllByRole('option')).toHaveLength(5);
    expect(screen.getByRole('option', { name: 'New' })).toBeDisabled();
  });

  it('moves a lead to the selected stage', () => {
    const onMove = vi.fn();
    render(<LeadCard lead={lead} onMove={onMove} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move to' }));
    fireEvent.change(screen.getByLabelText('Move to'), { target: { value: 'Won' } });
    expect(onMove).toHaveBeenCalledWith('ada', 'Won');
  });
});
