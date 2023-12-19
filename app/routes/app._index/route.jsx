import { useEffect, useState } from 'react';
import { useLoaderData, useOutletContext, useSearchParams } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';

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

  const octokit = await new Octokit({
    auth: session.provider_token,
  });

  // https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
  const response = await octokit.request('GET /user', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  return json({
    ghUser: response.data,
    headers,
  });
};

const Page = () => {
  const { ghUser } = useLoaderData();
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
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section className='flex flex-col gap-8'>
          {/* <h1 className='mb-0 text-2xl'>Dashboard</h1> */}
          <div className='p-8 bg-brand-surface-0'>
            <div className='flex items-center gap-6'>
              <img
                src='https://avatars.githubusercontent.com/u/1465706?v=4'
                alt={ghUser.name}
                className='m-0 w-28 h-28 overflow-hidden rounded-full ring ring-brand-light-gray'
              />
              <div className='flex flex-col gap-1'>
                <div className='flex flex-col'>
                  <h2 className='m-0 text-xl'>
                    <a
                      href={ghUser.url}
                      className='no-underline font-bold transition-colors duration-300 hover:text-brand-light-gray'
                    >
                      {ghUser.name}
                    </a>
                  </h2>
                  <small className='text-brand-mid-gray'>{`@${ghUser.login}`}</small>
                </div>
                <p className='mt-0 mb-2 text-brand-light-gray'>{ghUser.bio}</p>
                <div className='flex gap-4'>
                  <span className='flex gap-1'>
                    <strong>{ghUser.following}</strong>
                    Following
                  </span>
                  <span className='flex gap-1'>
                    <strong>{ghUser.followers}</strong>
                    Followers
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* <pre className='text-xx'>{JSON.stringify(ghUser, null, 2)}</pre> */}

          {/* <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <h2>Session</h2>
              <pre className='text-xx'>{JSON.stringify(session, null, 2)}</pre>
            </div>
            <div>
              <h2>User</h2>
              <pre className='text-xx'>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div> */}

          {/* <h2>GitHub Username Events</h2>
          <pre>{JSON.stringify(events.data, null, 2)}</pre> */}
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
