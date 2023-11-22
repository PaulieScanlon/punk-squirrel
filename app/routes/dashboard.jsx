import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import AppLayout from '../layouts/app-layout';
import AppHeader from '../layouts/app-header';

import { supabaseServer } from '../supabase.server';

export const loader = async ({ request }) => {
  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    throw redirect('/');
  }

  return json({
    headers,
  });
};

const Page = () => {
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
      <AppHeader handleNav={handleNav} isNavOpen={isNavOpen} />
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section>
          <h1>Dashboard</h1>
          <div className='grid md:grid-cols-2 gap-2'>
            <div>
              <h2>Session</h2>
              <pre>{JSON.stringify(session, null, 2)}</pre>
            </div>
            <div>
              <h2>User</h2>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
