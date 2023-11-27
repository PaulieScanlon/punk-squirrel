import { useOutletContext } from '@remix-run/react';

import DefaultLayout from '../layouts/default-layout';

const Page = () => {
  const { supabase, user } = useOutletContext();
  return (
    <DefaultLayout supabase={supabase} user={user}>
      <section className='grid lg:grid-cols-2 lg:p-24 h-full'>
        <div>
          <h1>About</h1>
          <p className='max-w-lg'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempor interdum dolor eget sollicitudin.
            Aliquam erat volutpat. Quisque efficitur elit eget leo facilisis auctor.
          </p>
        </div>
        <div />
      </section>
    </DefaultLayout>
  );
};

export default Page;
