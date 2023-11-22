import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from '@remix-run/react';

import AppLayout from '../layouts/app-layout';
import AppHeader from '../layouts/app-header';

const Page = () => {
  const { supabase, user } = useOutletContext();
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
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
