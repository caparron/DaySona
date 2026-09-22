import { useState } from 'react';
import { Target, Plus, Trash2, Pencil, X, Check, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LongTermGoal } from '@/types';

export function LongTermView() {
  const {
    data, addLongTerm, updateLongTerm, deleteLongTerm,
    addMilestone, toggleMilestone, deleteMilestone,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState('');
  const [milestoneGoalId, setMilestoneGoalId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!formTitle.trim()) return;
    addLongTerm(formTitle, formDesc, formDate);
    setFormTitle(''); setFormDesc(''); setFormDate('');
    setShowForm(false);
  };

  const startEdit = (g: LongTermGoal) => {
    setEditingId(g.id);
    setEditTitle(g.title);
    setEditDesc(g.description);
    setEditDate(g.targetDate || '');
  };

  const commitEdit = () => {
    if (editingId) {
      updateLongTerm(editingId, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        targetDate: editDate || undefined,
      });
    }
    setEditingId(null);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestone.trim()) return;
    addMilestone(goalId, newMilestone);
    setNewMilestone('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none text-leafDark">Long Term</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">{data.longTerm.length} goals — the big picture</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-press flex items-center gap-1 border-2 border-ink bg-leaf px-3 py-2 font-display text-xs uppercase tracking-wider text-white hover:bg-leafDark"
        >
          <Plus size={14} strokeWidth={3} /> Add Goal
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-5 border-2 border-ink bg-cream p-4 shadow-panelSm animate-slideUp">
          <input
            type="text"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="Goal title (e.g. Learn Italian)"
            className="mb-2 w-full border-2 border-ink bg-cream2 px-3 py-2.5 font-body text-sm focus:border-leaf focus:shadow-panelSm focus:outline-none"
            autoFocus
          />
          <textarea
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="mb-2 w-full resize-none border-2 border-ink bg-cream2 px-3 py-2.5 font-body text-sm focus:border-leaf focus:shadow-panelSm focus:outline-none"
          />
          <div className="mb-3 flex items-center gap-2">
            <Calendar size={16} strokeWidth={2.5} className="text-ink/50" />
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="border-2 border-ink bg-cream2 px-3 py-1.5 font-mono text-xs focus:border-leaf focus:outline-none"
            />
            <span className="font-mono text-xs text-ink/40">Target date (optional)</span>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn-press border-2 border-ink bg-cream2 px-3 py-2 font-display text-xs uppercase">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!formTitle.trim()}
              className="btn-press border-2 border-ink bg-leaf px-4 py-2 font-display text-xs uppercase text-white disabled:opacity-40 hover:bg-leafDark"
            >
              Create Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals */}
      {data.longTerm.length === 0 && !showForm ? (
        <EmptyState
          title="No long-term goals yet"
          subtitle="What do you want to achieve over time? Add your first goal."
          icon={<Target size={32} strokeWidth={1.5} />}
          color="bg-leaf/10"
        />
      ) : (
        <div className="space-y-4">
          {data.longTerm.map(g => {
            const expanded = expandedId === g.id;
            const editing = editingId === g.id;
            return (
              <div key={g.id} className="card-lift overflow-hidden border-2 border-ink bg-cream shadow-panelSm animate-slideUp">
                {/* Accent strip */}
                <div className="h-1.5 bg-leaf" />
                <div className="p-4">
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full border-2 border-leaf bg-cream2 px-3 py-2 font-display text-base uppercase focus:outline-none"
                        autoFocus
                      />
                      <textarea
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full resize-none border-2 border-leaf bg-cream2 px-3 py-2 font-body text-sm focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <Calendar size={16} strokeWidth={2.5} className="text-ink/50" />
                        <input
                          type="date"
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                          className="border-2 border-leaf bg-cream2 px-3 py-1.5 font-mono text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg uppercase leading-tight">{g.title}</h3>
                          {g.description && <p className="mt-1 text-sm text-ink/60">{g.description}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => startEdit(g)} className="border border-transparent p-1.5 hover:border-ink hover:bg-gold/20">
                            <Pencil size={13} strokeWidth={2.5} className="text-ink/60" />
                          </button>
                          <button onClick={() => setDeleteId(g.id)} className="border border-transparent p-1.5 hover:border-ink hover:bg-coral/20">
                            <Trash2 size={13} strokeWidth={2.5} className="text-ink/60" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-mono text-xs uppercase text-ink/50">Progress</span>
                          <span className="font-display text-sm">{g.progress}%</span>
                        </div>
                        <ProgressBar value={g.progress} max={100} color="bg-leaf" />
                      </div>

                      {/* Target date */}
                      {g.targetDate && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Calendar size={12} strokeWidth={2.5} className="text-ink/40" />
                          <span className="font-mono text-xs text-ink/50">Target: {g.targetDate}</span>
                        </div>
                      )}

                      {/* Expand milestones */}
                      <button
                        onClick={() => setExpandedId(expanded ? null : g.id)}
                        className="mt-2 flex items-center gap-1 font-mono text-xs uppercase text-ink/50 hover:text-ink"
                      >
                        {expanded ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
                        {g.milestones.length} milestones
                      </button>
                    </>
                  )}
                </div>

                {/* Milestones (expanded) */}
                {expanded && !editing && (
                  <div className="animate-fadeIn border-t-2 border-ink/20 bg-cream2 p-3">
                    {g.milestones.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        {g.milestones.map(ms => (
                          <div key={ms.id} className="group flex items-center gap-2.5">
                            <button
                              onClick={() => toggleMilestone(g.id, ms.id)}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 border-ink transition-all ${
                                ms.done ? 'animate-checkPop bg-leaf' : 'bg-cream hover:bg-leaf/20'
                              }`}
                            >
                              {ms.done && <Check size={12} strokeWidth={3} className="text-white" />}
                            </button>
                            <span className={`flex-1 text-sm ${ms.done ? 'text-ink/40 line-through' : 'text-ink'}`}>{ms.title}</span>
                            <button
                              onClick={() => deleteMilestone(g.id, ms.id)}
                              className="p-1 opacity-0 hover:bg-coral/20 group-hover:opacity-100"
                            >
                              <Trash2 size={11} strokeWidth={2.5} className="text-ink/50" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={milestoneGoalId === g.id ? newMilestone : ''}
                        onChange={e => { setMilestoneGoalId(g.id); setNewMilestone(e.target.value); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && milestoneGoalId === g.id) {
                            handleAddMilestone(g.id);
                            setMilestoneGoalId(null);
                          }
                        }}
                        placeholder="Add milestone..."
                        className="flex-1 border-2 border-ink bg-cream px-2.5 py-1.5 font-body text-xs focus:border-leaf focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (milestoneGoalId === g.id) {
                            handleAddMilestone(g.id);
                            setMilestoneGoalId(null);
                          } else {
                            setMilestoneGoalId(g.id);
                          }
                        }}
                        className="btn-press border-2 border-ink bg-leaf px-2.5 py-1.5 font-display text-xs uppercase text-white hover:bg-leafDark"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete goal?"
        message="This long-term goal and all its milestones will be permanently removed."
        onConfirm={() => { if (deleteId) { deleteLongTerm(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
