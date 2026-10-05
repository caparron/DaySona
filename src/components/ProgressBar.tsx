interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
  height?: string;
}

export function ProgressBar({ value, max, color = 'bg-coral', className = '', height = 'h-4' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`w-full ${height} bg-cream2 border-2 border-ink overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} border-r-2 border-ink transition-all duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
