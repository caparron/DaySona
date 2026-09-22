import { useState, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNow } from '@/hooks/useNow';
import { WeatherWidget } from '@/components/WeatherWidget';
import { MissionList } from '@/components/MissionList';
import { Tag } from '@/components/Panel';
import { todayKey, fullDateStr, timeStr, greeting, weekdayShort } from '@/utils/date';
import { WeatherInfo, fetchWeather, getFallbackWeather } from '@/utils/weather';

export function TodayView() {
  const { data } = useApp();
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
    const t = setTimeout(() => {
      if (!cancelled && !weather) {
        setWeather(getFallbackWeather(loc, dKey));
      }
    }, 5000);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.profile?.location]);

  const greet = greeting(now);
  const name = data.profile?.name || 'Player';

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Tag color="bg-ink text-cream">DAY {now.getDate()}</Tag>
            <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">{greet},</h1>
            <h1 className="font-display text-4xl leading-none text-coral md:text-5xl">{name.toUpperCase()}.</h1>
          </div>
          <WeatherWidget weather={weather} />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="-skew-x-6 border-2 border-ink bg-ink px-3 py-1.5 text-cream">
            <span className="skew-x-6 font-display text-sm">{weekdayShort(now)}</span>
          </div>
          <span className="font-mono text-sm text-ink/70">{fullDateStr(now)}</span>
          <span className="ml-auto font-mono text-sm text-ink/50">{timeStr(now)}</span>
        </div>
      </div>

      {/* Streak banner */}
      <div className="mb-6 flex items-center justify-between border-2 border-ink bg-ink p-4 shadow-panel">
        <div className="flex items-center gap-3">
          <Flame size={32} strokeWidth={2.5} className={data.streak.current > 0 ? 'animate-streakFlame text-ember' : 'text-mist/40'} />
          <div>
            <p className="font-display text-2xl leading-none text-cream">
              {data.streak.current} <span className="text-sm text-mist">DAY STREAK</span>
            </p>
            {data.streak.current > 0 && (
              <p className="mt-0.5 font-mono text-xs text-mist/60">Keep it going. Complete one mission today.</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Trophy size={16} strokeWidth={2.5} className="text-gold" />
            <span className="font-mono text-xs uppercase text-gold">Best</span>
          </div>
          <p className="font-display text-xl text-gold">{data.streak.best}</p>
        </div>
      </div>

      {/* Today's Missions */}
      <div className="border-2 border-ink bg-cream p-5 shadow-panel">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-ink bg-coral">
            <span className="font-display text-xs text-white">M</span>
          </div>
          <h2 className="font-display text-xl uppercase">Today's Missions</h2>
        </div>
        <MissionList dateKey={dKey} />
      </div>
    </div>
  );
}
