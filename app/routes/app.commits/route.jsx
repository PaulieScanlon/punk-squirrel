import { useState } from 'react';
import { Form, useActionData, useRevalidator, useOutletContext, useNavigation } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';

import AppLayout from '../../layouts/app-layout';
import ErrorAnnounce from '../../components/error-announce';

import { supabaseServer } from '../../supabase.server';

import { formatDate } from '../../utils/format-date';

export const action = async ({ request }) => {
  const { supabaseClient } = await supabaseServer(request);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session || !session.provider_token) {
    // console.log('Session: ', session);
    // console.log('Authenticated User: ', await octokit.users.getAuthenticated());
    signOut();
    throw redirect('/');
  }

  const octokit = new Octokit({
    auth: session.provider_token,
  });

  const body = await request.formData();
  const username = body.get('username');
  const dateFrom = body.get('dateFrom');
  const dateNow = body.get('dateNow');
  const dateDiff = Math.round((new Date(dateNow) - new Date(dateFrom)) / (1000 * 60 * 60 * 24));

  const defaultResponse = {
    title: 'commits',
    username: username,
    dates: {
      from: dateFrom,
      to: dateNow,
      diff: dateDiff,
    },
  };

  try {
    // https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-public-events-for-a-user
    const response = await octokit.request('GET /users/{username}/events/public', {
      username: username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    return json({
      ...defaultResponse,
      response: {
        status: 200,
        message: !response.data.length ? 'No Data' : '',
      },
      data: response.data,
    });
  } catch (error) {
    return json({
      ...defaultResponse,
      response: {
        status: 404,
        message: error.response.data.message,
      },
      data: [],
    });
  }
};

export const loader = async ({ request }) => {
  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session || !session.provider_token) {
    throw redirect('/');
  }

  return json({
    headers,
  });
};

const Page = () => {
  const { supabase, user } = useOutletContext();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const { state } = useNavigation();

  const data = useActionData();
  const revalidator = useRevalidator();

  console.log('data: ', data);
  const dateFrom = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const dateNow = formatDate(new Date());

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section>
          <div className='flex mr-60'>
            {data && data.response.status === 200 ? (
              <>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </>
            ) : (
              <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
            <div className='fixed bg-brand-surface-1 w-60 h-screen top-0 right-0 border-l border-l-brand-border'>
              <div className='flex flex-col gap-4 px-4 pt-24'>
                <div>
                  <h1 className='mb-0 text-2xl'>Commits</h1>
                  <time className='block text-sm font-medium'>
                    {dateFrom} &bull; {dateNow}{' '}
                  </time>
                  <small className='text-brand-mid-gray'>{data ? `(${data.dates.diff} days)` : '( days)'}</small>
                </div>
                <Form method='post' className='flex flex-col gap-4'>
                  <input hidden name='dateFrom' defaultValue={dateFrom} />
                  <input hidden name='dateNow' defaultValue={dateNow} />
                  <div className='flex flex-col gap-2'>
                    <label>
                      Username
                      <input type='text' defaultValue='' placeholder='PaulieScanlon' name='username' />
                    </label>
                  </div>
                  <ErrorAnnounce message={data?.response.message} />
                  <button
                    type='submit'
                    className='inline-flex justify-center items-center px-3 py-2 rounded bg-brand-pink enabled:hover:brightness-125 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-2 disabled:text-brand-mid-gray'
                  >
                    Submit
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
