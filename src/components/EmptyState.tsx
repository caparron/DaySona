import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  color?: string;
}

export function EmptyState({ title, subtitle, icon, color = 'bg-cream2' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${color} border-2 border-dashed border-ink/30 animate-fadeIn`}>
      {icon && <div className="mb-3 opacity-50">{icon}</div>}
      <h3 className="font-display text-lg uppercase tracking-tight text-ink/70">{title}</h3>
      <p className="mt-1 text-sm text-ink/50 italic">{subtitle}</p>
    </div>
  );
}
