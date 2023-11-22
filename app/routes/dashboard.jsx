import { useState } from 'react';
import AppLayout from '../layouts/app-layout';
import AppHeader from '../layouts/app-header';

const Page = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

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
