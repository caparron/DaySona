import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CategoryBarProps {
  categories: string[];
  categoryColors: Record<string, string>;
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  onAdd: (name: string, color: string) => void;
  onDelete: (name: string) => void;
}

function readableText(color: string): string {
  const hex = color.replace('#', '');
  const channels = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] > 0.45 ? '#1a1a1a' : '#ffffff';
}

export function CategoryBar({ categories, categoryColors, selectedCategory, onSelect, onAdd, onDelete }: CategoryBarProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ffd23f');
  const [error, setError] = useState('');

  const save = () => {
    const value = name.trim();
    if (!value) return setError('Enter a category name.');
    if (categories.some(category => category.toLocaleLowerCase() === value.toLocaleLowerCase())) {
      return setError('That category already exists.');
    }
    onAdd(value, color);
    setName('');
    setError('');
    setAdding(false);
  };

  return (
    <div className="mt-4 border-t-2 border-ink/20 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(category => {
          const categoryColor = categoryColors[category] || '#ffd23f';
          return (
            <div key={category} className="flex h-9 items-stretch border-2 border-ink shadow-panelSm" style={{ backgroundColor: categoryColor, color: readableText(categoryColor) }}>
              <button
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => onSelect(selectedCategory === category ? null : category)}
                className={`min-w-20 px-3 text-left font-display text-[10px] uppercase transition-[filter,box-shadow] ${selectedCategory === category ? 'brightness-90 ring-2 ring-inset ring-ink' : 'hover:brightness-95'}`}
                title={selectedCategory === category ? 'Show all missions and goals' : `Show ${category}`}
              >
                <span className="block max-w-40 truncate">{category}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete category ${category}`}
                title={`Delete ${category}`}
                onClick={() => {
                  if (window.confirm(`Delete “${category}” and remove it from missions, goals, and achievements?`)) {
                    if (selectedCategory === category) onSelect(null);
                    onDelete(category);
                  }
                }}
                className="border-l border-ink/30 px-1.5 hover:bg-white/30"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, 4 - categories.length) }, (_, index) => (
          <div key={`placeholder-${index}`} aria-hidden="true" className="flex h-9 min-w-20 items-center border-2 border-dashed border-ink/25 px-3 font-mono text-[9px] uppercase tracking-wider text-ink/25">
            Category
          </div>
        ))}
        <button type="button" aria-label="Add category" onClick={() => { setAdding(true); setError(''); }} className="flex h-9 w-10 items-center justify-center border-2 border-ink bg-gold shadow-panelSm transition-transform hover:-translate-y-0.5">
          <Plus size={17} strokeWidth={3} />
        </button>
      </div>
      {adding && (
        <div className="mt-3 flex max-w-md flex-wrap items-start gap-2">
          <div className="min-w-48 flex-1">
            <input
              autoFocus
              type="text"
              maxLength={20}
              value={name}
              onChange={event => { setName(event.target.value); setError(''); }}
              onKeyDown={event => { if (event.key === 'Enter') save(); if (event.key === 'Escape') setAdding(false); }}
              placeholder="e.g. Gym, Study, Social"
              aria-label="New category name, maximum 20 characters"
              className="w-full border-2 border-ink bg-white px-3 py-2 font-body text-sm focus:outline-none"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-ink/45">
              {error ? <span role="alert" className="text-coralDark">{error}</span> : <span>Max 20 characters</span>}
              <span>{name.length}/20</span>
            </div>
          </div>
          <label className="flex h-10 items-center gap-2 border-2 border-ink bg-white px-2 font-mono text-[9px] uppercase text-ink/60">
            Color
            <input type="color" aria-label="Choose category color" value={color} onChange={event => setColor(event.target.value)} className="h-7 w-8 cursor-pointer border-0 bg-transparent p-0" />
          </label>
          <button type="button" onClick={save} className="border-2 border-ink bg-leaf px-3 py-2 font-display text-[10px] uppercase text-white hover:bg-leafDark">Save</button>
          <button type="button" aria-label="Cancel category creation" onClick={() => { setAdding(false); setError(''); }} className="border-2 border-ink bg-white p-2 hover:bg-cream2"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
