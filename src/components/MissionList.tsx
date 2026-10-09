import { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Pencil, Plus, Target, GripVertical, Trophy, ImagePlus, X, Brain } from 'lucide-react';
import { Mission } from '@/types';
import { useApp } from '@/context/AppContext';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CategoryBar } from '@/components/CategoryBar';
import { CategoryAssigner } from '@/components/CategoryAssigner';
import { todayKey } from '@/utils/date';
import { getMissionWeight, getDayProgress } from '@/utils/weights';
import { compressImage } from '@/utils/images';

interface MissionListProps {
  dateKey: string;
  readOnly?: boolean;
  allowAdd?: boolean;
}

export function MissionList({ dateKey, readOnly = false, allowAdd = false }: MissionListProps) {
  const {
    data, addMission, setMissionCategory, addCategory, deleteCategory, toggleMission, editMission, deleteMission, addAchievement, addThought,
    setMissionImportance, setSuccessThreshold,
    firstCompletionToday, clearFirstCompletion, t,
  } = useApp();

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editCategory, setEditCategory] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showThreshold, setShowThreshold] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState<Mission | null>(null);
  const [dayReflectionPending, setDayReflectionPending] = useState(false);
  const [showDayReflection, setShowDayReflection] = useState(false);
  const [dayReflectionContent, setDayReflectionContent] = useState('');
  const [achievementPhoto, setAchievementPhoto] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newMissionCategory, setNewMissionCategory] = useState<string | undefined>();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allMissions = data.missions;
  const dateMissions = data.missions.filter(m => m.date === dateKey);
  const missions = selectedCategory && !readOnly ? dateMissions.filter(m => m.category === selectedCategory) : dateMissions;
  const completed = missions.filter(m => m.done).length;
  const total = missions.length;
  const isToday = dateKey === todayKey();
  const canAdd = !readOnly || allowAdd;

  const dayProgress = getDayProgress(dateMissions, allMissions);
  const threshold = data.successThreshold;
  const isSuccessful = dayProgress >= threshold;

  useEffect(() => {
    if (firstCompletionToday && isToday) {
      setShowConfetti(true);
      clearFirstCompletion();
    }
  }, [firstCompletionToday, isToday, clearFirstCompletion]);

  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(() => setShowConfetti(false), 1000);
    return () => clearTimeout(timeout);
  }, [showConfetti]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addMission(newTitle, dateKey, canAdd ? newMissionCategory : undefined);
    setNewTitle('');
  };

  const startEdit = (m: Mission) => {
    setEditingId(m.id);
    setEditValue(m.title);
    setEditCategory(m.category);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      editMission(editingId, editValue);
      setMissionCategory(editingId, editCategory);
    }
    setEditingId(null);
    setEditValue('');
    setEditCategory(undefined);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMission(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggle = (mission: Mission) => {
    toggleMission(mission.id);
    if (!mission.done) {
      const isFinalMission = isToday && dateMissions.length > 0 && dateMissions.every(item => item.id === mission.id || item.done);
      setDayReflectionPending(isFinalMission);
      setPendingAchievement(mission);
      setAchievementPhoto(undefined);
      setPhotoError('');
    }
  };

  const closeAchievementPopup = () => {
    setPendingAchievement(null);
    setAchievementPhoto(undefined);
    if (dayReflectionPending) {
      setDayReflectionPending(false);
      setShowDayReflection(true);
    }
  };

  const handleAchievementPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.');
      return;
    }
    try {
      setPhotoError('');
      setUploadingPhoto(true);
      const photo = await compressImage(file, 1200);
      setAchievementPhoto(photo);
      if (pendingAchievement) {
        addAchievement({
          missionId: pendingAchievement.id,
          title: pendingAchievement.title,
          userName: data.profile?.name || 'Player',
          date: pendingAchievement.date,
          photo,
          category: pendingAchievement.category,
          categoryColor: pendingAchievement.category ? data.categoryColors[pendingAchievement.category] : undefined,
        });
        closeAchievementPopup();
      }
    } catch {
      setPhotoError('Could not add that photo. Try another one.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveAchievement = () => {
    if (!pendingAchievement) return;
    addAchievement({
      missionId: pendingAchievement.id,
      title: pendingAchievement.title,
      userName: data.profile?.name || 'Player',
      date: pendingAchievement.date,
      photo: achievementPhoto,
      category: pendingAchievement.category,
      categoryColor: pendingAchievement.category ? data.categoryColors[pendingAchievement.category] : undefined,
    });
    closeAchievementPopup();
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
          <span className="ml-1 font-mono text-xs uppercase text-ink/50">{t('completed')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-display text-lg ${isSuccessful ? 'text-leaf' : 'text-ink/50'}`}>
            {dayProgress}%
          </span>
          <span className={`font-mono text-[10px] uppercase ${isSuccessful ? 'text-leaf' : 'text-ink/40'}`}>
            {t('/ {threshold}% goal').replace('{threshold}', String(threshold))}
          </span>
        </div>
      </div>

      {/* Weighted progress bar with threshold marker */}
      <div className="relative mb-2">
        <ProgressBar value={dayProgress} max={100} color={isSuccessful ? 'bg-leaf' : 'bg-coral'} className="jrpg-energy-meter" />
        {/* Threshold marker */}
        <div
          className="absolute top-[-3px] bottom-[-3px] w-1 bg-ink"
          style={{ left: `${threshold}%` }}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase text-ink/60">
            {t('goal')}
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
            {t('Success goal:')} {threshold}%
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
                <span>{t('What % of your day counts as a success?')}</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add mission */}
      {canAdd && (
        <div className="mb-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={t(isToday ? 'Add a mission for today...' : 'Add a mission for this day...')}
            className="flex-1 border-2 border-ink bg-cream2 px-4 py-2.5 font-body text-sm transition-all focus:border-coral focus:shadow-panelSm focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="btn-press flex items-center gap-1 border-2 border-ink bg-coral px-4 font-display text-xs uppercase tracking-wider text-white hover:bg-coralDark"
          >
            <Plus size={14} strokeWidth={3} /> {t('Add')}
          </button>
          <CategoryAssigner categories={data.categories} categoryColors={data.categoryColors} category={newMissionCategory} onChange={setNewMissionCategory} />
        </div>
      )}

      {/* Mission list */}
      {missions.length === 0 ? (
        <EmptyState
          title={t(selectedCategory && !readOnly ? `No ${selectedCategory} missions this day` : isToday ? 'What do you want to accomplish today?' : 'No missions this day')}
          subtitle={t(selectedCategory && !readOnly ? 'Add a mission here or choose another category.' : isToday ? 'Add your first goal and start your day.' : 'This day was quiet.')}
          icon={<Plus size={32} strokeWidth={2} />}
        />
      ) : (
        <div className="space-y-2">
          {missions.map((m, index) => {
            const weight = getMissionWeight(m, allMissions);
            const isCustom = m.importance >= 0;
            const expanded = expandedId === m.id;
            return (
              <div
                key={m.id}
                className={`mission-row jrpg-mission-row group border-2 border-ink p-3 transition-all duration-200 animate-slideInLeft ${
                  m.done ? 'bg-leaf/15' : 'bg-cream'
                }`}
                style={{
                  animationDelay: `${index * 45}ms`,
                  ...(m.category ? { borderLeftWidth: '6px', borderLeftColor: data.categoryColors[m.category] || '#ffd23f' } : {}),
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Circular checkbox */}
                  <button
                    onClick={() => !readOnly && handleToggle(m)}
                    disabled={readOnly}
                    className={`mission-check flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink transition-all ${
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
                    title={t(isCustom ? 'Custom importance' : 'Auto (even split)')}
                  >
                    {Math.round(weight)}%
                  </button>

                  {/* Actions */}
                  {!readOnly && editingId !== m.id && (
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(m)} aria-label={t('Edit mission')}
                        className="border border-transparent p-1.5 hover:border-ink hover:bg-gold/20"
                      >
                        <Pencil size={14} strokeWidth={2.5} className="text-ink/60" />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)} aria-label={t('Delete mission')}
                        className="border border-transparent p-1.5 hover:border-ink hover:bg-coral/20"
                      >
                        <Trash2 size={14} strokeWidth={2.5} className="text-ink/60" />
                      </button>
                    </div>
                  )}
                </div>

                {!readOnly && editingId === m.id && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-2">
                    <CategoryAssigner categories={data.categories} categoryColors={data.categoryColors} category={editCategory} onChange={setEditCategory} />
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditingId(null); setEditValue(''); setEditCategory(undefined); }} className="border border-ink/20 p-1.5 hover:bg-cream2" aria-label={t('Cancel mission edit')}><X size={14} /></button>
                      <button type="button" onClick={commitEdit} disabled={!editValue.trim()} className="border border-ink/20 p-1.5 text-leafDark hover:bg-leaf/10 disabled:opacity-40" aria-label={t('Save mission edit')}><Check size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                )}

                {/* Importance slider (expanded) */}
                {expanded && !readOnly && (
                  <div className="mt-3 animate-fadeIn border-t-2 border-ink/10 pt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-ink/50">
                        <GripVertical size={11} strokeWidth={2.5} />
                        {t('Importance')}
                      </span>
                      <span className="font-mono text-[10px] text-ink/40">
                        {isCustom ? `${m.importance}% ${t('(custom)')}` : t('Auto — even split')}
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
                          {t('Reset to auto')}
                        </button>
                      )}
                      <span className="font-mono text-[9px] text-ink/30">100%</span>
                    </div>
                    {!isCustom && (
                      <p className="mt-1 font-mono text-[9px] text-ink/30">
                        {t('Drag to set a custom weight. Others will auto-adjust to keep the total at 100%.')}
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
          {t('Tip: 3-5 key missions make for a focused day.')}
        </p>
      )}

      {!readOnly && (
        <CategoryBar categories={data.categories} categoryColors={data.categoryColors} selectedCategory={selectedCategory} onSelect={category => { setSelectedCategory(category); setNewMissionCategory(category || undefined); }} onAdd={addCategory} onDelete={category => { deleteCategory(category); if (newMissionCategory === category) setNewMissionCategory(undefined); if (editCategory === category) setEditCategory(undefined); }} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t('Delete mission?')}
        message={t('This mission will be permanently removed.')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {pendingAchievement && (
        <div className="achievement-overlay fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="achievement-title" className="achievement-popup w-full max-w-md border-3 border-ink bg-leaf/15 p-5 shadow-panelLg md:p-7">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink bg-leaf text-white shadow-panelSm">
                <Trophy size={25} strokeWidth={2.5} />
              </div>
              <button type="button" onClick={closeAchievementPopup} aria-label={t('Close congratulations')} className="border-2 border-ink bg-white p-2 hover:bg-cream2">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-leafDark">{t('Mission complete!')}</p>
            <h2 id="achievement-title" className="mt-2 font-display text-2xl leading-tight md:text-3xl">{t('You did it, {name}!').replace('{name}', data.profile?.name || t('friend'))}</h2>
            <p className="mt-2 border-l-4 border-leaf pl-3 font-body text-sm text-ink/75">{pendingAchievement.title}</p>

            {achievementPhoto && <img src={achievementPhoto} alt={t('Selected achievement')} className="mt-4 max-h-48 w-full border-2 border-ink object-cover" />}
            {photoError && <p role="alert" className="mt-2 font-mono text-xs text-coralDark">{t(photoError)}</p>}
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={event => { void handleAchievementPhoto(event.target.files?.[0]); event.target.value = ''; }} />

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={saveAchievement} className="btn-press border-2 border-ink bg-leaf px-3 py-3 font-display text-[10px] uppercase text-white hover:bg-leafDark">{t('Save to achievements')}</button>
              <button type="button" disabled={uploadingPhoto} onClick={() => photoInputRef.current?.click()} className="btn-press flex items-center justify-center gap-1 border-2 border-ink bg-white px-3 py-3 font-display text-[10px] uppercase hover:bg-cream2 disabled:opacity-60"><ImagePlus size={15} /> {t(uploadingPhoto ? 'Adding photo…' : 'Upload photo & post')}</button>
              <button type="button" onClick={closeAchievementPopup} className="btn-press border-2 border-ink bg-cream2 px-3 py-3 font-display text-[10px] uppercase hover:bg-white">{t('Close')}</button>
            </div>
          </section>
        </div>
      )}

      {showDayReflection && (
        <div className="achievement-overlay fixed inset-0 z-[110] flex items-center justify-center bg-ink/60 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="day-complete-title" className="achievement-popup paper-lined subtle-checker-bg w-full max-w-lg overflow-hidden border-3 border-ink bg-[#fef9ef] shadow-panelLg">
            <div className="flex items-center gap-2 border-b-2 border-sky/30 bg-sky/8 px-4 py-3">
              <div className="h-3 w-3 rounded-full border border-ink/30 bg-coral/40" />
              <div className="h-3 w-3 rounded-full border border-ink/30 bg-gold/50" />
              <div className="h-3 w-3 rounded-full border border-ink/30 bg-leaf/40" />
              <span className="ml-2 flex-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">{t('Day complete')}</span>
              <button type="button" onClick={() => { setShowDayReflection(false); setDayReflectionContent(''); }} aria-label={t('Close day reflection')} className="border-2 border-ink bg-white p-1.5 hover:bg-cream2"><X size={16} /></button>
            </div>
            <div className="p-5 md:p-7">
              <div className="mb-3 flex items-center gap-2 text-leafDark"><Brain size={20} /><span className="font-mono text-[10px] uppercase tracking-[.18em]">{t('Every mission complete')}</span></div>
              <h2 id="day-complete-title" className="font-display text-2xl uppercase md:text-3xl">{t('You finished your day!')}</h2>
              <p className="mt-2 font-body text-sm text-ink/70">{t('Want to reflect on your day or write down what you’ll do next?')}</p>
              <textarea
                autoFocus
                value={dayReflectionContent}
                onChange={event => setDayReflectionContent(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { if (dayReflectionContent.trim()) { addThought(dayReflectionContent); setDayReflectionContent(''); setShowDayReflection(false); } } }}
                placeholder={t('Today I felt… / Next, I want to…')}
                rows={4}
                className="mt-4 w-full resize-none border-0 bg-transparent px-1 py-2 font-body text-base leading-7 text-ink/90 placeholder:text-ink/35 focus:outline-none"
                style={{ lineHeight: '28px' }}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t-2 border-sky/30 pt-3">
                <button type="button" onClick={() => { setShowDayReflection(false); setDayReflectionContent(''); }} className="font-mono text-[10px] uppercase tracking-wider text-ink/55 underline hover:text-ink">{t('Not now')}</button>
                <button
                  type="button"
                  disabled={!dayReflectionContent.trim()}
                  onClick={() => { addThought(dayReflectionContent); setDayReflectionContent(''); setShowDayReflection(false); }}
                  className="btn-press flex items-center gap-1.5 border-2 border-ink bg-sky px-4 py-2 font-display text-xs uppercase tracking-wider text-white disabled:opacity-40 hover:bg-skyDark"
                >
                  <Plus size={14} strokeWidth={3} /> {t('Submit to Thoughts')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
