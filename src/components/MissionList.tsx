import { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Pencil, Plus, Target, GripVertical } from 'lucide-react';
import { Mission } from '@/types';
import { useApp } from '@/context/AppContext';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { todayKey } from '@/utils/date';
import { getMissionWeight, getDayProgress } from '@/utils/weights';

interface MissionListProps {
  dateKey: string;
  readOnly?: boolean;
}

export function MissionList({ dateKey, readOnly = false }: MissionListProps) {
  const {
    data, addMission, toggleMission, editMission, deleteMission,
    setMissionImportance, setSuccessThreshold,
    firstCompletionToday, clearFirstCompletion,
  } = useApp();

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showThreshold, setShowThreshold] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allMissions = data.missions;
  const missions = data.missions.filter(m => m.date === dateKey);
  const completed = missions.filter(m => m.done).length;
  const total = missions.length;
  const isToday = dateKey === todayKey();

  const dayProgress = getDayProgress(missions, allMissions);
  const threshold = data.successThreshold;
  const isSuccessful = dayProgress >= threshold;

  useEffect(() => {
    if (firstCompletionToday && isToday) {
      setShowConfetti(true);
      clearFirstCompletion();
      const t = setTimeout(() => setShowConfetti(false), 1000);
      return () => clearTimeout(t);
    }
  }, [firstCompletionToday, isToday, clearFirstCompletion]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addMission(newTitle, dateKey);
    setNewTitle('');
  };

  const startEdit = (m: Mission) => {
    setEditingId(m.id);
    setEditValue(m.title);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      editMission(editingId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMission(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="relative">
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="confetti-dot"
              style={{
                left: '50%',
                top: '50%',
                background: ['#ff4f3a', '#ffd23f', '#3ec1ed', '#52b788', '#ff5d8f'][i % 5],
                ['--tx' as string]: `${Math.cos((i / 12) * Math.PI * 2) * 80}px`,
                ['--ty' as string]: `${Math.sin((i / 12) * Math.PI * 2) * 80}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Progress header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl">{completed}</span>
          <span className="font-display text-xl text-ink/40">/ {total}</span>
          <span className="ml-1 font-mono text-xs uppercase text-ink/50">completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-display text-lg ${isSuccessful ? 'text-leaf' : 'text-ink/50'}`}>
            {dayProgress}%
          </span>
          <span className={`font-mono text-[10px] uppercase ${isSuccessful ? 'text-leaf' : 'text-ink/40'}`}>
            / {threshold}% goal
          </span>
        </div>
      </div>

      {/* Weighted progress bar with threshold marker */}
      <div className="relative mb-2">
        <ProgressBar value={dayProgress} max={100} color={isSuccessful ? 'bg-leaf' : 'bg-coral'} />
        {/* Threshold marker */}
        <div
          className="absolute top-[-3px] bottom-[-3px] w-1 bg-ink"
          style={{ left: `${threshold}%` }}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase text-ink/60">
            goal
          </div>
        </div>
      </div>

      {/* Success threshold slider */}
      {!readOnly && (
        <div className="mb-4">
          <button
            onClick={() => setShowThreshold(!showThreshold)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink/50 hover:text-ink"
          >
            <Target size={11} strokeWidth={2.5} />
            Success goal: {threshold}%
            <span className="text-ink/30">{showThreshold ? '▲' : '▼'}</span>
          </button>
          {showThreshold && (
            <div className="mt-2 animate-fadeIn">
              <input
                type="range"
                min={0}
                max={100}
                value={threshold}
                onChange={e => setSuccessThreshold(Number(e.target.value))}
                className="w-full accent-coral"
              />
              <div className="flex justify-between font-mono text-[9px] text-ink/40">
                <span>0%</span>
                <span>What % of your day counts as a success?</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add mission */}
      {!readOnly && (
        <div className="mb-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add a mission for today..."
            className="flex-1 border-2 border-ink bg-cream2 px-4 py-2.5 font-body text-sm transition-all focus:border-coral focus:shadow-panelSm focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="btn-press flex items-center gap-1 border-2 border-ink bg-coral px-4 font-display text-xs uppercase tracking-wider text-white hover:bg-coralDark"
          >
            <Plus size={14} strokeWidth={3} /> Add
          </button>
        </div>
      )}

      {/* Mission list */}
      {missions.length === 0 ? (
        <EmptyState
          title={isToday ? 'What do you want to accomplish today?' : 'No missions this day'}
          subtitle={isToday ? 'Add your first goal and start your day.' : 'This day was quiet.'}
          icon={<Plus size={32} strokeWidth={2} />}
        />
      ) : (
        <div className="space-y-2">
          {missions.map(m => {
            const weight = getMissionWeight(m, allMissions);
            const isCustom = m.importance >= 0;
            const expanded = expandedId === m.id;
            return (
              <div
                key={m.id}
                className={`group border-2 border-ink p-3 transition-all duration-200 animate-slideInLeft ${
                  m.done ? 'bg-leaf/15' : 'bg-cream'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Circular checkbox */}
                  <button
                    onClick={() => !readOnly && toggleMission(m.id)}
                    disabled={readOnly}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-all ${
                      m.done ? 'animate-checkPop bg-leaf' : 'bg-cream hover:bg-cream2'
                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {m.done && <Check size={16} strokeWidth={3} className="text-white" />}
                  </button>

                  {/* Title / Edit */}
                  {editingId === m.id ? (
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
                      className="flex-1 border-b-2 border-coral bg-transparent font-body text-sm focus:outline-none"
                    />
                  ) : (
                    <span
                      className={`flex-1 font-body text-sm ${m.done ? 'text-ink/40 line-through' : 'text-ink'}`}
                      onDoubleClick={() => !readOnly && startEdit(m)}
                    >
                      {m.title}
                    </span>
                  )}

                  {/* Weight badge */}
                  <button
                    onClick={() => !readOnly && setExpandedId(expanded ? null : m.id)}
                    disabled={readOnly}
                    className={`shrink-0 border-2 px-2 py-0.5 font-mono text-[10px] font-bold transition-all ${
                      isCustom
                        ? 'border-coral bg-coral/10 text-coralDark'
                        : 'border-ink/20 bg-cream2 text-ink/40'
                    } ${readOnly ? 'cursor-default' : 'hover:shadow-panelSm'}`}
                    title={isCustom ? 'Custom importance' : 'Auto (even split)'}
                  >
                    {Math.round(weight)}%
                  </button>

                  {/* Actions */}
                  {!readOnly && (
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(m)}
                        className="border border-transparent p-1.5 hover:border-ink hover:bg-gold/20"
                      >
                        <Pencil size={14} strokeWidth={2.5} className="text-ink/60" />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="border border-transparent p-1.5 hover:border-ink hover:bg-coral/20"
                      >
                        <Trash2 size={14} strokeWidth={2.5} className="text-ink/60" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Importance slider (expanded) */}
                {expanded && !readOnly && (
                  <div className="mt-3 animate-fadeIn border-t-2 border-ink/10 pt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-ink/50">
                        <GripVertical size={11} strokeWidth={2.5} />
                        Importance
                      </span>
                      <span className="font-mono text-[10px] text-ink/40">
                        {isCustom ? `${m.importance}% (custom)` : 'Auto — even split'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={m.importance < 0 ? Math.round(weight) : m.importance}
                      onChange={e => setMissionImportance(m.id, Number(e.target.value))}
                      className="w-full accent-coral"
                    />
                    <div className="mt-1 flex justify-between">
                      <span className="font-mono text-[9px] text-ink/30">0%</span>
                      {isCustom && (
                        <button
                          onClick={() => setMissionImportance(m.id, -1)}
                          className="font-mono text-[9px] uppercase text-coral hover:underline"
                        >
                          Reset to auto
                        </button>
                      )}
                      <span className="font-mono text-[9px] text-ink/30">100%</span>
                    </div>
                    {!isCustom && (
                      <p className="mt-1 font-mono text-[9px] text-ink/30">
                        Drag to set a custom weight. Others will auto-adjust to keep the total at 100%.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Suggestion */}
      {!readOnly && missions.length > 0 && missions.length < 5 && (
        <p className="mt-3 font-mono text-xs italic text-ink/40">
          Tip: 3-5 key missions make for a focused day.
        </p>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete mission?"
        message="This mission will be permanently removed."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
