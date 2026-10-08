import { useState, useEffect } from 'react';
import { ArrowRight, CalendarDays, Flame, HelpCircle, Target, Trophy, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNow } from '@/hooks/useNow';
import { WeatherWidget } from '@/components/WeatherWidget';
import { MissionList } from '@/components/MissionList';
import { Tag } from '@/components/Panel';
import { todayKey, fullDateStr, timeStr, greeting, greetingEs, weekdayShort } from '@/utils/date';
import { WeatherInfo, fetchWeather } from '@/utils/weather';

export function TodayView({ onNavigate }: { onNavigate?: (view: 'calendar' | 'questions' | 'longterm' | 'achievements') => void }) {
  const { data, language, t } = useApp();
  const now = useNow(1000);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  const dKey = todayKey();

  useEffect(() => {
    const loc = data.profile?.location || 'Tokyo';
    let cancelled = false;
    setWeather(null);
    fetchWeather(loc).then(w => {
      if (!cancelled) setWeather(w);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.profile?.location]);

  const greet = language === 'es' ? greetingEs(now) : greeting(now);
  const name = data.profile?.name || 'Player';

  return (
    <div className="today-page mx-auto max-w-[1440px]">
      <div className="today-top-grid">
        {/* Hero header */}
        <section className="today-hero jrpg-hero manga-panel mission-checker-bg border-2 border-ink p-5 shadow-panel md:p-7">
          <div className="jrpg-hero-art" aria-hidden="true">
            <img src={data.profile?.photo || '/daysona-logo.png'} alt="" />
          </div>
          <div className="jrpg-hero-content flex h-full flex-col justify-between gap-8">
            <div className="jrpg-hero-copy">
              <Tag color="bg-coral text-white" className="jrpg-day-tag">{language === 'es' ? 'DÍA' : 'DAY'} {now.getDate()}</Tag>
              <h1 className="jrpg-greeting mt-5 font-display text-4xl leading-[0.95] md:text-6xl">{greet},</h1>
              <h1 className="jrpg-name mt-1 font-display text-5xl leading-[0.95] text-coral md:text-7xl">{name.toUpperCase()}.</h1>
            </div>
            <div className="today-date-strip jrpg-date-strip flex flex-wrap items-center gap-2 border-t-2 border-ink/70 pt-3">
              <div className="-skew-x-6 border-2 border-ink bg-gold px-3 py-1.5 text-ink shadow-panelSm">
                <span className="skew-x-6 font-display text-sm">{weekdayShort(now, language)}</span>
              </div>
              <span className="border-2 border-ink bg-white/90 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-ink">{fullDateStr(now, language)}</span>
              <span className="ml-auto border-2 border-ink bg-gold px-2.5 py-1 font-mono text-xs font-bold text-ink shadow-panelSm">{timeStr(now, language)}</span>
            </div>
          </div>
        </section>

        <aside className="today-side-column">
          <WeatherWidget weather={weather} />
          {/* Streak banner */}
          <section className="today-streak-panel jrpg-streak-panel manga-panel flex items-center justify-between border-2 border-ink bg-ink p-3 text-cream shadow-panel md:p-4">
            <div className="flex items-center gap-3">
              <Flame size={26} strokeWidth={2.5} className={data.streak.current > 0 ? 'animate-streakFlame text-ember' : 'text-mist/40'} />
              <div>
                <p className="font-display text-xl leading-none">
                  {data.streak.current} <span className="text-sm text-mist">{t('DAY STREAK')}</span>
                </p>
                {data.streak.current > 0 && (
                  <p className="mt-1 font-mono text-[10px] text-mist/70">{t('Keep it going. Complete one mission today.')}</p>
                )}
              </div>
            </div>
            <div className="border-l-2 border-white/20 pl-4 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Trophy size={16} strokeWidth={2.5} className="text-gold" />
                <span className="font-mono text-xs uppercase text-gold">{t('Best')}</span>
              </div>
              <p className="font-display text-xl text-gold">{data.streak.best}</p>
            </div>
          </section>
        </aside>
      </div>

      {/* Today's Missions and quick navigation */}
      <div className="today-bottom-grid">
        <section className="today-missions jrpg-missions manga-panel mission-checker-bg border-2 border-ink p-5 shadow-panel md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-gold text-ink shadow-panelSm">
              <span className="font-display text-sm">M</span>
            </div>
            <div>
              <h2 className="font-display text-xl uppercase md:text-2xl">{t("Today's Missions")}</h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/55">{t('Check off your daily panels')}</p>
            </div>
          </div>
          <MissionList dateKey={dKey} />
        </section>

        <aside className="today-shortcuts" aria-label={t('Quick access')}>
          <button type="button" className="today-shortcut jrpg-shortcut" onClick={() => onNavigate?.('calendar')}>
            <span className="today-shortcut-icon"><CalendarDays size={19} strokeWidth={2.5} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm uppercase">{t('Calendar')}</span>
              <span className="block font-mono text-[10px] text-ink/55">{t('Review any day')}</span>
            </span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button type="button" className="today-shortcut jrpg-shortcut" onClick={() => onNavigate?.('questions')}>
            <span className="today-shortcut-icon"><HelpCircle size={19} strokeWidth={2.5} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm uppercase">{t('Questions')}</span>
              <span className="block font-mono text-[10px] text-ink/55">{t('Things to figure out')}</span>
            </span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button type="button" className="today-shortcut jrpg-shortcut" onClick={() => onNavigate?.('longterm')}>
            <span className="today-shortcut-icon"><Target size={19} strokeWidth={2.5} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm uppercase">{t('Long Term')}</span>
              <span className="block font-mono text-[10px] text-ink/55">{t('Bigger goals, step by step')}</span>
            </span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button type="button" className="today-shortcut jrpg-shortcut" onClick={() => onNavigate?.('achievements')}>
            <span className="today-shortcut-icon"><Award size={19} strokeWidth={2.5} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm uppercase">{t('Achievements')}</span>
              <span className="block font-mono text-[10px] text-ink/55">{t('Celebrate your wins')}</span>
            </span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </aside>
      </div>
    </div>
  );
}
