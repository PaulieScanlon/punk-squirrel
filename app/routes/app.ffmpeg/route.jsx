import { useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

import { useOutletContext } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';

import AppLayout from '../../layouts/app-layout';
import AppSection from '../../components/app-section';

import { supabaseServer } from '../../supabase.server';

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
  const [loaded, setLoaded] = useState(false);

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const load = async () => {
    const ffmpeg = new FFmpeg();

    const baseURL = '/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      classWorkerURL: '../../@ffmpeg/ffmpeg/dist/esm/worker.js',
    });

    setLoaded(true);
  };

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <AppSection>
          {loaded ? (
            <p>ffmpeg loaded</p>
          ) : (
            <button
              onClick={load}
              className='inline-flex justify-center items-center px-3 py-2 rounded bg-brand-pink enabled:hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-2 disabled:text-brand-mid-gray h-8'
            >
              Load ffmpeg-core (~31 MB)
            </button>
          )}
        </AppSection>
      </AppLayout>
    </>
  );
};

export default Page;
