import { useState } from 'react';
import { useOutletContext } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';

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

  return json({
    headers,
  });
};

const Page = () => {
  const { supabase, user } = useOutletContext();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section>
          <h1>Issues</h1>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
