import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary Tones (Backgrounds & Deep Brand Identity)
          navy: '#0B132B',       // Deep Navy Blue - Global backgrounds, hero sections, footer
          sapphire: '#1C2541',   // Dark Sapphire - Card backgrounds, navbar, alternating sections

          // Accent Tones (Elite Branding & Call-to-Actions)
          gold: '#D4AF37',       // Metallic Gold - Primary accent, buttons, active states
          champagne: '#F3E5AB',  // Warm Champagne - Sub-headings, badges, secondary accents

          // Neutral Typography Tones
          white: '#FFFFFF',      // Crisp White - Main titles, primary text
          silver: '#E0E1DD',     // Ice Silver - Body paragraphs, labels, secondary text
        },
        // Shadcn UI system colors mapped to brand
        background: '#0B132B',
        foreground: '#FFFFFF',
        card: {
          DEFAULT: '#1C2541',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#1C2541',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#0B132B',
        },
        secondary: {
          DEFAULT: '#1C2541',
          foreground: '#E0E1DD',
        },
        muted: {
          DEFAULT: '#1C2541',
          foreground: '#E0E1DD',
        },
        accent: {
          DEFAULT: '#D4AF37',
          foreground: '#0B132B',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#FFFFFF',
        },
        border: '#2A3560',
        input: '#2A3560',
        ring: '#D4AF37',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #D4AF37 100%)',
        'navy-gradient': 'linear-gradient(180deg, #0B132B 0%, #1C2541 100%)',
        'sapphire-gradient': 'linear-gradient(135deg, #1C2541 0%, #0B132B 100%)',
      },
    },
  },
  plugins: [],
}

export default config
