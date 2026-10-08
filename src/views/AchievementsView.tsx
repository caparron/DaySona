import { useRef, useState } from 'react';
import { Award, ImagePlus, Pencil, Trash2, Trophy, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { EmptyState } from '@/components/EmptyState';
import { Tag } from '@/components/Panel';
import type { Achievement } from '@/types';

function compressAchievementPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read this photo.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This file is not a supported image.'));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('Could not prepare this photo.'));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function AchievementsView() {
  const { data, updateAchievementPhoto, deleteAchievement, t, language } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (achievement: Achievement, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.');
      return;
    }
    try {
      updateAchievementPhoto(achievement.id, await compressAchievementPhoto(file));
      setEditingId(null);
      setPhotoError('');
    } catch (error) {
      setPhotoError(t(error instanceof Error ? error.message : 'Could not update that photo.'));
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="manga-panel checker-fill-bg border-2 border-ink bg-white p-6 shadow-panel md:p-8">
        <Tag color="bg-leaf text-white">{t('YOUR WINS')}</Tag>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-gold shadow-panelSm">
            <Trophy size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-3xl uppercase md:text-5xl">{t('Achievements')}</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink/55">{t('Every finished mission deserves a little celebration.')}</p>
          </div>
        </div>
      </header>

      {data.achievements.length === 0 ? (
        <EmptyState title={t('Your wins will show up here')} subtitle={t('Finish a mission and save it as an achievement.')} icon={<Award size={32} />} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {data.achievements.map((achievement, index) => {
            const categoryColor = achievement.categoryColor || (achievement.category ? data.categoryColors[achievement.category] : undefined) || '#ffd23f';
            return (
            <article key={achievement.id} className="achievement-post animate-slideUp manga-panel overflow-hidden border-2 border-ink bg-white shadow-panel" style={{ animationDelay: `${index * 55}ms`, filter: achievement.categoryColor ? `drop-shadow(3px 3px 0 ${achievement.categoryColor})` : undefined }}>
              {achievement.photo ? (
                <img src={achievement.photo} alt={`${t('Photo for')} ${achievement.title}`} className="aspect-[4/3] w-full border-b-2 border-ink object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center border-b-2 border-ink" style={{ backgroundColor: `${categoryColor}18`, backgroundImage: `conic-gradient(${categoryColor}55 25%, transparent 0 50%, ${categoryColor}55 0 75%, transparent 0)`, backgroundSize: '24px 24px' }}>
                  <div className="flex h-20 w-20 items-center justify-center border-2 bg-white/90 shadow-panelSm" style={{ borderColor: categoryColor, color: categoryColor, filter: `drop-shadow(2px 2px 0 ${categoryColor})` }}>
                    <Trophy size={42} strokeWidth={2.2} />
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-display text-lg leading-snug md:text-xl">{language === 'es' ? `${achievement.userName} logró ${achievement.title}` : `${achievement.userName} accomplished ${achievement.title}`}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink/50">{achievement.date}</p>
                  {achievement.category && <span className="mt-2 inline-block border border-ink/25 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-ink" style={{ backgroundColor: achievement.categoryColor || '#ffd23f' }}>{achievement.category}</span>}
                </div>
                <button type="button" aria-label={`${t('Edit achievement')} ${achievement.title}`} aria-expanded={editingId === achievement.id} onClick={() => { setEditingId(editingId === achievement.id ? null : achievement.id); setConfirmDeleteId(null); setPhotoError(''); }} className="btn-press shrink-0 border-2 border-ink bg-gold p-2 hover:bg-cream2">
                  {editingId === achievement.id ? <X size={17} /> : <Pencil size={17} />}
                </button>
              </div>
              {editingId === achievement.id && (
                <div className="border-t-2 border-ink bg-cream2 p-4">
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={event => { void handlePhotoChange(achievement, event.target.files?.[0]); event.target.value = ''; }} />
                  {confirmDeleteId === achievement.id ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-xs text-ink">{t('Delete this achievement post?')}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setConfirmDeleteId(null)} className="border-2 border-ink bg-white px-3 py-2 font-display text-[10px] uppercase hover:bg-cream">{t('Cancel')}</button>
                        <button type="button" onClick={() => { deleteAchievement(achievement.id); setEditingId(null); setConfirmDeleteId(null); }} className="flex items-center gap-1 border-2 border-ink bg-coral px-3 py-2 font-display text-[10px] uppercase text-white hover:bg-coralDark"><Trash2 size={14} /> {t('Delete post')}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => photoInputRef.current?.click()} className="flex items-center gap-2 border-2 border-ink bg-white px-3 py-2 font-display text-[10px] uppercase hover:bg-gold"><ImagePlus size={15} /> {t(achievement.photo ? 'Change photo' : 'Add photo')}</button>
                      <button type="button" onClick={() => setConfirmDeleteId(achievement.id)} className="flex items-center gap-2 border-2 border-ink bg-white px-3 py-2 font-display text-[10px] uppercase hover:bg-coral hover:text-white"><Trash2 size={15} /> {t('Delete post')}</button>
                    </div>
                  )}
                  {photoError && <p role="alert" className="mt-2 font-mono text-xs text-coralDark">{photoError}</p>}
                </div>
              )}
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
