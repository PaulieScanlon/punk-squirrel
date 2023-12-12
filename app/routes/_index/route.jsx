import { useOutletContext } from '@remix-run/react';

import DefaultLayout from '../../layouts/default-layout';
import SignInButton from '../../components/sign-in-button';

import punkSquirrel from './punk-squirrel.jpg';

const Page = () => {
  const { authRedirect, supabase, session, user } = useOutletContext();

  return (
    <DefaultLayout supabase={supabase} user={user} session={session}>
      <section className='grid gap-16 lg:grid-cols-2 lg:p-24'>
        <div className='flex flex-col justify-center'>
          <h1 className='m-0 text-7xl font-black'>Punk Squirrel</h1>
          <p className='max-w-lg'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempor interdum dolor eget sollicitudin.
            Aliquam erat volutpat. Quisque efficitur elit eget leo facilisis auctor.
          </p>
          {session?.provider_token ? null : (
            <div>
              <SignInButton authRedirect={authRedirect} supabase={supabase} session={session} />
            </div>
          )}
        </div>
        <div>
          <img src={punkSquirrel} alt='Punk Squirrel' className='m-0 mx-auto rounded-full aspect-square' />
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Page;
