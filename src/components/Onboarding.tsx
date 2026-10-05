import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/utils/supabase';
import { Tag } from '@/components/Panel';

type AuthMode = 'signup' | 'login';

export function Onboarding({ authenticated }: { authenticated: boolean }) {
  const { setProfile } = useApp();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [step, setStep] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const handleStart = () => {
    setProfile(name.trim() || 'Player', location.trim() || 'Tokyo');
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthBusy(true);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthMode('login');
          setAuthNotice('Account created. Check your email to confirm it, then sign in.');
        } else {
          setAuthNotice('Account created. Let’s set up your profile.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not authenticate. Please try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError('');
    setAuthNotice('');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-yellow-300 p-4 md:p-8">
      <div className="onboarding-checker pointer-events-none absolute -right-16 top-8 h-64 w-64 opacity-25 md:right-12 md:top-12 md:h-80 md:w-80" />
      <div className="onboarding-checker pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 -rotate-12 opacity-15" />

      <div className="relative grid w-full max-w-5xl items-center gap-7 lg:grid-cols-[1.05fr_.95fr]">
        <section className="manga-panel mission-checker-bg animate-slideUp border-3 border-ink bg-white p-6 shadow-panelLg md:p-9">
          <div className="relative z-[1]">
            <div className="flex items-center gap-4">
              <img src="/daysona-logo.png" alt="DaySona logo" className="h-20 w-20 shrink-0 border-2 border-ink object-cover shadow-panelSm md:h-24 md:w-24" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.25em] text-ink/55">Every day is a new round</p>
                <h1 className="mt-1 font-display text-3xl leading-none tracking-tight md:text-5xl">DAYSONA</h1>
                <p className="mt-2 font-display text-xs uppercase tracking-[.14em] text-leafDark">Small steps. Bigger days.</p>
              </div>
            </div>
            <div className="mt-10 max-w-lg">
              <Tag color="bg-gold text-ink">YOUR NEXT ROUND STARTS HERE</Tag>
              <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">Make progress feel like play.</h2>
              <p className="mt-4 max-w-md border-l-4 border-leaf pl-4 font-body text-sm leading-relaxed text-ink/70 md:text-base">
                Keep your daily missions, questions, thoughts, and bigger goals together. Your progress follows your account across devices.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 border-t-2 border-ink/20 pt-5">
              {['DAILY MISSIONS', 'STREAKS', 'ACHIEVEMENTS'].map(label => (
                <span key={label} className="border-2 border-ink bg-gold/80 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wide shadow-panelSm">{label}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="animate-pop manga-panel border-3 border-ink bg-cream p-6 shadow-panelLg md:p-8">
          <div className="mb-5 flex items-center justify-between gap-2">
            <Tag color={authenticated ? 'bg-leaf text-white' : 'bg-ink text-gold'}>{authenticated ? 'PROFILE SETUP' : 'PLAYER ACCESS'}</Tag>
            {!authenticated && <span className="font-mono text-[9px] uppercase tracking-wider text-ink/45">Secure account</span>}
          </div>
          {!authenticated ? (
            <>
              <div className="mb-5 grid grid-cols-2 border-2 border-ink p-1">
                <button type="button" onClick={() => switchAuthMode('signup')} className={`py-2 font-display text-xs uppercase tracking-wide ${authMode === 'signup' ? 'bg-gold text-ink shadow-panelSm' : 'text-ink/55 hover:text-ink'}`}>
                  Create account
                </button>
                <button type="button" onClick={() => switchAuthMode('login')} className={`py-2 font-display text-xs uppercase tracking-wide ${authMode === 'login' ? 'bg-gold text-ink shadow-panelSm' : 'text-ink/55 hover:text-ink'}`}>
                  Sign in
                </button>
              </div>

              <form onSubmit={handleAuth}>
                <h2 className="mb-4 font-display text-xl uppercase">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
                <div className="mb-4">
                  <label htmlFor="auth-email" className="mb-2 block font-display text-sm uppercase tracking-wide">Email</label>
                  <input id="auth-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className="w-full border-2 border-ink bg-white px-4 py-3 font-body text-base transition-all focus:border-leaf focus:shadow-panelSm focus:outline-none" />
                </div>
                <div className="mb-4">
                  <label htmlFor="auth-password" className="mb-2 block font-display text-sm uppercase tracking-wide">Password</label>
                  <input id="auth-password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required className="w-full border-2 border-ink bg-white px-4 py-3 font-body text-base transition-all focus:border-leaf focus:shadow-panelSm focus:outline-none" />
                </div>
                {authError && <p role="alert" className="mb-3 border-2 border-coral bg-coral/10 p-2 font-mono text-xs text-coralDark">{authError}</p>}
                {authNotice && <p role="status" className="mb-3 border-2 border-leaf bg-leaf/10 p-2 font-mono text-xs text-ink">{authNotice}</p>}
                <button type="submit" disabled={authBusy} className="btn-press flex w-full items-center justify-center gap-2 border-2 border-ink bg-gold py-3 font-display text-sm uppercase tracking-wider text-ink hover:bg-goldDark disabled:cursor-wait disabled:opacity-60">
                  {authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}
                  {!authBusy && <ArrowRight size={16} strokeWidth={3} />}
                </button>
              </form>
            </>
          ) : step === 0 ? (
            <>
              <div className="mb-5">
                <label htmlFor="profile-name" className="mb-2 block font-display text-sm uppercase tracking-wide">What should we call you?</label>
                <input id="profile-name" type="text" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => event.key === 'Enter' && (name.trim() ? setStep(1) : null)} placeholder="Your name or nickname" className="w-full border-2 border-ink bg-white px-4 py-3 font-body text-base transition-all focus:border-leaf focus:shadow-panelSm focus:outline-none" autoFocus />
              </div>
              <button onClick={() => setStep(1)} disabled={!name.trim()} className="btn-press flex w-full items-center justify-center gap-2 border-2 border-ink bg-gold py-3 font-display text-sm uppercase tracking-wider text-ink hover:bg-goldDark disabled:opacity-40">
                Continue <ArrowRight size={16} strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <div className="mb-5">
                <label htmlFor="profile-location" className="mb-2 block font-display text-sm uppercase tracking-wide">Where are you? (for weather)</label>
                <input id="profile-location" type="text" value={location} onChange={event => setLocation(event.target.value)} onKeyDown={event => event.key === 'Enter' && handleStart()} placeholder="City name, e.g. Tokyo, Madrid, New York" className="w-full border-2 border-ink bg-white px-4 py-3 font-body text-base transition-all focus:border-leaf focus:shadow-panelSm focus:outline-none" autoFocus />
                <p className="mt-2 text-xs text-ink/50">We’ll fetch local weather. You can skip this and change it later.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="btn-press border-2 border-ink bg-cream2 px-4 py-3 font-display text-xs uppercase tracking-wider hover:bg-mist/30">Back</button>
                <button onClick={handleStart} className="btn-press flex flex-1 items-center justify-center gap-2 border-2 border-ink bg-leaf py-3 font-display text-sm uppercase tracking-wider text-white hover:bg-leafDark">
                  Start Playing <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </>
          )}
        </div>

        <p className="font-mono text-[10px] uppercase tracking-wider text-ink/60 lg:col-start-2">
          {authenticated ? 'Your profile and progress sync with your account.' : 'Sign in on another device to pick up where you left off.'}
        </p>
      </div>
    </div>
  );
}
