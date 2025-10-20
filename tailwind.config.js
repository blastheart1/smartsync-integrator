/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom font sizes (replace arbitrary values)
      fontSize: {
        'badge': '0.6875rem', // 11px - WCAG AA compliant minimum
        'micro': '0.625rem',   // 10px - Use sparingly
      },
      
      // Semantic colors for better maintainability
      colors: {
        // Brand colors
        brand: {
          primary: '#2563EB',     // blue-600
          'primary-hover': '#1D4ED8', // blue-700
          secondary: '#8B5CF6',   // purple-600
          'secondary-hover': '#7C3AED', // purple-700
          success: '#10B981',     // green-600
          'success-hover': '#059669', // green-700
          danger: '#EF4444',      // red-600
          'danger-hover': '#DC2626', // red-700
        },
        
        // Accessible grays (all pass WCAG AA)
        text: {
          primary: '#111827',    // gray-900
          secondary: '#374151',  // gray-700
          tertiary: '#4B5563',   // gray-600
          disabled: '#6B7280',   // gray-500 - use sparingly
        },
      },
      
      // Consistent spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}