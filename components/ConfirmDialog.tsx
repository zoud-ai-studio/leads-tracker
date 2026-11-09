'use client';

export function ConfirmDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return <div className="dialog-backdrop" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">Delete lead?</h2><p>Are you sure you want to delete this lead? This action cannot be undone.</p><div className="actions"><button type="button" onClick={onConfirm}>Delete</button><button type="button" className="secondary" onClick={onCancel}>Cancel</button></div></section></div>;
}
