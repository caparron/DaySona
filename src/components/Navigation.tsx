import { CalendarDays, Sun, Brain, HelpCircle, Target, Flame, LogOut, Trophy, Settings, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type View = 'today' | 'thoughts' | 'questions' | 'longterm' | 'streak' | 'calendar' | 'achievements' | 'social' | 'settings';

interface NavItem {
  id: View;
  label: string;
  icon: typeof Sun;
  color: string;
  active: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'calendar', label: 'CALENDAR', icon: CalendarDays, color: 'bg-rose', active: 'bg-rose text-white' },
  { id: 'today', label: 'TODAY', icon: Sun, color: 'bg-coral', active: 'bg-coral text-white' },
  { id: 'thoughts', label: 'THOUGHTS', icon: Brain, color: 'bg-sky', active: 'bg-sky text-white' },
  { id: 'questions', label: 'QUESTIONS', icon: HelpCircle, color: 'bg-gold', active: 'bg-gold text-ink' },
  { id: 'longterm', label: 'LONG TERM', icon: Target, color: 'bg-leaf', active: 'bg-leaf text-white' },
  { id: 'streak', label: 'STREAK', icon: Flame, color: 'bg-ember', active: 'bg-ember text-white' },
  { id: 'achievements', label: 'ACHIEVEMENTS', icon: Trophy, color: 'bg-leaf', active: 'bg-leaf text-white' },
  { id: 'social', label: 'SOCIAL LINKS', icon: Users, color: 'bg-sky', active: 'bg-sky text-white' },
];

interface TopNavigationProps {
  current: View;
  onNavigate: (view: View) => void;
  streakCount: number;
  profilePhoto?: string;
  onSignOut?: () => void;
}

export function TopNavigation({ current, onNavigate, streakCount, profilePhoto, onSignOut }: TopNavigationProps) {
  const { t } = useApp();
  return (
    <header className="jrpg-header sticky top-0 z-40 border-b-3 border-ink bg-yellow-300/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-7">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <img src="/daysona-logo.png" alt="DaySona" className="jrpg-brand-mark h-10 w-10 border-2 border-ink object-cover shadow-panelSm" />
          <div className="hidden lg:block">
            <h1 className="jrpg-wordmark font-display text-lg leading-none">DAYSONA</h1>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50">{t('New round / new day')}</p>
          </div>
        </div>

        <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const selected = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={selected ? 'page' : undefined}
                className={`jrpg-nav-tab group relative flex shrink-0 items-center gap-2 border-2 border-ink px-3 py-2 transition-all duration-200 btn-press md:px-4 ${
                  selected ? `${item.active} shadow-panelSm -translate-y-0.5` : 'bg-cream2 text-ink/65 hover:-translate-y-1 hover:bg-cream'
                }`}
              >
                <Icon size={16} strokeWidth={2.7} className="transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110" />
                <span className="font-display text-[11px] uppercase tracking-wide md:text-xs">{t(item.label)}</span>
                {item.id === 'streak' && streakCount > 0 && (
                  <span className="font-mono text-[10px] font-bold">{streakCount}</span>
                )}
                <span className={`absolute bottom-[-5px] left-1/2 h-1 w-0 -translate-x-1/2 transition-all duration-200 group-hover:w-2/3 ${item.color}`} />
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          aria-label={t('Settings')}
          title={t('Settings')}
          className={`btn-press relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border-2 border-ink shadow-panelSm transition hover:-translate-y-0.5 ${current === 'settings' ? 'bg-gold' : 'bg-white hover:bg-cream2'}`}
        >
          {profilePhoto ? <img src={profilePhoto} alt="" className="h-full w-full object-cover" /> : <Settings size={18} strokeWidth={2.5} />}
          {profilePhoto && <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center border-l border-t border-ink bg-gold"><Settings size={10} strokeWidth={3} /></span>}
        </button>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            aria-label={t('Sign out')}
            title={t('Sign out')}
            className="jrpg-signout btn-press flex shrink-0 items-center justify-center gap-2 border-2 border-ink bg-white px-2.5 py-2 font-display text-[10px] uppercase hover:bg-cream2 sm:px-3"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span className="hidden xl:inline">{t('Sign out')}</span>
          </button>
        )}
      </div>
    </header>
  );
}

interface SidebarProps {
  current: View;
  onNavigate: (view: View) => void;
  streakCount: number;
}

export function Sidebar({ current, onNavigate, streakCount }: SidebarProps) {
  return <TopNavigation current={current} onNavigate={onNavigate} streakCount={streakCount} />;
}

interface BottomNavProps {
  current: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  const { t } = useApp();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t-2 border-ink bg-ink md:hidden">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const selected = current === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2 ${selected ? item.color : 'text-mist'}`}>
            <Icon size={16} strokeWidth={2.7} />
            <span className="font-display text-[8px] uppercase">{t(item.label).split(' ')[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
