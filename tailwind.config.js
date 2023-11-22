export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          text: '#f0f6fc',
          background: '#010409',
          green: '#238636',
          blue: '#2f81f7',
          purple: '#8957e5',
          red: '#f85149',
          'light-gray': '#c9d1d9',
          'dark-gray': '#7d8590',
          border: '#21262d',
          'surface-0': '#0d1117',
          'surface-1': '#161b22',
        },
      },
      maxWidth: {
        '8xl': '90rem',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '*': {
              color: theme('colors.brand.text'),
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 700,
            },
            pre: {
              color: `${theme('colors.brand.text')}!important`,
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
