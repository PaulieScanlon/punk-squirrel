import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import stylesheet from './tailwind.css';

import plusJakartaSans200 from '@fontsource/plus-jakarta-sans/200.css';
import plusJakartaSans300 from '@fontsource/plus-jakarta-sans/300.css';
import plusJakartaSans400 from '@fontsource/plus-jakarta-sans/400.css';
import plusJakartaSans500 from '@fontsource/plus-jakarta-sans/500.css';
import plusJakartaSans600 from '@fontsource/plus-jakarta-sans/600.css';
import plusJakartaSans700 from '@fontsource/plus-jakarta-sans/700.css';
import plusJakartaSans800 from '@fontsource/plus-jakarta-sans/800.css';

export const meta = () => [
  {
    charset: 'utf-8',
    title: 'Wayback',
    viewport: 'width=device-width,initial-scale=1',
  },
];

export const links = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: plusJakartaSans200 },
  { rel: 'stylesheet', href: plusJakartaSans300 },
  { rel: 'stylesheet', href: plusJakartaSans400 },
  { rel: 'stylesheet', href: plusJakartaSans500 },
  { rel: 'stylesheet', href: plusJakartaSans600 },
  { rel: 'stylesheet', href: plusJakartaSans700 },
  { rel: 'stylesheet', href: plusJakartaSans800 },
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
