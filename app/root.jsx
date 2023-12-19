import { useState, useEffect } from 'react';
import { Links, LiveReload, Outlet, Scripts, ScrollRestoration, useLoaderData, useRevalidator } from '@remix-run/react';
import { json } from '@remix-run/node';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseServer } from './supabase.server';

import stylesheet from './tailwind.css';

import plusJakartaSans200 from '@fontsource/plus-jakarta-sans/200.css';
import plusJakartaSans300 from '@fontsource/plus-jakarta-sans/300.css';
import plusJakartaSans400 from '@fontsource/plus-jakarta-sans/400.css';
import plusJakartaSans500 from '@fontsource/plus-jakarta-sans/500.css';
import plusJakartaSans600 from '@fontsource/plus-jakarta-sans/600.css';
import plusJakartaSans700 from '@fontsource/plus-jakarta-sans/700.css';
import plusJakartaSans800 from '@fontsource/plus-jakarta-sans/800.css';

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

  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  return json(
    {
      env,
      session,
      user,
    },
    {
      headers,
    }
  );
};

export default function App() {
  const { env, session, user } = useLoaderData();

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
        <title>Punk Squirrel</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        <meta name='title' content='Punk Squirrel' />
        <meta name='description' content='GitHub Statistical Analysis - and more' />

        {/* Open Graph / Facebook */}
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://punksquirrel.app/' />
        <meta property='og:title' content='Punk Squirrel' />
        <meta property='og:description' content='GitHub Statistical Analysis - and more' />
        <meta property='og:image' content='https://punksquirrel.app/images/punk-squirrel-og-image.jpg' />

        {/* <Twitter */}
        <meta property='twitter:card' content='summary_large_image' />
        <meta property='twitter:url' content='https://punksquirrel.app/' />
        <meta property='twitter:title' content='Punk Squirrel' />
        <meta property='twitter:description' content='GitHub Statistical Analysis - and more' />
        <meta property='twitter:image' content='https://punksquirrel.app/images/punk-squirrel-og-image.jpg' />

        <link rel='icon' type='image/x-icon' href='/favicon.ico' />

        <Links />
      </head>
      <body className='prose max-w-none bg-brand-background'>
        <main className='min-h-screen'>
          <Outlet context={{ authRedirect, supabase, session, user }} />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </main>
      </body>
    </html>
  );
}
