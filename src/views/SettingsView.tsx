import { useEffect, useState } from 'react';
import { MapPin, Save, Settings, UserRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProfilePhotoPicker } from '@/components/ProfilePhotoPicker';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Panel, Tag } from '@/components/Panel';

export function SettingsView() {
  const { data, setProfile, setProfilePhoto, setSuccessThreshold, language, setLanguage, t } = useApp();
  const [name, setName] = useState(data.profile?.name ?? '');
  const [location, setLocation] = useState(data.profile?.location ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(data.profile?.name ?? '');
    setLocation(data.profile?.location ?? '');
  }, [data.profile?.name, data.profile?.location]);

  const handleSave = () => {
    setProfile(name.trim() || 'Player', location.trim() || 'Tokyo');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto max-w-3xl animate-slideUp">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-gold shadow-panelSm"><Settings size={22} /></span>
        <div>
          <Tag color="bg-gold text-ink">{t('PREFERENCES')}</Tag>
          <h1 className="mt-1 font-display text-3xl uppercase">{t('Settings')}</h1>
        </div>
      </div>

      <Panel className="p-5 md:p-7">
        <section className="border-b-2 border-ink/15 pb-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg uppercase"><UserRound size={18} /> {t('Your profile')}</h2>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y-2 border-ink/10 py-3">
            <span className="font-display text-xs uppercase tracking-wide">{t('Language / Idioma')}</span>
            <LanguageSwitch language={language} onChange={setLanguage} />
          </div>
          <div className="mb-5">
            <p className="mb-2 font-display text-xs uppercase tracking-wide">{t('Profile photo')}</p>
            <ProfilePhotoPicker value={data.profile?.photo} onChange={setProfilePhoto} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-display text-xs uppercase tracking-wide">{t('Name')}</span>
              <input value={name} maxLength={40} onChange={event => setName(event.target.value)} className="w-full border-2 border-ink bg-white px-3 py-2.5 font-body focus:outline-none focus:shadow-panelSm" />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-1 font-display text-xs uppercase tracking-wide"><MapPin size={13} /> {t('Location for weather')}</span>
              <input value={location} maxLength={80} onChange={event => setLocation(event.target.value)} className="w-full border-2 border-ink bg-white px-3 py-2.5 font-body focus:outline-none focus:shadow-panelSm" />
            </label>
          </div>
          <button type="button" onClick={handleSave} className="btn-press mt-4 inline-flex items-center gap-2 border-2 border-ink bg-leaf px-4 py-2.5 font-display text-xs uppercase text-white hover:bg-leafDark">
            <Save size={15} /> {t(saved ? 'Saved' : 'Save profile')}
          </button>
        </section>

        <section className="pt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg uppercase">{t('Daily success goal')}</h2>
              <p className="mt-1 font-mono text-[10px] text-ink/55">{t('Choose the completion percentage that counts as a successful day.')}</p>
            </div>
            <span className="border-2 border-ink bg-gold px-2 py-1 font-display text-sm">{data.successThreshold}%</span>
          </div>
          <input aria-label={t('Daily success goal')} type="range" min="0" max="100" step="5" value={data.successThreshold} onChange={event => setSuccessThreshold(Number(event.target.value))} className="w-full accent-ink" />
          <div className="flex justify-between font-mono text-[9px] text-ink/45"><span>0%</span><span>100%</span></div>
        </section>
      </Panel>
    </div>
  );
}
