import { useState } from 'react';
import { Brain, Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { relativeTime } from '@/utils/date';
import { Thought } from '@/types';

export function ThoughtsView() {
  const { data, addThought, editThought, deleteThought } = useApp();
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const sorted = [...data.thoughts].sort((a, b) => b.createdAt - a.createdAt);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addThought(newContent);
    setNewContent('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const startEdit = (t: Thought) => {
    setEditingId(t.id);
    setEditValue(t.content);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      editThought(editingId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-hero manga-panel manga-enter mb-6 flex items-center gap-3 border-3 border-ink bg-white p-4 shadow-panel">
        <div className="page-hero-icon"><Brain size={22} strokeWidth={2.7} /></div>
        <div>
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Thoughts</h1>
          <p className="mt-1 font-mono text-xs text-ink/60">{data.thoughts.length} entries · Capture and revisit what’s on your mind</p>
        </div>
      </div>

      {/* New thought — paper sheet */}
      <div className="paper-lined mb-6 border-2 border-ink shadow-panelSm">
        <div className="flex items-center gap-2 border-b-2 border-sky/30 bg-sky/8 px-4 py-2">
          <div className="h-3 w-3 rounded-full border border-ink/30 bg-coral/40" />
          <div className="h-3 w-3 rounded-full border border-ink/30 bg-gold/50" />
          <div className="h-3 w-3 rounded-full border border-ink/30 bg-leaf/40" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-ink/40">New Entry</span>
        </div>
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
          }}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full resize-none border-0 bg-transparent px-5 py-4 font-body text-base leading-7 text-ink/90 placeholder:text-ink/30 focus:outline-none"
          style={{ lineHeight: '28px' }}
        />
        <div className="flex items-center justify-between border-t-2 border-sky/30 bg-sky/5 px-4 py-2.5">
          <span className={`font-mono text-xs transition-all duration-300 ${savedFlash ? 'text-leaf opacity-100' : 'opacity-0'}`}>
            Entry saved!
          </span>
          <button
            onClick={handleAdd}
            disabled={!newContent.trim()}
            className="btn-press flex items-center gap-1.5 border-2 border-ink bg-sky px-4 py-2 font-display text-xs uppercase tracking-wider text-white disabled:opacity-40 hover:bg-skyDark"
          >
            <Plus size={14} strokeWidth={3} /> New Thought
          </button>
        </div>
      </div>

      {/* List — paper cards */}
      {sorted.length === 0 ? (
        <EmptyState
          title="No thoughts yet"
          subtitle="Write down whatever is on your mind."
          icon={<Brain size={32} strokeWidth={1.5} />}
          color="bg-sky/10"
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((t, i) => (
            <div
              key={t.id}
              className="paper-bg card-lift group border-2 border-ink p-5 shadow-panelSm animate-slideUp"
              style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
            >
              {editingId === t.id ? (
                <div>
                  <textarea
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                    rows={3}
                    className="w-full resize-none border-2 border-sky bg-cream2 px-3 py-2 font-body text-sm focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="btn-press border-2 border-ink bg-cream2 px-3 py-1.5 font-display text-xs uppercase">
                      <X size={12} strokeWidth={3} className="mr-1 inline" />Cancel
                    </button>
                    <button onClick={commitEdit} className="btn-press border-2 border-ink bg-leaf px-3 py-1.5 font-display text-xs uppercase text-white">
                      <Check size={12} strokeWidth={3} className="mr-1 inline" />Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap font-body text-base leading-7 text-ink/90">{t.content}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="border border-sky/40 bg-sky/10 px-2 py-0.5 font-mono text-[10px] uppercase text-skyDark">{t.date}</span>
                      <span className="font-mono text-xs text-ink/40">{relativeTime(t.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => startEdit(t)} className="border border-transparent p-1.5 hover:border-ink hover:bg-gold/20">
                        <Pencil size={13} strokeWidth={2.5} className="text-ink/60" />
                      </button>
                      <button onClick={() => setDeleteId(t.id)} className="border border-transparent p-1.5 hover:border-ink hover:bg-coral/20">
                        <Trash2 size={13} strokeWidth={2.5} className="text-ink/60" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete thought?"
        message="This entry will be permanently removed."
        onConfirm={() => { if (deleteId) { deleteThought(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
