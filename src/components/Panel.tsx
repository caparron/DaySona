import { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  bg?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Panel({ children, className = '', bg = 'bg-cream', size = 'md', onClick }: PanelProps) {
  const shadow = size === 'lg' ? 'shadow-panelLg' : size === 'sm' ? 'shadow-panelSm' : 'shadow-panel';
  const border = size === 'sm' ? 'border-2' : 'border-3';
  return (
    <div
      onClick={onClick}
      className={`manga-panel ${bg} ${border} border-ink ${shadow} ${onClick ? 'cursor-pointer btn-press' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface TagProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Tag({ children, color = 'bg-coral text-white', className = '' }: TagProps) {
  return (
    <span className={`inline-block skew-tag ${color} border-2 border-ink px-2.5 py-0.5 font-display text-xs uppercase tracking-wider ${className}`}>
      <span className="inline-block" style={{ transform: 'skewX(8deg)' }}>{children}</span>
    </span>
  );
}
