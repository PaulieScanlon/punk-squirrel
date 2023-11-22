import { useEffect, useState } from 'react';
import { useSearchParams } from '@remix-run/react';
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
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen}>
        <section>
          <h1>Dashboard</h1>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
