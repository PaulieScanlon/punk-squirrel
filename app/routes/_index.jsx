// import { useOutletContext } from '@remix-run/react';

import DefaultHeader from '../layouts/default-header';
import DefaultLayout from '../layouts/default-layout';

// import SignInWithGitHub from '../components/sign-with-github-button';

const Page = () => {
  // const { env, supabase, session } = useOutletContext();

  return (
    <>
      <DefaultHeader />
      <DefaultLayout>
        <h1>Index</h1>
        {/* <SignInWithGitHub /> */}
      </DefaultLayout>
    </>
  );
};

export default Page;
