import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Clock3, Flame, MapPin, Search, UserPlus, Users, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/utils/supabase';

interface SocialProfile {
  user_id: string;
  display_name: string;
  photo_url: string | null;
  city: string;
  streak_count: number;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

function fallbackProfile(userId: string): SocialProfile {
  return { user_id: userId, display_name: 'DaySona player', photo_url: null, city: '', streak_count: 0 };
}

function ProfileRow({ profile, children }: { profile: SocialProfile; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-2 border-ink bg-white p-3 shadow-panelSm sm:gap-4 sm:px-5">
      {profile.photo_url ? (
        <img src={profile.photo_url} alt="" className="h-12 w-12 shrink-0 border-2 border-ink object-cover sm:h-14 sm:w-14" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink bg-sky text-xl font-display text-white sm:h-14 sm:w-14">
          {profile.display_name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm uppercase sm:text-base">{profile.display_name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase text-ink/60 sm:text-xs">
          <span>🔥 {profile.streak_count}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={12} />{profile.city || '—'}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function FriendProfileCard({ profile, t }: { profile: SocialProfile; t: (text: string) => string }) {
  return (
    <article className="mission-checker-bg relative isolate flex min-h-[190px] overflow-hidden border-[3px] border-ink shadow-panel">
      <div className="absolute inset-y-0 right-0 w-[48%] bg-sky/20">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={`${profile.display_name} profile`} className="h-full w-full object-cover object-center" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky to-leaf font-display text-7xl text-white/90">
            {profile.display_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/55 to-transparent" />
      </div>
      <div className="relative z-10 flex w-[76%] flex-col justify-center gap-4 p-4 sm:p-6">
        <h3 className="break-words font-display text-3xl uppercase leading-[0.95] text-coral [text-shadow:2px_2px_0_#fff,4px_4px_0_#171717] sm:text-4xl md:text-5xl">
          {profile.display_name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] font-bold uppercase tracking-wide text-ink sm:text-xs">
          <span className="inline-flex items-center gap-1.5"><Flame size={16} className="text-ember" />{t('Streak')}: {profile.streak_count} {t(profile.streak_count === 1 ? 'day' : 'days')}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin size={15} />{profile.city || '—'}</span>
        </div>
      </div>
    </article>
  );
}

export function SocialLinksView() {
  const { session, t } = useApp();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SocialProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, SocialProfile>>({});
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadConnections = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) return;
    const { data: connectionRows, error: connectionError } = await supabase
      .from('friend_requests')
      .select('id, requester_id, receiver_id, status, created_at')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (connectionError) throw connectionError;
    const rows = (connectionRows ?? []) as FriendRequest[];
    setRequests(rows);
    const friendIds = [...new Set(rows.filter(row => row.status === 'accepted').map(row => row.requester_id === userId ? row.receiver_id : row.requester_id))];
    const requestIds = [...new Set(rows.filter(row => row.status === 'pending').map(row => row.requester_id === userId ? row.receiver_id : row.requester_id))];
    const profileIds = [...new Set([...friendIds, ...requestIds])];
    if (!profileIds.length) {
      setProfiles({});
      return;
    }
    const { data: profileRows, error: profileError } = await supabase
      .from('social_profiles')
      .select('user_id, display_name, photo_url, city, streak_count')
      .in('user_id', profileIds);
    if (profileError) throw profileError;
    setProfiles(Object.fromEntries(((profileRows ?? []) as SocialProfile[]).map(profile => [profile.user_id, profile])));
  }, [session?.user.id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loadConnections().catch(() => {
      if (active) setError('Could not load Social Links. Apply the latest Supabase schema and try again.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadConnections]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2 || !session?.user.id) {
      setResults([]);
      return;
    }
    let active = true;
    const timeout = window.setTimeout(async () => {
      const { data: found, error: searchError } = await supabase
        .from('social_profiles')
        .select('user_id, display_name, photo_url, city, streak_count')
        .ilike('display_name', `%${query.replace(/[%_,]/g, ' ')}%`)
        .neq('user_id', session.user.id)
        .order('display_name')
        .limit(12);
      if (!active) return;
      if (searchError) {
        setError('Could not search accounts. Apply the latest Supabase schema and try again.');
        setResults([]);
        return;
      }
      setResults((found ?? []) as SocialProfile[]);
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [term, session?.user.id]);

  const runAction = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError('');
    try {
      await action();
      await loadConnections();
    } catch {
      setError('That action could not be completed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const sendRequest = (friendId: string) => runAction(friendId, async () => {
    const { error: requestError } = await supabase.from('friend_requests').insert({
      requester_id: session!.user.id,
      receiver_id: friendId,
    });
    if (requestError) throw requestError;
  });

  const respond = (request: FriendRequest, accept: boolean) => runAction(request.id, async () => {
    const { error: responseError } = await supabase.from('friend_requests').update({
      status: accept ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
    }).eq('id', request.id).eq('status', 'pending');
    if (responseError) throw responseError;
  });

  const userId = session?.user.id;
  const friends = requests.filter(request => request.status === 'accepted').map(request => {
    const friendId = request.requester_id === userId ? request.receiver_id : request.requester_id;
    return profiles[friendId] ?? fallbackProfile(friendId);
  });
  const incoming = requests.filter(request => request.status === 'pending' && request.receiver_id === userId);
  const outgoing = requests.filter(request => request.status === 'pending' && request.requester_id === userId);

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-5 border-2 border-ink bg-sky p-5 text-white shadow-panel sm:p-6">
        <div className="flex items-center gap-3">
          <Users size={25} />
          <div>
            <h1 className="font-display text-xl uppercase tracking-wide sm:text-2xl">{t('SOCIAL LINKS')}</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/80">{t('Your friends, building their SONAs too.')}</p>
          </div>
        </div>
      </header>

      <div className="mb-6 border-2 border-ink bg-cream2 p-4 sm:p-5">
        <label htmlFor="social-search" className="mb-2 block font-display text-xs uppercase tracking-wide">{t('Find friends by account name')}</label>
        <div className="flex items-center gap-2 border-2 border-ink bg-white px-3">
          <Search size={17} className="shrink-0 text-ink/50" />
          <input id="social-search" value={term} onChange={event => setTerm(event.target.value)} maxLength={50} placeholder={t('Search account names…')} className="min-w-0 flex-1 bg-transparent py-3 font-body outline-none" />
        </div>
        {term.trim().length === 1 && <p className="mt-2 font-mono text-[10px] text-ink/55">{t('Type at least 2 characters.')}</p>}
        {term.trim().length >= 2 && (
          <div className="mt-3 space-y-2">
            {results.map(profile => {
              const relation = requests.find(request => (request.requester_id === userId && request.receiver_id === profile.user_id) || (request.requester_id === profile.user_id && request.receiver_id === userId));
              const incomingRequest = relation?.status === 'pending' && relation.receiver_id === userId;
              return (
                <ProfileRow key={profile.user_id} profile={profile}>
                  {relation?.status === 'accepted' ? <span className="font-display text-[10px] uppercase text-leafDark">{t('Friends')}</span> : relation?.status === 'pending' ? incomingRequest ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button type="button" disabled={busyId === relation.id} onClick={() => void respond(relation, true)} className="btn-press flex items-center gap-1 border-2 border-ink bg-leaf px-2 py-2 font-display text-[10px] uppercase text-white hover:bg-leafDark disabled:opacity-50"><Check size={14} />{t('Accept')}</button>
                      <button type="button" disabled={busyId === relation.id} onClick={() => void respond(relation, false)} aria-label={t('Decline request')} className="btn-press border-2 border-ink bg-white p-2 hover:bg-coral/20 disabled:opacity-50"><X size={14} /></button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-display text-[10px] uppercase text-ink/55"><Clock3 size={14} />{t('Pending')}</span>
                  ) : relation?.status === 'declined' ? (
                    <span className="font-display text-[10px] uppercase text-ink/45">{t('Request declined')}</span>
                  ) : (
                    <button type="button" disabled={busyId === profile.user_id} onClick={() => void sendRequest(profile.user_id)} className="btn-press flex shrink-0 items-center gap-1 border-2 border-ink bg-gold px-2.5 py-2 font-display text-[10px] uppercase hover:bg-goldDark disabled:opacity-50 sm:px-3"><UserPlus size={14} />{t('Add')}</button>
                  )}
                </ProfileRow>
              );
            })}
            {!loading && results.length === 0 && <p className="border border-dashed border-ink/30 px-3 py-4 text-center font-mono text-xs text-ink/55">{t('No accounts found.')}</p>}
          </div>
        )}
      </div>

      {error && <p role="alert" className="mb-5 border-2 border-coralDark bg-white px-3 py-2 font-mono text-xs text-coralDark">{t(error)}</p>}

      {incoming.length > 0 && <section className="mb-6">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide">{t('Friend requests')} <span className="text-ink/45">({incoming.length})</span></h2>
        <div className="space-y-2">{incoming.map(request => {
          const profile = profiles[request.requester_id] ?? fallbackProfile(request.requester_id);
          return <ProfileRow key={request.id} profile={profile}>
            <div className="flex shrink-0 gap-1.5">
              <button type="button" aria-label={t('Accept request')} disabled={busyId === request.id} onClick={() => void respond(request, true)} className="btn-press border-2 border-ink bg-leaf p-2 text-white hover:bg-leafDark disabled:opacity-50"><Check size={16} /></button>
              <button type="button" aria-label={t('Decline request')} disabled={busyId === request.id} onClick={() => void respond(request, false)} className="btn-press border-2 border-ink bg-white p-2 hover:bg-coral/20 disabled:opacity-50"><X size={16} /></button>
            </div>
          </ProfileRow>;
        })}</div>
      </section>}

      {outgoing.length > 0 && <section className="mb-6">
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide">{t('Sent requests')}</h2>
        <div className="space-y-2">{outgoing.map(request => <ProfileRow key={request.id} profile={profiles[request.receiver_id] ?? fallbackProfile(request.receiver_id)}><span className="inline-flex items-center gap-1 font-display text-[10px] uppercase text-ink/55"><Clock3 size={14} />{t('Pending')}</span></ProfileRow>)}</div>
      </section>}

      <section>
        <h2 className="mb-3 font-display text-sm uppercase tracking-wide">{t('Your friends')} <span className="text-ink/45">({friends.length})</span></h2>
        {loading ? <p className="border-2 border-ink bg-white px-4 py-5 text-center font-mono text-xs text-ink/55">{t('Loading…')}</p> : friends.length ? (
          <div className="space-y-4">{friends.map(profile => <FriendProfileCard key={profile.user_id} profile={profile} t={t} />)}</div>
        ) : (
          <div className="border-2 border-dashed border-ink/35 bg-white/70 px-5 py-8 text-center">
            <Users size={25} className="mx-auto mb-2 text-ink/35" />
            <p className="font-display text-sm uppercase">{t('No friends yet.')}</p>
            <p className="mt-1 font-mono text-xs text-ink/55">{t('Search for your friends above to connect.')}</p>
          </div>
        )}
      </section>
    </section>
  );
}
