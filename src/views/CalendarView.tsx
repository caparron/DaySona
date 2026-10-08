import { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ArrowLeft, Sun, Brain, HelpCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Panel, Tag } from '@/components/Panel';
import { EmptyState } from '@/components/EmptyState';
import { MissionList } from '@/components/MissionList';
import { AgendaPlanner } from '@/components/AgendaPlanner';
import {
  monthGrid, dateKey as toDateKey, monthLong, todayKey, parseKey, isToday,
  fullDateStr, weekdayShort,
} from '@/utils/date';
import { WeatherInfo, getFallbackWeather } from '@/utils/weather';

export function CalendarView() {
  const { data, t, language } = useApp();
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());

  const grid = monthGrid(calMonth.year, calMonth.month);
  const completedSet = new Set(data.streak.completedDates);
  const longTermTargetDates = new Set(data.longTerm.flatMap(goal => goal.targetDate ? [goal.targetDate] : []));
  const thoughtsForDay = data.thoughts.filter(t => t.date === selectedDate);
  const questionsForDay = data.questions.filter(q => q.date === selectedDate);

  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    const loc = data.profile?.location || 'Tokyo';
    setWeather(getFallbackWeather(loc, selectedDate));
  }, [selectedDate, data.profile?.location]);

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

  const selectedParsed = parseKey(selectedDate);
  const monthName = monthLong(new Date(calMonth.year, calMonth.month, 1), language);
  const isFuture = selectedDate > todayKey();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-hero manga-panel manga-enter mb-6 flex items-center justify-between gap-3 border-3 border-ink bg-white p-4 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="page-hero-icon"><CalendarDays size={22} strokeWidth={2.7} /></div>
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-ink">{t('Calendar')}</h1>
            <p className="mt-1 font-mono text-xs text-ink/60">{t('Browse dates and review your daily activity')}</p>
          </div>
        </div>
        {selectedDate !== todayKey() && (
          <button
            onClick={() => setSelectedDate(todayKey())}
            className="btn-press flex items-center gap-1 border-2 border-ink bg-coral px-3 py-2 font-display text-xs uppercase tracking-wider text-white hover:bg-coralDark"
          >
            <ArrowLeft size={14} strokeWidth={3} /> {t('Back to Today')}
          </button>
        )}
      </div>

      {/* Calendar grid */}
      <Panel bg="bg-cream" className="mb-5 p-4">
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
          {Array.from({ length: 7 }, (_, i) => weekdayShort(new Date(2024, 0, 7 + i), language)).map((d, i) => (
            <div key={i} className="py-1 text-center font-mono text-[10px] uppercase text-ink/40">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.flat().map((d, i) => {
            if (!d) return <div key={i} />;
            const key = toDateKey(d);
            const completed = completedSet.has(key);
            const today = isToday(key);
            const selected = key === selectedDate;
            const hasLongTermTarget = longTermTargetDates.has(key);
            const hasAgendaEntry = data.agendaItems.some(item => item.repeatsWeekly
              ? item.weekdays.includes(d.getDay())
              : item.date === key);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(key)}
                title={hasLongTermTarget ? t('Long-term goal date') : undefined}
                aria-label={`${d.getDate()}${hasLongTermTarget ? `, ${t('Long-term goal date')}` : ''}`}
                className={`btn-press relative flex aspect-square items-center justify-center border-2 font-mono text-xs transition-all ${
                  selected
                    ? 'border-ink bg-ink font-bold text-cream'
                    : completed
                    ? 'border-ink bg-leaf text-white hover:bg-leafDark'
                    : today
                    ? 'border-coral bg-coral/10 font-bold text-coral hover:bg-coral/20'
                    : hasLongTermTarget
                    ? 'border-leaf bg-leaf/15 font-bold text-leafDark hover:bg-leaf/25'
                    : 'border-ink/20 bg-cream2 text-ink/60 hover:bg-mist/20'
                }`}
              >
                {d.getDate()}
                {hasLongTermTarget && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${completed ? 'bg-white' : 'bg-leaf'}`}
                  />
                )}
                {hasAgendaEntry && <span aria-hidden="true" className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-sky" />}
              </button>
            );
          })}
        </div>
      </Panel>

      <AgendaPlanner selectedDate={selectedDate} />

      {/* Selected day detail */}
      <div key={selectedDate} className="animate-fadeIn">
        <div className="mb-4 flex items-center gap-2">
          <Tag color="bg-ink text-cream">{weekdayShort(selectedParsed, language)}</Tag>
          <h2 className="font-display text-xl uppercase">{fullDateStr(selectedParsed, language)}</h2>
          {weather && (
            <span className="ml-auto font-mono text-xs text-ink/50">
              {weather.temp}° · {t(weather.condition)}
            </span>
          )}
        </div>

        {isFuture && (
          <div className="mb-4 border-2 border-gold bg-gold/20 p-3 text-sm text-ink/70">
            {t('This is a future date. You can plan ahead by adding missions below.')}
          </div>
        )}

        {/* Missions */}
        <Panel bg="bg-cream" className="mb-4 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sun size={16} strokeWidth={2.5} className="text-coral" />
            <h3 className="font-display text-sm uppercase">{t('Missions')}</h3>
          </div>
          <MissionList dateKey={selectedDate} readOnly={selectedDate !== todayKey()} allowAdd={isFuture} />
        </Panel>

        {/* Thoughts */}
        <Panel bg="bg-cream" className="mb-4 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Brain size={16} strokeWidth={2.5} className="text-sky" />
            <h3 className="font-display text-sm uppercase">{t('Thoughts')}</h3>
          </div>
          {thoughtsForDay.length === 0 ? (
            <EmptyState title={t('No thoughts this day')} subtitle="" icon={<Brain size={24} strokeWidth={1.5} />} />
          ) : (
            <div className="space-y-2">
              {thoughtsForDay.map(t => (
                <div key={t.id} className="border-2 border-ink/20 bg-cream2 p-3">
                  <p className="whitespace-pre-wrap text-sm">{t.content}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Questions */}
        <Panel bg="bg-cream" className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle size={16} strokeWidth={2.5} className="text-gold" />
            <h3 className="font-display text-sm uppercase">{t('Questions')}</h3>
          </div>
          {questionsForDay.length === 0 ? (
            <EmptyState title={t('No questions this day')} subtitle="" icon={<HelpCircle size={24} strokeWidth={1.5} />} />
          ) : (
            <div className="space-y-2">
              {questionsForDay.map(q => (
                <div key={q.id} className="flex items-start gap-2 border-2 border-ink/20 bg-cream2 p-3">
                  <Tag color={q.status === 'open' ? 'bg-gold text-ink' : 'bg-leaf text-white'}>
                    {t(q.status === 'open' ? 'OPEN' : 'SOLVED')}
                  </Tag>
                  <span className={`text-sm ${q.status === 'solved' ? 'line-through text-ink/40' : ''}`}>{q.content}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
