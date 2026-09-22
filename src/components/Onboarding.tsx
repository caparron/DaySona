import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Onboarding() {
  const { setProfile } = useApp();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [step, setStep] = useState(0);

  const handleStart = () => {
    setProfile(name.trim() || 'Player', location.trim() || 'Tokyo');
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-coral skew-tag" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gold rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-sky skew-tag" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slideUp">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="bg-coral border-3 border-cream w-14 h-14 flex items-center justify-center skew-tag shadow-glow">
              <span className="font-display text-3xl text-white" style={{ transform: 'skewX(8deg)' }}>D</span>
            </div>
            <h1 className="font-display text-4xl text-cream tracking-tight">DAYFRAME</h1>
          </div>
          <p className="text-mist font-mono text-xs uppercase tracking-[0.3em]">Every day is a new round</p>
        </div>

        <div className="bg-cream border-3 border-cream/20 shadow-panelLg p-6 animate-pop">
          {step === 0 ? (
            <>
              <div className="mb-5">
                <label className="block font-display text-sm uppercase tracking-wide mb-2">What should we call you?</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (name.trim() ? setStep(1) : null)}
                  placeholder="Your name or nickname"
                  className="w-full border-2 border-ink bg-cream2 px-4 py-3 font-body text-base focus:outline-none focus:border-coral focus:shadow-panelSm transition-all"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!name.trim()}
                className="w-full btn-press border-2 border-ink bg-coral text-white py-3 font-display text-sm uppercase tracking-wider disabled:opacity-40 hover:bg-coralDark flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <div className="mb-5">
                <label className="block font-display text-sm uppercase tracking-wide mb-2">Where are you? (for weather)</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder="City name, e.g. Tokyo, Madrid, New York"
                  className="w-full border-2 border-ink bg-cream2 px-4 py-3 font-body text-base focus:outline-none focus:border-sky focus:shadow-panelSm transition-all"
                  autoFocus
                />
                <p className="text-xs text-ink/50 mt-2">We'll fetch local weather. You can skip this and change it later.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(0)}
                  className="btn-press border-2 border-ink bg-cream2 px-4 py-3 font-display text-xs uppercase tracking-wider hover:bg-mist/30"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 btn-press border-2 border-ink bg-leaf text-white py-3 font-display text-sm uppercase tracking-wider hover:bg-leafDark flex items-center justify-center gap-2"
                >
                  Start Playing <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-mist/50 text-xs font-mono mt-4">No account needed. Your data stays in your browser.</p>
      </div>
    </div>
  );
}
