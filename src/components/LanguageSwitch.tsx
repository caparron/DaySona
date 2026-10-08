import type { Language } from '@/utils/i18n';

export function LanguageSwitch({ language, onChange, compact = false }: { language: Language; onChange: (language: Language) => void; compact?: boolean }) {
  return (
    <div role="group" aria-label="Language / Idioma" className="inline-flex shrink-0 border-2 border-ink bg-white p-0.5 shadow-panelSm">
      {(['en', 'es'] as const).map(option => (
        <button
          key={option}
          type="button"
          aria-pressed={language === option}
          onClick={() => onChange(option)}
          className={`min-w-9 px-2 py-1.5 font-display text-[10px] uppercase tracking-wide transition-colors ${language === option ? 'bg-gold text-ink' : 'text-ink/55 hover:bg-cream2 hover:text-ink'} ${compact ? 'md:min-w-10' : ''}`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
