import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F9F6',
        ink: '#1A1A1A',
        muted: '#6B6B6B',
        line: '#E2E3DE',
        subtle: '#EFF0EC',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        wider2: '0.16em',
        wider3: '0.22em',
      },
      maxWidth: {
        prose2: '62ch',
      },
    },
  },
  plugins: [],
};

export default config;
