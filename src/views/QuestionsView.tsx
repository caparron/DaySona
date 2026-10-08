import { useState } from 'react';
import { HelpCircle, Plus, Trash2, Pencil, Check, RotateCcw, Lightbulb } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Tag } from '@/components/Panel';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { relativeTime } from '@/utils/date';
import { Question } from '@/types';

export function QuestionsView() {
  const { data, addQuestion, toggleQuestionStatus, editQuestion, deleteQuestion, t, language } = useApp();
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSolved, setShowSolved] = useState(false);

  const openCount = data.questions.filter(q => q.status === 'open').length;
  const sorted = [...data.questions].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
    return b.createdAt - a.createdAt;
  });
  const visible = showSolved ? sorted : sorted.filter(q => q.status === 'open');

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addQuestion(newContent);
    setNewContent('');
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditValue(q.content);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      editQuestion(editingId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none text-ink">{t('Questions')}</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">{openCount} {t('open — things to figure out')}</p>
        </div>
        <div className="flex h-10 w-10 animate-floatY items-center justify-center border-2 border-ink bg-gold shadow-panelSm">
          <HelpCircle size={20} strokeWidth={2.5} className="text-ink" />
        </div>
      </div>

      {/* Counter banner */}
      {openCount > 0 && (
        <div className="mb-4 flex items-center justify-between border-2 border-ink bg-gold px-4 py-2.5 shadow-panelSm">
          <span className="font-display text-sm uppercase">{openCount} {t('Open Questions')}</span>
          <button
            onClick={() => setShowSolved(!showSolved)}
            className="font-mono text-xs uppercase text-ink/60 underline hover:text-ink"
          >
            {t(showSolved ? 'Hide solved' : 'Show solved')}
          </button>
        </div>
      )}

      {/* New question — sticky note style */}
      <div className="checker-fill-bg mb-5 border-2 border-ink bg-gold/15 shadow-panelSm">
        <div className="flex items-center gap-2 border-b-2 border-gold/40 bg-gold/10 px-4 py-2">
          <Lightbulb size={14} strokeWidth={2.5} className="text-goldDark" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">{t('New Question')}</span>
        </div>
        <div className="flex gap-2 p-3">
          <input
            type="text"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={t('What do you need to figure out?')}
            className="flex-1 border-2 border-ink bg-cream px-4 py-2.5 font-body text-sm focus:border-gold focus:shadow-panelSm focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newContent.trim()}
            className="btn-press flex items-center gap-1 border-2 border-ink bg-gold px-4 font-display text-xs uppercase tracking-wider text-ink disabled:opacity-40 hover:bg-goldDark"
          >
            <Plus size={14} strokeWidth={3} /> {t('Add')}
          </button>
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState
          title={t(openCount === 0 ? 'No open questions' : 'No questions to show')}
          subtitle={t(openCount === 0 ? "Looks like you're clear for now." : 'Toggle solved to see history.')}
          icon={<HelpCircle size={32} strokeWidth={1.5} />}
          color="bg-gold/10"
        />
      ) : (
        <div className="space-y-2.5">
          {visible.map(q => (
            <div
              key={q.id}
              className={`card-lift group flex items-start gap-3 border-2 border-ink p-3.5 shadow-panelSm animate-slideUp ${
                q.status === 'solved' ? 'bg-leaf/15' : 'bg-cream'
              }`}
            >
              {/* Status toggle */}
              <button
                onClick={() => toggleQuestionStatus(q.id)}
                className={`btn-press mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink transition-all ${
                  q.status === 'solved' ? 'animate-checkPop bg-leaf' : 'bg-cream hover:bg-leaf/20'
                }`}
              >
                {q.status === 'solved' && <Check size={16} strokeWidth={3} className="text-white" />}
              </button>

              <div className="min-w-0 flex-1">
                {editingId === q.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={commitEdit}
                    autoFocus
                    className="w-full border-b-2 border-gold bg-transparent font-body text-sm focus:outline-none"
                  />
                ) : (
                  <p className={`font-body text-sm ${q.status === 'solved' ? 'text-ink/40 line-through' : 'text-ink'}`}>
                    {q.content}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Tag color={q.status === 'open' ? 'bg-gold text-ink' : 'bg-leaf text-white'}>
                    {t(q.status === 'open' ? 'OPEN' : 'SOLVED')}
                  </Tag>
                  <span className="font-mono text-xs text-ink/40">{q.date} · {relativeTime(q.createdAt, language)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {q.status === 'solved' && (
                  <button
                    onClick={() => toggleQuestionStatus(q.id)}
                    className="border border-transparent p-1.5 hover:border-ink hover:bg-sky/20"
                    title={t('Reopen')}
                  >
                    <RotateCcw size={13} strokeWidth={2.5} className="text-ink/60" />
                  </button>
                )}
                <button onClick={() => startEdit(q)} aria-label={t('Edit question')} className="border border-transparent p-1.5 hover:border-ink hover:bg-gold/20">
                  <Pencil size={13} strokeWidth={2.5} className="text-ink/60" />
                </button>
                <button onClick={() => setDeleteId(q.id)} aria-label={t('Delete question')} className="border border-transparent p-1.5 hover:border-ink hover:bg-coral/20">
                  <Trash2 size={13} strokeWidth={2.5} className="text-ink/60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t('Delete question?')}
        message={t('This question will be permanently removed.')}
        onConfirm={() => { if (deleteId) { deleteQuestion(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
