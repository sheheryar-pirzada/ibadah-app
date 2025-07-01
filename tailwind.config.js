/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ─── Emerald & Antique Gold (Light theme) ────────────────────────
        'emerald-primary':   '#046307', // Deep Emerald
        'emerald-accent':    '#CFAF58', // Antique Gold
        'emerald-secondary': '#F5F2E8', // Soft Cream
        'emerald-text':      '#333333', // Charcoal
        'emerald-hover':     '#024F02', // Forest Green

        // ─── Jade & Metallic Gold (Alt / Dark theme) ────────────────────
        'jade-primary':   '#00A86B', // Jade Green
        'jade-accent':    '#D4AF37', // Metallic Gold
        'jade-surface':   '#FFFFFF', // Pure White
        'jade-text':      '#2F4F4F', // Dark Slate Gray
        'jade-divider':   '#E0E0E0', // Light Gray

        // ─── Sage & Warm Gold (Neutral theme) ───────────────────────────
        'sage-primary':   '#9CAF88', // Sage Green
        'sage-accent':    '#E1B000', // Warm Gold
        'sage-secondary':'#FFF8E1', // Ivory
        'sage-text':      '#1A1A2E', // Midnight
        'sage-shadow':    '#B2A29F', // Taupe Gray
      },
      fontFamily: {
        sans: ['Tajawal-Regular'],
      },
    },
  },
  plugins: [],
}
