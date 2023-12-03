import { useEffect, useState } from 'react';
import { useLoaderData, useOutletContext, useSearchParams } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';

import { supabaseServer } from '../supabase.server';

import AppLayout from '../layouts/app-layout';

export const loader = async ({ request }) => {
  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    throw redirect('/');
  }

  const octokit = await new Octokit({
    auth: session.provider_token,
  });

  const events = await octokit.request('GET /users/{username}/events/public', {
    username: session.user.user_metadata.user_name,
    per_page: 1,
  });

  return json({
    events,
    headers,
  });
};

const Page = () => {
  const { events } = useLoaderData();
  const { supabase, session, user } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  useEffect(() => {
    searchParams.delete('code');
    setSearchParams(searchParams);
  }, []);

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section>
          <h1>Dashboard</h1>
          {/* <pre className='text-xx'>{JSON.stringify(session, null, 2)}</pre> */}

          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <h2>Session</h2>
              <pre className='text-xx'>{JSON.stringify(session, null, 2)}</pre>
              {/* <p>{`id: ${session.user.id}`}</p> */}
            </div>
            <div>
              <h2>User</h2>
              <pre className='text-xx'>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>

          <h2>GitHub Username Events</h2>
          <pre>{JSON.stringify(events.data, null, 2)}</pre>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
