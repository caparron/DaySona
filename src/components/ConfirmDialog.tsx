import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'DELETE', cancelLabel = 'CANCEL', onConfirm, onCancel }: ConfirmDialogProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      const t = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(t);
    }
    setShow(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-ink/60" onClick={onCancel} />
      <div className={`relative bg-cream border-3 border-ink shadow-panelLg p-6 max-w-sm w-full ${show ? 'animate-pop' : ''}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-coral border-2 border-ink p-2 shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg uppercase">{title}</h3>
            <p className="text-sm text-ink/70 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="btn-press border-2 border-ink bg-cream2 px-4 py-2 font-display text-xs uppercase tracking-wider hover:bg-mist/30"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="btn-press border-2 border-ink bg-coral text-white px-4 py-2 font-display text-xs uppercase tracking-wider hover:bg-coralDark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
