import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Typography classes from VOYAGER_BASE_THEME
    'text-7xl',
    'text-sm',
    'text-base',
    'font-lexend',
    'font-bold',
    'tracking-wider',
    // Component classes
    'bg-black',
    'bg-gray-100',
    'bg-gray-400',
    'text-white',
    'text-black',
    'hover:bg-gray-800',
    'hover:scale-105',
    'rounded-full',
    'border-gray-200',
    'focus:border-black',
    'border-r',
    'border-gray-100',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        careersy: {
          cream: '#fff9f2',
          yellow: '#fad02c',
          black: '#000000',
        },
      },
      fontFamily: {
        'lexend': ['Lexend Deca', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
