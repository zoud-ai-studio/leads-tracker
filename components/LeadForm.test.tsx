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
});
