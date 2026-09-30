import { useState } from 'react';
import { Flame, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Tag } from '@/components/Panel';
import { monthGrid, dateKey as toDateKey, monthLong, todayKey, parseKey, isToday } from '@/utils/date';

export function StreakView() {
  const { data } = useApp();
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const grid = monthGrid(calMonth.year, calMonth.month);
  const completedSet = new Set(data.streak.completedDates);

  const prevMonth = () => {
    setCalMonth(m => {
      const d = new Date(m.year, m.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const nextMonth = () => {
    setCalMonth(m => {
      const d = new Date(m.year, m.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthName = monthLong(new Date(calMonth.year, calMonth.month, 1));
  const totalCompleted = data.streak.completedDates.length;
  const monthCompleted = data.streak.completedDates.filter(d => {
    const dt = parseKey(d);
    return dt.getFullYear() === calMonth.year && dt.getMonth() === calMonth.month;
  }).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-hero manga-panel manga-enter mb-6 flex items-center gap-3 border-3 border-ink bg-white p-4 shadow-panel">
        <div className="page-hero-icon"><Flame size={22} strokeWidth={2.7} /></div>
        <div>
          <h1 className="font-display text-3xl uppercase leading-none text-ink">Streak</h1>
          <p className="mt-1 font-mono text-xs text-ink/60">{totalCompleted} days completed · Keep your daily consistency going</p>
        </div>
      </div>

      {/* Big streak display */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="border-2 border-ink bg-ink p-5 text-center shadow-panelSm">
          <Flame size={36} strokeWidth={2.5} className={data.streak.current > 0 ? 'mx-auto animate-streakFlame text-ember' : 'mx-auto text-mist/40'} />
          <p className="mt-2 font-display text-4xl text-cream">{data.streak.current}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-mist">Current Streak</p>
        </div>
        <div className="border-2 border-ink bg-gold p-5 text-center shadow-panelSm">
          <Trophy size={36} strokeWidth={2.5} className="mx-auto text-ink" />
          <p className="mt-2 font-display text-4xl">{data.streak.best}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink/70">Best Record</p>
        </div>
      </div>

      {/* Rule explanation */}
      <div className="mb-5 border-2 border-ink bg-cream2 p-4 shadow-panelSm">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-ink bg-coral">
            <span className="font-display text-[10px] text-white">!</span>
          </div>
          <p className="text-sm text-ink/70">
            Complete <strong>at least one mission</strong> in a day to keep your streak alive.
            Miss a full day without completing any mission and the streak resets.
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="border-2 border-ink bg-cream p-4 shadow-panelSm">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="btn-press border-2 border-ink bg-cream2 p-1.5 hover:bg-mist/30">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <h3 className="font-display text-lg uppercase">{monthName} {calMonth.year}</h3>
          <button onClick={nextMonth} className="btn-press border-2 border-ink bg-cream2 p-1.5 hover:bg-mist/30">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="py-1 text-center font-mono text-[10px] uppercase text-ink/40">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.flat().map((d, i) => {
            if (!d) return <div key={i} />;
            const key = toDateKey(d);
            const completed = completedSet.has(key);
            const today = isToday(key);
            return (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center border-2 font-mono text-xs transition-all ${
                  completed
                    ? 'border-ink bg-leaf font-bold text-white'
                    : today
                    ? 'border-coral bg-coral/10 font-bold text-coral'
                    : 'border-ink/20 bg-cream2 text-ink/50'
                }`}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t-2 border-ink/10 pt-3">
          <div className="flex items-center gap-3 font-mono text-xs text-ink/60">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 border border-ink bg-leaf" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 border border-coral bg-coral/10" /> Today
            </span>
          </div>
          <Tag color="bg-ember text-white">{monthCompleted} this month</Tag>
        </div>
      </div>

      {/* Recent completed dates */}
      {data.streak.completedDates.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 font-display text-sm uppercase text-ink/60">Recent Activity</h3>
          <div className="flex flex-wrap gap-1.5">
            {[...data.streak.completedDates].reverse().slice(0, 20).map(d => (
              <span key={d} className="border-2 border-ink/30 bg-leaf/15 px-2 py-1 font-mono text-xs">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
