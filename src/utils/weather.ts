export interface WeatherInfo {
  temp: number;
  condition: string;
  icon: string;
  location: string;
  isFallback: boolean;
}

const FALLBACK_CONDITIONS = [
  { condition: 'Clear', icon: 'sun' },
  { condition: 'Partly Cloudy', icon: 'cloud-sun' },
  { condition: 'Cloudy', icon: 'cloud' },
  { condition: 'Light Rain', icon: 'cloud-rain' },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getFallbackWeather(location: string, dateKey: string): WeatherInfo {
  const seed = dateKey.split('-').reduce((a, c) => a + parseInt(c), 0);
  const condIdx = Math.floor(seededRandom(seed) * FALLBACK_CONDITIONS.length);
  const temp = 15 + Math.floor(seededRandom(seed + 1) * 18);
  const c = FALLBACK_CONDITIONS[condIdx];
  return {
    temp,
    condition: c.condition,
    icon: c.icon,
    location,
    isFallback: true,
  };
}

export async function fetchWeather(location: string): Promise<WeatherInfo> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) throw new Error('geo failed');
    const geo = await geoRes.json();
    if (!geo.results || geo.results.length === 0) throw new Error('no location');
    const { latitude, longitude, name, country_code } = geo.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
    );
    if (!weatherRes.ok) throw new Error('weather failed');
    const w = await weatherRes.json();
    const temp = Math.round(w.current.temperature_2m);
    const code = w.current.weather_code;
    const { condition, icon } = mapWeatherCode(code);
    return {
      temp,
      condition,
      icon,
      location: `${name}${country_code ? ', ' + country_code : ''}`,
      isFallback: false,
    };
  } catch {
    return getFallbackWeather(location, dateKeyLocal());
  }
}

function dateKeyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mapWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear', icon: 'sun' };
  if (code <= 2) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'Cloudy', icon: 'cloud' };
  if (code <= 48) return { condition: 'Foggy', icon: 'cloud-fog' };
  if (code <= 57) return { condition: 'Drizzle', icon: 'cloud-drizzle' };
  if (code <= 67) return { condition: 'Rain', icon: 'cloud-rain' };
  if (code <= 77) return { condition: 'Snow', icon: 'snowflake' };
  if (code <= 82) return { condition: 'Rain', icon: 'cloud-rain' };
  if (code <= 86) return { condition: 'Snow', icon: 'snowflake' };
  if (code <= 99) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
  return { condition: 'Clear', icon: 'sun' };
}
