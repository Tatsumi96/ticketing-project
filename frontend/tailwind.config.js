export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        cream: '#F5F5F0',
        ink: '#0A0A0A',
        border: '#E8E8E2',
        muted: '#888888',
      },
      borderRadius: { xl2: '16px' },
    },
  },
  plugins: [],
}
