import { useState, useEffect, useRef } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import { TopNavigation, BottomNav, View } from '@/components/Navigation';
import { Onboarding } from '@/components/Onboarding';
import { TodayView } from '@/views/TodayView';
import { ThoughtsView } from '@/views/ThoughtsView';
import { QuestionsView } from '@/views/QuestionsView';
import { LongTermView } from '@/views/LongTermView';
import { StreakView } from '@/views/StreakView';
import { CalendarView } from '@/views/CalendarView';
import { AchievementsView } from '@/views/AchievementsView';

const VIEW_COMPONENTS: Record<View, () => JSX.Element> = {
  today: () => <TodayView />,
  thoughts: ThoughtsView,
  questions: QuestionsView,
  longterm: LongTermView,
  streak: StreakView,
  calendar: CalendarView,
  achievements: AchievementsView,
};

function AnimatedView({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  const [renderedView, setRenderedView] = useState(view);
  const [animClass, setAnimClass] = useState('animate-viewIn');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (view === renderedView) return;
    setAnimClass('animate-viewOut');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setRenderedView(view);
      setAnimClass('animate-viewIn');
    }, 180);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [view, renderedView]);

  const CurrentView = VIEW_COMPONENTS[renderedView];

  return (
    <div className={animClass}>
      {renderedView === 'today' ? <TodayView onNavigate={onNavigate} /> : <CurrentView />}
    </div>
  );
}

function AppContent() {
  const { data, session, authLoading, dataReady, dataUserId, signOut, syncStatus, syncError, retryCloudSync } = useApp();
  const [view, setView] = useState<View>('today');

  if (authLoading || (session && (!dataReady || dataUserId !== session.user.id))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-300">
        <p className="border-2 border-ink bg-white px-5 py-3 font-display text-sm uppercase shadow-panel">Loading your account…</p>
      </div>
    );
  }

  if (!session) {
    return <Onboarding authenticated={false} />;
  }

  if (!data.profile) {
    return <Onboarding authenticated />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Could not sign out', error);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300">
      <TopNavigation current={view} onNavigate={setView} streakCount={data.streak.current} onSignOut={handleSignOut} />

      <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-5 md:px-7 md:pb-10 md:pt-7">
        <div className={`mb-4 flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-wider ${syncStatus === 'error' ? 'text-coralDark' : 'text-ink/45'}`}>
          {syncStatus === 'error' ? <CloudOff size={14} /> : <Cloud size={14} />}
          {syncStatus === 'saving' ? 'Syncing to your account…' : syncStatus === 'error' ? 'Cloud sync unavailable' : 'Progress saved to your account'}
          {syncStatus === 'error' && (
            <button type="button" onClick={retryCloudSync} className="ml-1 inline-flex items-center gap-1 border border-ink/30 bg-white px-2 py-1 text-ink hover:bg-cream2">
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
        {syncStatus === 'error' && (
          <p role="status" className="mb-4 border-2 border-coralDark bg-white px-3 py-2 font-mono text-[10px] text-ink/70">
            {syncError || 'Your account data could not be loaded from Supabase. Changes are kept on this device until sync is restored.'}
          </p>
        )}
        <AnimatedView view={view} onNavigate={setView} />
      </main>

      <BottomNav current={view} onNavigate={setView} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
