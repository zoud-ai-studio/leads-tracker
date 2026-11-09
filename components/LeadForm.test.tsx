import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('shows inline validation and prevents saving an empty name', () => {
    render(<LeadForm onSave={vi.fn()} />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save lead' })).toBeDisabled();
  });

  it('validates email and precision, then submits valid values', () => {
    const onSave = vi.fn();
    render(<LeadForm onSave={onSave} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Estimated value'), { target: { value: '1250.123' } });
    expect(screen.getByText('Value must have at most 2 decimal places')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Estimated value'), { target: { value: '10000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save lead' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ada', estimatedValue: '10000000' }));
  });

  it('shows the required-name error after a populated name is cleared', () => {
    render(<LeadForm onSave={vi.fn()} />);
    const name = screen.getByLabelText('Name');
    fireEvent.change(name, { target: { value: 'Ada' } });
    fireEvent.change(name, { target: { value: '' } });
    fireEvent.blur(name);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save lead' })).toBeDisabled();
  });

  it('submits every source and service option unchanged', () => {
    const onSave = vi.fn();
    render(<LeadForm onSave={onSave} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    for (const source of ['Website', 'Referral', 'LinkedIn', 'WhatsApp', 'Other']) {
      for (const service of ['Website', 'Web app', 'AI agent', 'Other']) {
        fireEvent.change(screen.getByLabelText('Source'), { target: { value: source } });
        fireEvent.change(screen.getByLabelText('Service'), { target: { value: service } });
        fireEvent.click(screen.getByRole('button', { name: 'Save lead' }));
      }
    }
    expect(onSave).toHaveBeenCalledTimes(20);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ source: 'Other', service: 'Other' }));
  });
});
