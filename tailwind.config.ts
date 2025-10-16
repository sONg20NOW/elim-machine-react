import tailwindcssLogical from 'tailwindcss-logical'
import type { Config } from 'tailwindcss'

import tailwindPlugin from './src/@core/tailwind/plugin'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [tailwindcssLogical, tailwindPlugin, require('tailwindcss-animate')],
  theme: {
    extend: {
      keyframes: {
        ring: {
          '0%, 20%, 40%': { transform: 'rotate(-10deg)' },
          '10%, 30%, 50%': { transform: 'rotate(10deg)' },
          '60%, 100%': { transform: 'rotate(0deg)' } // 나머지 70%는 “휴식 구간”
        },
        vibrate: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(-1px, -1px)' },
          '60%': { transform: 'translate(2px, 1px)' },
          '80%': { transform: 'translate(1px, -2px)' }
        },
        slideRight: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(100%, 0)' }
        },
        slideLeft: {
          '100%': { transform: 'translate(0, 0)' },
          '0%': { transform: 'translate(100%, 0)' }
        }
      },
      animation: {
        ring: 'ring 1s ease-in-out infinite',
        vibrate: 'vibrate 0.1s linear infinite',
        slideRight: 'slideRight 0.2s ease-in-out forwards',
        slideLeft: 'slideLeft 0.2s ease-in-out forwards'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        color: {
          text: {
            DEFAULT: '#000',
            light: '#474747'
          },
          primary: {
            DEFAULT: '#7367F0',
            light: '#8F85F3',
            dark: '#675DD8'
          },
          warning: {
            DEFAULT: 'rgba(255, 88, 88, 1)',
            light: 'rgba(255, 145, 145, 1)',
            dark: 'rgba(209, 61, 61, 1)'
          },
          info: {
            DEFAULT: '#2583ffdd',
            light: '#5da3ffdd',
            dark: '#1d6ed8dd'
          },
          border: {
            DEFAULT: '#d1d0d4'
          },
          background: {
            header: '#f1f1f1ff'
          }
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      }
    }
  }
}

export default config
