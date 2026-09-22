import { AppData, Mission, emptyData } from '@/types';

const KEY = 'dayframe_data_v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
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
      successThreshold: parsed.successThreshold ?? 70,
    };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}
