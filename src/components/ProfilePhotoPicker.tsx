import { useRef, useState } from 'react';
import { ImagePlus, Trash2, UserRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { compressImage } from '@/utils/images';

async function prepareImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 12 * 1024 * 1024) throw new Error('The image must be smaller than 12 MB.');

  return compressImage(file, 480);
}

export function ProfilePhotoPicker({ value, onChange }: { value?: string; onChange: (photo?: string) => void }) {
  const { t } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    try {
      onChange(await prepareImage(file));
    } catch (cause) {
      setError(t(cause instanceof Error ? cause.message : 'Could not load this image.'));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={event => void handleFile(event.target.files?.[0])} />
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border-2 border-ink bg-gold shadow-panelSm">
          {value ? <img src={value} alt="Profile preview" className="h-full w-full object-cover" /> : <UserRound size={24} />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-press inline-flex items-center gap-2 border-2 border-ink bg-white px-3 py-2 font-display text-[10px] uppercase hover:bg-cream2">
            <ImagePlus size={14} /> {t(value ? 'Change photo' : 'Add profile photo')}
          </button>
          {value && <button type="button" onClick={() => { onChange(undefined); setError(''); }} aria-label={t('Remove profile photo')} className="btn-press border-2 border-ink bg-white p-2 hover:bg-coral/20"><Trash2 size={14} /></button>}
        </div>
      </div>
      <p className="mt-2 font-mono text-[9px] text-ink/50">{t('Images are resized before they sync to your account.')}</p>
      {error && <p role="alert" className="mt-2 font-mono text-[10px] text-coralDark">{error}</p>}
    </div>
  );
}
