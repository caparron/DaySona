import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CategoryAssignerProps {
  categories: string[];
  categoryColors: Record<string, string>;
  category?: string;
  onChange: (category?: string) => void;
}

export function CategoryAssigner({ categories, categoryColors, category, onChange }: CategoryAssignerProps) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const color = category ? categoryColors[category] : undefined;

  const updateMenuPosition = useCallback(() => {
    const bounds = triggerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const menuWidth = 160;
    setMenuPosition({
      top: Math.min(bounds.bottom + 4, window.innerHeight - 208),
      left: Math.max(8, Math.min(bounds.left, window.innerWidth - menuWidth - 8)),
    });
  }, []);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    updateMenuPosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, updateMenuPosition]);

  return (
    <div className="shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={category ? `${t('Category:')} ${category}` : t('Assign category')}
        aria-expanded={open}
        onClick={toggleMenu}
        className={`flex max-w-32 items-center gap-1 border border-ink/30 px-1.5 py-1 font-mono text-[9px] uppercase ${category ? 'text-ink' : 'bg-white/70 text-ink/55 hover:bg-gold/30'}`}
        style={color ? { backgroundColor: `${color}55`, borderColor: color } : undefined}
      >
        <Tag size={11} />
        <span className="truncate">{category || t('Category')}</span>
      </button>
      {open && createPortal(
        <div ref={menuRef} className="fixed z-[1000] max-h-48 min-w-36 overflow-y-auto border-2 border-ink bg-white p-1 shadow-panelSm" style={{ top: menuPosition.top, left: menuPosition.left, width: 160 }}>
          <button type="button" onClick={() => { onChange(undefined); setOpen(false); }} className="block w-full px-2 py-1.5 text-left font-mono text-[10px] uppercase text-ink/60 hover:bg-cream2">{t('None')}</button>
          {categories.map(option => (
            <button key={option} type="button" onClick={() => { onChange(option); setOpen(false); }} className={`block w-full truncate px-2 py-1.5 text-left font-mono text-[10px] uppercase hover:brightness-95 ${category === option ? 'font-bold text-ink' : 'text-ink/70'}`} style={{ backgroundColor: `${categoryColors[option] || '#ffd23f'}55` }}>
              {option}
            </button>
          ))}
          {categories.length === 0 && <p className="px-2 py-1.5 font-mono text-[9px] text-ink/45">{t('Create a category below the panel.')}</p>}
        </div>,
        document.body,
      )}
    </div>
  );
}
