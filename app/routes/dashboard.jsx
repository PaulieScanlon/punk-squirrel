import { useEffect, useState } from 'react';
import { useSearchParams } from '@remix-run/react';
import AppLayout from '../layouts/app-layout';
import AppHeader from '../layouts/app-header';

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
