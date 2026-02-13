import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Status colors (legacy, kept for backwards compatibility)
        solvent: '#10b981',
        deficit: '#ef4444',

        // Dark theme colors
        'deep-navy': '#0F172A',
        'darker-navy': '#111827',
        'dark-slate': '#1E293B',
        'darker-slate': '#1a2332',
        'border-slate': '#334155',
        'text-bright': '#F8FAFC',
        'text-muted': '#94A3B8',
        'text-dimmed': '#64748B',
      },
      fontSize: {
        'hero': '60px',
        'hero-sm': '56px',
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.5), inset 0 0 10px rgba(16, 185, 129, 0.1)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.1)',
        'glow-blue': '0 0 12px rgba(59, 130, 246, 0.4), inset 0 0 8px rgba(59, 130, 246, 0.1)',
        'glow-slate': '0 0 8px rgba(71, 85, 105, 0.4), inset 0 0 6px rgba(71, 85, 105, 0.1)',
      },
      animation: {
        'pulse-glow-green': 'pulse-glow-green 2.5s ease-in-out infinite',
        'pulse-glow-red': 'pulse-glow-red 2.5s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'glow-intensify': 'glow-intensify 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
