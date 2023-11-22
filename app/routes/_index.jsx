import { useOutletContext } from '@remix-run/react';

import DefaultHeader from '../layouts/default-header';
import DefaultLayout from '../layouts/default-layout';

import SignInButton from '../components/sign-in-button';

const Page = () => {
  const { authRedirect, supabase, session, user } = useOutletContext();

  return (
    <>
      <DefaultHeader supabase={supabase} user={user} />
      <DefaultLayout>
        <section className='grid lg:grid-cols-2 lg:p-24 h-full'>
          <div>
            <h1>TBD</h1>
            <p className='max-w-lg'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempor interdum dolor eget sollicitudin.
              Aliquam erat volutpat. Quisque efficitur elit eget leo facilisis auctor.
            </p>
            {session ? null : <SignInButton authRedirect={authRedirect} supabase={supabase} session={session} />}
          </div>
          <div />
        </section>
      </DefaultLayout>
    </>
  );
};

export default Page;
