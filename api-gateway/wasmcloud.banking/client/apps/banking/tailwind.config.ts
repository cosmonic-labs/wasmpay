import type {Config} from 'tailwindcss';
import * as path from 'path';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    path.join(path.dirname(require.resolve('@repo/ui')), '**/*.{ts,tsx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        foreground: 'hsl(var(--ui-color-foreground))',
        background: 'hsl(var(--ui-color-background))',

        success: 'hsl(var(--ui-color-success))',
        danger: 'hsl(var(--ui-color-danger))',
        warning: 'hsl(var(--ui-color-warning))',
        info: 'hsl(var(--ui-color-info))',

        primary: {
          DEFAULT: 'hsl(var(--ui-color-primary))',
          foreground: 'hsl(var(--ui-color-primary-foreground))',
          contrast: 'hsl(var(--ui-color-primary-contrast))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--ui-color-secondary))',
          foreground: 'hsl(var(--ui-color-secondary-foreground))',
          contrast: 'hsl(var(--ui-color-secondary-contrast))',
        },
        accent: {
          DEFAULT: 'hsl(var(--ui-color-accent))',
          foreground: 'hsl(var(--ui-color-accent-foreground))',
          contrast: 'hsl(var(--ui-color-accent-contrast))',
        },

        surface: {
          DEFAULT: 'hsl(var(--ui-color-surface))',
          contrast: 'hsl(var(--ui-color-surface-contrast))',
        },

        border: {
          DEFAULT: 'hsl(var(--ui-color-border))',
          surface: 'hsl(var(--ui-color-border-surface))',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
