import { Link, useOutletContext } from '@remix-run/react';

import DefaultLayout from '../../layouts/default-layout';
import SignInButton from '../../components/sign-in-button';

import punkSquirrel from './punk-squirrel.jpg';

const Page = () => {
  const { authRedirect, supabase, session, user } = useOutletContext();

  return (
    <DefaultLayout supabase={supabase} user={user} session={session}>
      <section className='grid gap-16 lg:grid-cols-2 pt-16 lg:p-20'>
        <div className='flex flex-col items-center lg:items-start justify-center'>
          <h1 className='m-0 text-5xl sm:text-7xl font-black text-center lg:text-left'>Punk Squirrel</h1>
          <p className='max-w-lg text-center lg:text-left'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempor interdum dolor eget sollicitudin.
            Aliquam erat volutpat. Quisque efficitur elit eget leo facilisis auctor.
          </p>
          <div>
            {session?.provider_token ? (
              <Link
                to='/app'
                className='flex items-center gap-3 px-4 py-2 rounded-lg bg-brand-pink hover:brightness-125 transition-all duration-300 no-underline font-medium'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  dataSlot='icon'
                  className='w-6 h-6'
                >
                  <path d='M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z' />
                </svg>
                Go to Dashboard
              </Link>
            ) : (
              <SignInButton authRedirect={authRedirect} supabase={supabase} session={session} />
            )}
          </div>
        </div>
        <div>
          <img
            src={punkSquirrel}
            alt='Punk Squirrel'
            className='m-0 mx-auto border-8 border-brand-pink rounded-full aspect-square w-full max-w-xs lg:max-w-lg'
          />
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Page;
