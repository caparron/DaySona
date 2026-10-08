import { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, CloudSun, Snowflake, MapPin } from 'lucide-react';
import { WeatherInfo } from '@/utils/weather';
import { useApp } from '@/context/AppContext';

const ICON_MAP: Record<string, typeof Sun> = {
  'sun': Sun,
  'cloud-sun': CloudSun,
  'cloud': Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'snowflake': Snowflake,
};

interface WeatherWidgetProps {
  weather: WeatherInfo | null;
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  const { t } = useApp();
  const [expanded, setExpanded] = useState(false);

  if (!weather) {
    return (
      <div className="jrpg-weather-skeleton bg-ink border-2 border-ink p-3 animate-pulse min-w-[120px]">
        <div className="h-4 w-16 bg-ink2 rounded mb-2" />
        <div className="h-8 w-20 bg-ink2 rounded" />
      </div>
    );
  }

  const Icon = ICON_MAP[weather.icon] || Sun;
  const iconColor = weather.isFallback ? 'text-gold' : 'text-sky';

  return (
    <div className="jrpg-weather-wrap">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${weather.temp}°, ${t(weather.condition)}, ${weather.location}`}
        className="jrpg-weather bg-cream border-2 border-ink shadow-panelSm p-3 cursor-pointer btn-press select-none"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={28} strokeWidth={2.5} className={iconColor} />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl leading-none">{weather.temp}°</span>
              <span className="text-[10px] font-mono uppercase text-ink/60">{t(weather.condition)}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} strokeWidth={2.5} className="text-coral" />
              <span className="text-[10px] font-mono text-ink/60 truncate max-w-[100px]">{weather.location}</span>
            </div>
          </div>
        </div>
      </div>
      {expanded && weather.isFallback && (
        <p className="text-[10px] text-ink/40 italic mt-1.5 animate-fadeIn">{t('Simulated weather (no live data)')}</p>
      )}
    </div>
  );
}
