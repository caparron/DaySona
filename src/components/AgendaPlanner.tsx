import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarClock, Clock3, Plus, Repeat2, Target, Trash2, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Panel } from '@/components/Panel';
import { AgendaItem, AgendaItemKind } from '@/types';
import { parseKey, weekdayShort } from '@/utils/date';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

function itemOccursOn(item: AgendaItem, date: string): boolean {
  if (!item.repeatsWeekly) return item.date === date;
  return item.weekdays.includes(parseKey(date).getDay());
}

export function AgendaPlanner({ selectedDate }: { selectedDate: string }) {
  const { data, language, t, addAgendaItem, deleteAgendaItem } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [kind, setKind] = useState<AgendaItemKind>('event');
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [weekdays, setWeekdays] = useState<number[]>([parseKey(selectedDate).getDay()]);
  const [goalId, setGoalId] = useState('');
  const [notify, setNotify] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => setDate(selectedDate), [selectedDate]);

  const entries = useMemo(
    () => data.agendaItems.filter(item => itemOccursOn(item, selectedDate)).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data.agendaItems, selectedDate],
  );
  const selectedGoal = data.longTerm.find(goal => goal.id === goalId);
  const canSubmit = (kind === 'goal' ? !!selectedGoal : !!title.trim()) && !!date && !!startTime && (!repeatWeekly || weekdays.length > 0);

  const toggleWeekday = (day: number) => {
    setWeekdays(current => current.includes(day) ? current.filter(value => value !== day) : [...current, day]);
  };

  const submit = async () => {
    if (!canSubmit) return;
    let notifyOnThisDevice = kind === 'reminder' && notify;
    let nextNotice = '';
    if (notifyOnThisDevice) {
      if (!('Notification' in window)) {
        notifyOnThisDevice = false;
        nextNotice = t('Browser notifications are not supported here. The reminder will still appear in the agenda.');
      } else if (Notification.permission !== 'granted') {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            notifyOnThisDevice = false;
            nextNotice = t('Notifications are blocked. The reminder will still appear in the agenda.');
          }
        } catch {
          notifyOnThisDevice = false;
          nextNotice = t('Notifications are blocked. The reminder will still appear in the agenda.');
        }
      }
    }

    addAgendaItem({
      title: kind === 'goal' ? selectedGoal?.title || '' : title.trim(),
      kind,
      date,
      startTime,
      endTime: endTime || undefined,
      repeatsWeekly: repeatWeekly,
      weekdays: repeatWeekly ? weekdays : [],
      longTermGoalId: kind === 'goal' ? goalId : undefined,
      notify: notifyOnThisDevice,
    });
    setTitle('');
    setKind('event');
    setNotify(false);
    setNotice(nextNotice);
    setFormOpen(false);
  };

  return (
    <Panel bg="bg-cream" className="mb-5 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-3 text-cream">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarClock size={18} strokeWidth={2.5} className="shrink-0 text-gold" />
          <div>
            <h3 className="font-display text-sm uppercase leading-none">{t('Agenda')}</h3>
            <p className="mt-1 truncate font-mono text-[10px] text-cream/60">{t('Plan your day and repeat your weekly routine')}</p>
          </div>
        </div>
        <button type="button" onClick={() => { const opening = !formOpen; setDate(selectedDate); if (opening) setWeekdays([parseKey(selectedDate).getDay()]); setFormOpen(opening); setNotice(''); }} className="btn-press flex shrink-0 items-center gap-1 border-2 border-ink bg-gold px-2.5 py-1.5 font-display text-[10px] uppercase text-ink hover:bg-yellow-200">
          {formOpen ? <X size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />} {t(formOpen ? 'Close' : 'Add to agenda')}
        </button>
      </div>

      {formOpen && (
        <div className="space-y-3 border-b-2 border-ink/20 bg-cream2 p-4">
          <div className="grid grid-cols-3 gap-1.5">
            {(['event', 'reminder', 'goal'] as const).map(option => (
              <button key={option} type="button" onClick={() => setKind(option)} aria-pressed={kind === option} className={`min-h-10 border-2 border-ink px-1 py-1 font-display text-[9px] leading-tight uppercase transition-colors ${kind === option ? 'bg-ink text-cream' : 'bg-white text-ink hover:bg-gold/30'}`}>
                {t(option === 'event' ? 'Event' : option === 'reminder' ? 'Reminder' : 'Long-term goal')}
              </button>
            ))}
          </div>

          {kind === 'goal' ? (
            <select value={goalId} onChange={event => setGoalId(event.target.value)} className="w-full border-2 border-ink bg-white px-3 py-2 font-body text-sm">
              <option value="">{t('Choose a long-term goal')}</option>
              {data.longTerm.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
          ) : (
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder={t(kind === 'reminder' ? 'What should you remember?' : 'What are you doing?')} className="w-full border-2 border-ink bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-leaf" />
          )}

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 font-mono text-[10px] uppercase text-ink/60">
              {t('Starts')}
              <input type="time" value={startTime} onChange={event => setStartTime(event.target.value)} className="border-2 border-ink bg-white px-2 py-1.5 font-mono text-xs text-ink" />
            </label>
            <label className="flex flex-col gap-1 font-mono text-[10px] uppercase text-ink/60">
              {t('Ends (optional)')}
              <input type="time" value={endTime} onChange={event => setEndTime(event.target.value)} className="border-2 border-ink bg-white px-2 py-1.5 font-mono text-xs text-ink" />
            </label>
            <button type="button" onClick={() => setRepeatWeekly(value => !value)} aria-pressed={repeatWeekly} className={`ml-auto flex items-center gap-1.5 border-2 border-ink px-2.5 py-2 font-display text-[10px] uppercase ${repeatWeekly ? 'bg-leaf text-white' : 'bg-white text-ink'}`}>
              <Repeat2 size={14} /> {t(repeatWeekly ? 'Repeats weekly' : 'One time')}
            </button>
          </div>

          {repeatWeekly && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase text-ink/60">{t('Repeat on')}</p>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map(day => {
                  const active = weekdays.includes(day);
                  return <button key={day} type="button" onClick={() => toggleWeekday(day)} aria-pressed={active} className={`h-9 min-w-10 border-2 border-ink px-2 font-display text-[10px] uppercase ${active ? 'bg-leaf text-white' : 'bg-white text-ink'}`}>{weekdayShort(parseKey(`2024-01-${String(day + 7).padStart(2, '0')}`), language)}</button>;
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            {!repeatWeekly ? <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-ink/70">
              <CalendarClock size={14} /> {t('Date')}
              <input type="date" value={date} onChange={event => setDate(event.target.value)} className="border-2 border-ink bg-white px-2 py-1 font-mono text-xs text-ink" />
            </label> : <p className="font-mono text-[10px] uppercase text-leafDark">{t('Repeats on the selected weekdays every week')}</p>}
            <div className="flex items-center gap-2">
              {kind === 'reminder' && <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-ink/70"><input type="checkbox" checked={notify} onChange={event => setNotify(event.target.checked)} /><Bell size={13} /> {t('Notify me')}</label>}
              <button type="button" onClick={() => setFormOpen(false)} className="border-2 border-ink bg-white px-3 py-1.5 font-display text-[10px] uppercase">{t('Cancel')}</button>
              <button type="button" onClick={() => void submit()} disabled={!canSubmit} className="btn-press border-2 border-ink bg-leaf px-3 py-1.5 font-display text-[10px] uppercase text-white disabled:opacity-40">{t('Save')}</button>
            </div>
          </div>
          {notice && <p role="status" className="border-l-2 border-gold bg-white px-2 py-1.5 font-mono text-[10px] text-ink/70">{notice}</p>}
        </div>
      )}

      <div className="space-y-2 bg-cream2/50 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">{t('Schedule for')} · {weekdayShort(parseKey(selectedDate), language)}</p>
          <span className="border border-ink/20 bg-white px-2 py-0.5 font-mono text-[9px] uppercase text-ink/55">{entries.length} {t('planned')}</span>
        </div>
        {entries.length === 0 ? <button type="button" onClick={() => { setDate(selectedDate); setWeekdays([parseKey(selectedDate).getDay()]); setFormOpen(true); }} className="group flex w-full items-center gap-3 border-2 border-dashed border-ink/20 bg-white/70 px-3 py-4 text-left transition hover:border-gold hover:bg-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink bg-gold text-ink"><Plus size={16} strokeWidth={3} /></span>
          <span><span className="block font-display text-xs uppercase text-ink">{t('Nothing planned for this day yet.')}</span><span className="mt-1 block font-mono text-[10px] text-ink/50">{t('Add an event or set up a weekly routine.')}</span></span>
        </button> : entries.map(item => {
          const goal = item.longTermGoalId ? data.longTerm.find(candidate => candidate.id === item.longTermGoalId) : undefined;
          const label = item.kind === 'goal' ? t('Long-term goal') : item.kind === 'reminder' ? t('Reminder') : t('Event');
          const accent = item.kind === 'reminder' ? 'border-coral bg-coral/10' : item.kind === 'goal' ? 'border-leaf bg-leaf/10' : 'border-gold bg-gold/15';
          return (
            <div key={item.id} className="group relative flex items-stretch overflow-hidden border-2 border-ink bg-white shadow-[3px_3px_0_#171717] transition-transform hover:-translate-y-0.5">
              <div className={`flex w-[76px] shrink-0 flex-col items-center justify-center border-r-2 border-ink py-2 ${accent}`}>
                <Clock3 size={13} className="mb-1 text-ink/55" />
                <span className="font-display text-sm tabular-nums">{item.startTime}</span>
                {item.endTime && <span className="font-mono text-[9px] text-ink/55">– {item.endTime}</span>}
              </div>
              <div className="min-w-0 flex-1 px-3 py-2.5">
                <div className="truncate font-display text-sm uppercase">{goal?.title || item.title}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase text-ink/55">
                  <span className={`border border-ink/15 px-1.5 py-0.5 ${accent}`}>{label}</span>
                  {item.repeatsWeekly && <span className="inline-flex items-center gap-1 text-leafDark"><Repeat2 size={10} /> {t('Weekly')}</span>}
                  {item.notify && <span className="inline-flex items-center gap-1 text-coralDark"><Bell size={10} /> {t('Notification')}</span>}
                </div>
              </div>
              {item.kind === 'goal' && <Target size={15} className="my-auto shrink-0 text-leaf" />}
              <button type="button" onClick={() => deleteAgendaItem(item.id)} aria-label={`${t('Delete agenda item')}: ${goal?.title || item.title}`} className="m-1.5 grid h-8 w-8 shrink-0 place-items-center border border-transparent text-ink/45 transition hover:border-ink hover:bg-coral/20 hover:text-coralDark"><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
