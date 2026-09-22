import { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { TopNavigation, BottomNav, View } from '@/components/Navigation';
import { Onboarding } from '@/components/Onboarding';
import { TodayView } from '@/views/TodayView';
import { ThoughtsView } from '@/views/ThoughtsView';
import { QuestionsView } from '@/views/QuestionsView';
import { LongTermView } from '@/views/LongTermView';
import { StreakView } from '@/views/StreakView';
import { CalendarView } from '@/views/CalendarView';

const VIEW_COMPONENTS: Record<View, () => JSX.Element> = {
  today: TodayView,
  thoughts: ThoughtsView,
  questions: QuestionsView,
  longterm: LongTermView,
  streak: StreakView,
  calendar: CalendarView,
};

function AnimatedView({ view }: { view: View }) {
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
      <CurrentView />
    </div>
  );
}

function AppContent() {
  const { data } = useApp();
  const [view, setView] = useState<View>('today');

  if (!data.profile) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <TopNavigation current={view} onNavigate={setView} streakCount={data.streak.current} />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 md:px-7 md:pb-10 md:pt-7">
        <AnimatedView view={view} />
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
