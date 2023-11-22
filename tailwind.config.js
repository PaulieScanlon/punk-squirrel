export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#ff5ca3',
          secondary: '#40c4ff',
          tertiary: '#36e5d0',
          'gray-1': '#dedede',
          'gray-2': '#999999',
          'gray-3': '#3c4043',
          'gray-4': '#212121',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '*': {
              color: theme('colors.brand.gray-4'),
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Mona Sans',
              fontWeight: 800,
            },
            pre: {
              color: `${theme('colors.white')}!important`,
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
