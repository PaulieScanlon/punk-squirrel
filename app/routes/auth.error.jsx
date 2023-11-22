import DefaultHeader from '../layouts/default-header';
import DefaultLayout from '../layouts/default-layout';

const Page = () => {
  return (
    <>
      <DefaultHeader />
      <DefaultLayout>
        <section>
          <h1>Auth Code Error</h1>
        </section>
      </DefaultLayout>
    </>
  );
};

export default Page;
