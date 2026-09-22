import { Mission } from '@/types';

export function getMissionWeight(mission: Mission, allMissions: Mission[]): number {
  const sameDay = allMissions.filter(m => m.date === mission.date);
  if (sameDay.length === 0) return 0;

  const custom = sameDay.filter(m => m.importance >= 0);
  const auto = sameDay.filter(m => m.importance < 0);

  const customSum = custom.reduce((s, m) => s + m.importance, 0);
  const remaining = Math.max(0, 100 - customSum);
  const autoShare = auto.length > 0 ? remaining / auto.length : 0;

  return mission.importance >= 0 ? mission.importance : autoShare;
}

export function getDayProgress(missions: Mission[], allMissions: Mission[]): number {
  if (missions.length === 0) return 0;
  let total = 0;
  let done = 0;
  for (const m of missions) {
    const w = getMissionWeight(m, allMissions);
    total += w;
    if (m.done) done += w;
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}
