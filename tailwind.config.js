/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a1a',
        ink2: '#2d2d2d',
        cream: '#fef9ef',
        cream2: '#f5eddd',
        coral: '#ff4f3a',
        coralDark: '#e63622',
        ember: '#ff8a3d',
        gold: '#ffd23f',
        goldDark: '#f0b429',
        sky: '#3ec1ed',
        skyDark: '#1a9fd6',
        leaf: '#52b788',
        leafDark: '#2d9468',
        rose: '#ff5d8f',
        mist: '#c4c4c4',
      },
      borderWidth: {
        '2.5': '2.5px',
        '3': '3px',
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Inter"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '6px 6px 0 0 rgba(26,26,26,1)',
        panelSm: '3px 3px 0 0 rgba(26,26,26,1)',
        panelLg: '10px 10px 0 0 rgba(26,26,26,1)',
        glow: '0 0 24px rgba(255,79,58,0.4)',
        glowGold: '0 0 20px rgba(255,210,63,0.5)',
      },
      keyframes: {
        viewIn: {
          '0%': { transform: 'translateY(16px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        viewOut: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-12px) scale(0.98)', opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wobble: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        streakFlame: {
          '0%,100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.15) rotate(2deg)' },
        },
        barGrow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        confettiBurst: {
          '0%': { transform: 'translate(0,0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(var(--tx),var(--ty)) scale(0)', opacity: '0' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 12px rgba(255,79,58,0.3)' },
          '50%': { boxShadow: '0 0 28px rgba(255,79,58,0.6)' },
        },
      },
      animation: {
        viewIn: 'viewIn 0.3s ease-out forwards',
        viewOut: 'viewOut 0.18s ease-in forwards',
        pop: 'pop 0.3s ease-out',
        slideUp: 'slideUp 0.35s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
        fadeIn: 'fadeIn 0.4s ease-out',
        floatY: 'floatY 3s ease-in-out infinite',
        wobble: 'wobble 0.5s ease-in-out',
        checkPop: 'checkPop 0.35s ease-out',
        streakFlame: 'streakFlame 0.6s ease-in-out',
        barGrow: 'barGrow 0.5s ease-out',
        confettiBurst: 'confettiBurst 0.8s ease-out forwards',
        shake: 'shake 0.3s ease-in-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
