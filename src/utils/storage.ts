import { AppData, Mission, emptyData } from '@/types';

const KEY = 'dayframe_data_v1';
const LEGACY_MIGRATED_KEY = 'dayframe_data_v1_account_migrated';

export function hasLocalData(userId: string): boolean {
  try {
    return Boolean(
      localStorage.getItem(`${KEY}_${userId}`) ||
      (localStorage.getItem(KEY) && localStorage.getItem(LEGACY_MIGRATED_KEY) !== 'true')
    );
  } catch {
    return false;
  }
}

export function loadData(userId: string): AppData {
  try {
    const userKey = `${KEY}_${userId}`;
    let raw = localStorage.getItem(userKey);

    // Give the existing browser data to the first account that signs in.
    if (!raw && localStorage.getItem(LEGACY_MIGRATED_KEY) !== 'true') {
      raw = localStorage.getItem(KEY);
      localStorage.setItem(LEGACY_MIGRATED_KEY, 'true');
      if (raw) localStorage.setItem(userKey, raw);
    }

    if (!raw) return emptyData;
    const parsed = JSON.parse(raw);
    return {
      ...emptyData,
      ...parsed,
      streak: { ...emptyData.streak, ...(parsed.streak || {}) },
      profile: parsed.profile || null,
      missions: (parsed.missions || []).map((m: Mission) => ({
        ...m,
        importance: m.importance ?? -1,
      })),
      thoughts: parsed.thoughts || [],
      questions: parsed.questions || [],
      longTerm: parsed.longTerm || [],
      achievements: parsed.achievements || [],
      categories: Array.isArray(parsed.categories) ? parsed.categories.filter((category: unknown): category is string => typeof category === 'string') : [],
      categoryColors: parsed.categoryColors && typeof parsed.categoryColors === 'object' ? parsed.categoryColors : {},
      successThreshold: parsed.successThreshold ?? 70,
    };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData, userId: string): void {
  try {
    localStorage.setItem(`${KEY}_${userId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}
