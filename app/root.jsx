import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import stylesheet from './styles/tailwind.css';
import monaSans from './styles/mona-sans.css';

export const meta = () => [
  {
    charset: 'utf-8',
    title: 'Wayback',
    viewport: 'width=device-width,initial-scale=1',
  },
];

export const links = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: monaSans },
];

export default function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <main className='prose max-w-none w-full'>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </main>
      </body>
    </html>
  );
}
