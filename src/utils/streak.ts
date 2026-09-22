import { StreakData } from '@/types';
import { todayKey, daysBetween } from './date';

export function checkAndBreakStreak(streak: StreakData): StreakData {
  if (!streak.lastActiveDate) return streak;
  const today = todayKey();
  const gap = daysBetween(streak.lastActiveDate, today);
  if (gap > 1) {
    return { ...streak, current: 0 };
  }
  return streak;
}

export function recordCompletion(streak: StreakData, dateKey: string): StreakData {
  if (streak.completedDates.includes(dateKey)) {
    return streak;
  }
  const newCompleted = [...streak.completedDates, dateKey].sort();

  let newCurrent = 1;
  if (streak.lastActiveDate) {
    const gap = daysBetween(streak.lastActiveDate, dateKey);
    if (gap === 1) {
      newCurrent = streak.current + 1;
    } else if (gap === 0) {
      newCurrent = streak.current;
    } else {
      newCurrent = 1;
    }
  }

  const newBest = Math.max(streak.best, newCurrent);

  return {
    current: newCurrent,
    best: newBest,
    lastActiveDate: dateKey,
    completedDates: newCompleted,
  };
}

export function removeCompletion(streak: StreakData, dateKey: string, hasOtherCompletedMissions: boolean): StreakData {
  if (hasOtherCompletedMissions) return streak;
  const newCompleted = streak.completedDates.filter(d => d !== dateKey);
  let newCurrent = 0;
  let newLastActive = null as string | null;
  if (newCompleted.length > 0) {
    const sorted = [...newCompleted].sort();
    newLastActive = sorted[sorted.length - 1];
    let count = 1;
    let prev = sorted[sorted.length - 1];
    for (let i = sorted.length - 2; i >= 0; i--) {
      const gap = daysBetween(sorted[i], prev);
      if (gap === 1) {
        count++;
        prev = sorted[i];
      } else {
        break;
      }
    }
    newCurrent = count;
  }
  const newBest = Math.max(streak.best, newCurrent);
  return {
    current: newCurrent,
    best: newBest,
    lastActiveDate: newLastActive,
    completedDates: newCompleted,
  };
}
