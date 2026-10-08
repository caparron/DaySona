import { useEffect, useState } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Snowflake, Sun, ListTodo } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNow } from '@/hooks/useNow';
import { todayKey } from '@/utils/date';
import { fetchWeather, WeatherInfo } from '@/utils/weather';

const WEATHER_ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  snowflake: Snowflake,
};

function dayPeriod(hour: number, language: 'en' | 'es'): string {
  if (hour < 5) return language === 'es' ? 'MADRUGADA' : 'LATE NIGHT';
  if (hour < 8) return language === 'es' ? 'MAÑANA TEMPRANO' : 'EARLY MORNING';
  if (hour < 12) return language === 'es' ? 'MAÑANA' : 'MORNING';
  if (hour < 14) return language === 'es' ? 'MEDIODÍA' : 'MIDDAY';
  if (hour < 19) return language === 'es' ? 'TARDE' : 'AFTERNOON';
  return language === 'es' ? 'NOCHE' : 'EVENING';
}

export function DayHud() {
  const { data, language, t } = useApp();
  const now = useNow(30_000);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const today = todayKey();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const dayLabel = new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', { weekday: 'short' })
    .format(now)
    .replace(/\.$/, '');
  const dateLabel = new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', { month: 'numeric', day: 'numeric' }).format(now);
  const backgroundLabel = language === 'es'
    ? isWeekend ? 'FINDE' : 'ENTRE SEMANA'
    : isWeekend ? 'WEEKEND' : 'WEEKDAY';
  const pendingCount = data.missions.filter(mission => mission.date === today && !mission.done).length;
  const WeatherIcon = weather ? WEATHER_ICONS[weather.icon] || Sun : Cloud;
  const location = data.profile?.location || 'Tokyo';

  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    fetchWeather(location).then(result => {
      if (!cancelled) setWeather(result);
    });
    return () => { cancelled = true; };
  }, [location, today]);

  return (
    <section
      className="day-hud"
      aria-label={`${dateLabel} ${dayLabel}, ${dayPeriod(now.getHours(), language)}, ${pendingCount} ${language === 'es' ? 'pendientes' : 'pending'}`}
    >
      <span className="day-hud-word" aria-hidden="true">{backgroundLabel}</span>
      <div className="day-hud-date">
        <div className="day-hud-date-line">
          <strong>{dateLabel}</strong>
          <span>{dayLabel}</span>
        </div>
        <span className="day-hud-period">{dayPeriod(now.getHours(), language)}</span>
      </div>

      <div className="day-hud-info">
        <div className="day-hud-pending" aria-label={`${pendingCount} ${language === 'es' ? 'tareas pendientes' : 'pending tasks'}`}>
          <ListTodo size={15} strokeWidth={2.5} />
          <strong>{pendingCount}</strong>
          <span>{language === 'es' ? 'PENDIENTES' : 'PENDING'}</span>
        </div>
        <div className="day-hud-weather" aria-label={weather ? `${weather.temp}°, ${t(weather.condition)}` : t('Loading weather')}>
          <WeatherIcon size={30} strokeWidth={2.3} />
          <strong>{weather ? `${weather.temp}°` : '—°'}</strong>
        </div>
      </div>
    </section>
  );
}
