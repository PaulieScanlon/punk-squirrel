import { useState, useEffect } from 'react';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from '@remix-run/react';
import { json } from '@remix-run/node';

import { createServerClient, parse, serialize, createBrowserClient } from '@supabase/ssr';

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
    title: 'TBD',
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

export const loader = async ({ request }) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_AUTH_REDIRECT: process.env.SUPABASE_AUTH_REDIRECT,
    GITHUB_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  };

  const cookies = parse(request.headers.get('Cookie') ?? '');
  const headers = new Headers();

  const supabaseClient = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: {
      get(key) {
        return cookies[key];
      },
      set(key, value, options) {
        headers.append('Set-Cookie', serialize(key, value, options));
      },
      remove(key, options) {
        headers.append('Set-Cookie', serialize(key, '', options));
      },
    },
  });

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  return json(
    {
      env,
      session,
    },
    {
      headers,
    }
  );
};

export default function App() {
  const { env, session } = useLoaderData();

  const authRedirect = env.SUPABASE_AUTH_REDIRECT;

  const { revalidate } = useRevalidator();

  const [supabase] = useState(() => createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='prose max-w-none bg-brand-background'>
        <main>
          <Outlet context={{ authRedirect, supabase, session }} />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </main>
      </body>
    </html>
  );
}
