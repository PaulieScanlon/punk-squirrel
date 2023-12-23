export const appLinks = [
  {
    to: '/app',
    text: 'Dashboard',
  },
  {
    text: 'Repository',
    links: [
      {
        to: '/app/repository/issues',
        text: 'Issues',
      },
      {
        to: '/app/repository/commits',
        text: 'Commits',
      },
    ],
  },
  {
    text: 'User',
    links: [
      {
        to: '/app/user/events',
        text: 'Events',
      },
    ],
  },
];

export const accountLinks = [
  // {
  //   to: '/app/account',
  //   text: 'Account',
  // },
];
