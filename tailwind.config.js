export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          text: '#f0f6fc',
          background: '#010409',
          green: '#3fb950',
          blue: '#2f81f7',
          purple: '#6e40c9',
          mauve: '#7c72ff',
          pink: '#f778ba',
          teal: '#33b3ae',
          red: '#f85149',
          yellow: '#ffd33d',
          'light-gray': '#c9d1d9',
          'mid-gray': '#7d8590',
          'dark-gray': '#30363d',
          'guide-gray': '#353c44',
          border: '#21262d',
          'surface-0': '#0d1117',
          'surface-1': '#161b22',
          'surface-2': '#292f36',
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
            '*:not(strong)': {
              fontWeight: 300,
            },
            label: {
              '& :first-child': {
                display: 'block',
              },
              color: theme('colors.brand.mid-gray'),
              fontSize: '0.75rem',
            },
            'input, textarea, select': {
              padding: '0.3rem',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: theme('colors.brand.border'),
              background: theme('colors.brand.background'),
              minWidth: '140px',
              minHeight: '34px',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 700,
            },
            strong: {
              fontWeight: 600,
            },
            hr: {
              margin: '1rem 0 1rem 0',
              borderColor: theme('colors.brand.border'),
            },
            pre: {
              color: `${theme('colors.brand.text')}!important`,
            },
            code: {
              color: `${theme('colors.brand.mid-gray')}!important`,
              '&::before': {
                content: '"" !important',
              },
              '&::after': {
                content: '"" !important',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
