import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        paper: '#ffffff',
        muted: '#6b6b6b',
        line: '#e6e6e6',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
