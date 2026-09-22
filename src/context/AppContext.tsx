import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppData, Mission, Thought, Question, LongTermGoal, Milestone } from '@/types';
import { emptyData } from '@/types';
import { loadData, saveData } from '@/utils/storage';
import { todayKey, dateKey as toDateKey } from '@/utils/date';
import { checkAndBreakStreak, recordCompletion, removeCompletion } from '@/utils/streak';

interface AppContextValue {
  data: AppData;
  // Profile
  setProfile: (name: string, location: string) => void;
  // Missions
  addMission: (title: string, date?: string) => void;
  toggleMission: (id: string) => void;
  editMission: (id: string, title: string) => void;
  setMissionImportance: (id: string, importance: number) => void;
  deleteMission: (id: string) => void;
  setSuccessThreshold: (threshold: number) => void;
  getMissionsForDate: (date: string) => Mission[];
  // Thoughts
  addThought: (content: string) => void;
  editThought: (id: string, content: string) => void;
  deleteThought: (id: string) => void;
  // Questions
  addQuestion: (content: string) => void;
  toggleQuestionStatus: (id: string) => void;
  editQuestion: (id: string, content: string) => void;
  deleteQuestion: (id: string) => void;
  // Long term
  addLongTerm: (title: string, description: string, targetDate?: string) => void;
  updateLongTerm: (id: string, updates: Partial<LongTermGoal>) => void;
  deleteLongTerm: (id: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  // Streak helpers
  firstCompletionToday: boolean;
  clearFirstCompletion: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const loaded = loadData();
    return { ...loaded, streak: checkAndBreakStreak(loaded.streak) };
  });
  const [firstCompletionToday, setFirstCompletionToday] = useState(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setProfile = useCallback((name: string, location: string) => {
    setData(d => ({ ...d, profile: { name, location } }));
  }, []);

  const addMission = useCallback((title: string, date?: string) => {
    const dKey = date || todayKey();
    setData(d => ({
      ...d,
      missions: [
        ...d.missions,
        { id: uid(), title: title.trim(), done: false, date: dKey, createdAt: Date.now(), importance: -1 },
      ],
    }));
  }, []);

  const toggleMission = useCallback((id: string) => {
    setData(d => {
      const mission = d.missions.find(m => m.id === id);
      if (!mission) return d;
      const newDone = !mission.done;
      const missions = d.missions.map(m => m.id === id ? { ...m, done: newDone } : m);
      const mDate = mission.date;
      let streak = d.streak;

      if (newDone) {
        const wasCompletedToday = d.streak.completedDates.includes(mDate);
        streak = recordCompletion(d.streak, mDate);
        if (!wasCompletedToday) {
          setFirstCompletionToday(true);
        }
      } else {
        const hasOther = missions.some(m => m.date === mDate && m.done && m.id !== id);
        streak = removeCompletion(d.streak, mDate, hasOther);
      }

      return { ...d, missions, streak };
    });
  }, []);

  const editMission = useCallback((id: string, title: string) => {
    setData(d => ({
      ...d,
      missions: d.missions.map(m => m.id === id ? { ...m, title: title.trim() } : m),
    }));
  }, []);

  const setMissionImportance = useCallback((id: string, importance: number) => {
    setData(d => ({
      ...d,
      missions: d.missions.map(m => m.id === id ? { ...m, importance: Math.max(0, Math.min(100, Math.round(importance))) } : m),
    }));
  }, []);

  const setSuccessThreshold = useCallback((threshold: number) => {
    setData(d => ({ ...d, successThreshold: Math.max(0, Math.min(100, Math.round(threshold))) }));
  }, []);

  const deleteMission = useCallback((id: string) => {
    setData(d => {
      const mission = d.missions.find(m => m.id === id);
      if (!mission) return d;
      const missions = d.missions.filter(m => m.id !== id);
      let streak = d.streak;
      if (mission.done) {
        const hasOther = missions.some(m => m.date === mission.date && m.done);
        streak = removeCompletion(d.streak, mission.date, hasOther);
      }
      return { ...d, missions, streak };
    });
  }, []);

  const getMissionsForDate = useCallback((date: string) => {
    return data.missions.filter(m => m.date === date);
  }, [data.missions]);

  const addThought = useCallback((content: string) => {
    setData(d => ({
      ...d,
      thoughts: [
        { id: uid(), content: content.trim(), date: todayKey(), createdAt: Date.now() },
        ...d.thoughts,
      ],
    }));
  }, []);

  const editThought = useCallback((id: string, content: string) => {
    setData(d => ({
      ...d,
      thoughts: d.thoughts.map(t => t.id === id ? { ...t, content: content.trim() } : t),
    }));
  }, []);

  const deleteThought = useCallback((id: string) => {
    setData(d => ({ ...d, thoughts: d.thoughts.filter(t => t.id !== id) }));
  }, []);

  const addQuestion = useCallback((content: string) => {
    setData(d => ({
      ...d,
      questions: [
        { id: uid(), content: content.trim(), status: 'open' as const, date: todayKey(), createdAt: Date.now() },
        ...d.questions,
      ],
    }));
  }, []);

  const toggleQuestionStatus = useCallback((id: string) => {
    setData(d => ({
      ...d,
      questions: d.questions.map(q => q.id === id
        ? { ...q, status: q.status === 'open' ? 'solved' as const : 'open' as const, solvedAt: q.status === 'open' ? Date.now() : undefined }
        : q
      ),
    }));
  }, []);

  const editQuestion = useCallback((id: string, content: string) => {
    setData(d => ({
      ...d,
      questions: d.questions.map(q => q.id === id ? { ...q, content: content.trim() } : q),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setData(d => ({ ...d, questions: d.questions.filter(q => q.id !== id) }));
  }, []);

  const addLongTerm = useCallback((title: string, description: string, targetDate?: string) => {
    setData(d => ({
      ...d,
      longTerm: [
        { id: uid(), title: title.trim(), description: description.trim(), progress: 0, targetDate: targetDate || undefined, milestones: [], createdAt: Date.now() },
        ...d.longTerm,
      ],
    }));
  }, []);

  const updateLongTerm = useCallback((id: string, updates: Partial<LongTermGoal>) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
  }, []);

  const deleteLongTerm = useCallback((id: string) => {
    setData(d => ({ ...d, longTerm: d.longTerm.filter(g => g.id !== id) }));
  }, []);

  const addMilestone = useCallback((goalId: string, title: string) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => g.id === goalId
        ? { ...g, milestones: [...g.milestones, { id: uid(), title: title.trim(), done: false }] }
        : g
      ),
    }));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map(ms => ms.id === milestoneId ? { ...ms, done: !ms.done } : ms);
        const doneCount = milestones.filter(ms => ms.done).length;
        const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : g.progress;
        return { ...g, milestones, progress };
      }),
    }));
  }, []);

  const deleteMilestone = useCallback((goalId: string, milestoneId: string) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.filter(ms => ms.id !== milestoneId);
        const doneCount = milestones.filter(ms => ms.done).length;
        const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : g.progress;
        return { ...g, milestones, progress };
      }),
    }));
  }, []);

  const clearFirstCompletion = useCallback(() => setFirstCompletionToday(false), []);

  const value: AppContextValue = {
    data,
    setProfile,
    addMission,
    toggleMission,
    editMission,
    setMissionImportance,
    deleteMission,
    setSuccessThreshold,
    getMissionsForDate,
    addThought,
    editThought,
    deleteThought,
    addQuestion,
    toggleQuestionStatus,
    editQuestion,
    deleteQuestion,
    addLongTerm,
    updateLongTerm,
    deleteLongTerm,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    firstCompletionToday,
    clearFirstCompletion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
