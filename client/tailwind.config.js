/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155'
        },
        brand: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#3B82F6',
          cyan: '#06B6D4',
          'cyan-hover': '#0891B2',
          'cyan-light': '#22D3EE'
        },
        surface: {
          light: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          'dark-card': '#111827',
          'dark-border': '#1F2937'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    }
  },
  plugins: []
};
