import { useState } from 'react';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';

import { supabaseServer } from '../../supabase.server';

import AppLayout from '../../layouts/app-layout';

export const loader = async ({ request }) => {
  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session || !session.provider_token) {
    throw redirect('/');
  }

  const {
    data: [profile],
  } = await supabaseClient.from('profile').select();

  return json({
    profile,
    headers,
  });
};

const Page = () => {
  const { profile } = useLoaderData();
  const { supabase, user } = useOutletContext();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section>
          <h1>Account</h1>
          <div>
            <h2>Profile</h2>
            <pre className='text-xx'>{JSON.stringify(profile, null, 2)}</pre>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
