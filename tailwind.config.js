/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Breakpoints mobile-first
      screens: {
        'xs': '375px',   // iPhone SE
        'sm': '640px',   // Tablets pequeñas
        'md': '768px',   // Tablets
        'lg': '1024px',  // Desktop pequeño
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Desktop grande
      },

      // Colores del sistema de juego
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        game: {
          hp: '#ef4444',        // Rojo para HP
          xp: '#10b981',        // Verde para XP
          energy: '#f59e0b',    // Amarillo para energía
          mana: '#8b5cf6',      // Púrpura para maná
          damage: '#dc2626',    // Rojo oscuro para daño
          heal: '#059669',      // Verde oscuro para curación
        },
        card: {
          common: '#6b7280',    // Gris para cartas comunes
          rare: '#3b82f6',      // Azul para cartas raras
          epic: '#8b5cf6',      // Púrpura para cartas épicas
          legendary: '#f59e0b', // Dorado para cartas legendarias
        },
        background: {
          primary: '#f8fafc',   // Fondo principal
          secondary: '#e2e8f0', // Fondo secundario
          card: '#ffffff',      // Fondo de cartas
          overlay: 'rgba(0, 0, 0, 0.5)', // Overlay para modales
        },
        // Mindcraft Colors
        mindcraft: {
          indigo: '#6366f1',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          pink: '#ec4899',
          slate: '#64748b',
        },
      },

      // Tipografía optimizada para niños
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        game: ['Comic Neue', 'Fredoka One', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Tamaños de fuente mobile-first
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },

      // Espaciado específico para touch targets
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        'touch': '2.75rem', // 44px - mínimo para touch targets
      },

      // Animaciones para feedback
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'shimmer': 'shimmer 2s infinite',
        // Mindcraft Animations
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'float': 'float 20s ease-in-out infinite',
      },

      // Keyframes personalizados
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Mindcraft Keyframes
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(20px, -20px) rotate(5deg)' },
          '66%': { transform: 'translate(-20px, 10px) rotate(-5deg)' },
        },
      },

      // Sombras para depth
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'button-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },

      // Border radius para consistencia
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'modal': '16px',
      },

      // Transiciones estándar
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },

      // Z-index layers
      zIndex: {
        'modal': '50',
        'overlay': '40',
        'dropdown': '30',
        'header': '20',
        'nav': '10',
      },

      backdropBlur: {
        'xl': '20px',
      },
    },
  },
  plugins: [
    // Plugin para touch targets
    function({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.no-tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      });
    },
  ],
}; 