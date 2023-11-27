import DefaultLayout from '../layouts/default-layout';

const Page = () => {
  return (
    <>
      <DefaultLayout>
        <section className='grid lg:grid-cols-2 lg:p-24 h-full'>
          <div>
            <h1>Auth Code Error</h1>
          </div>
          <div />
        </section>
      </DefaultLayout>
    </>
  );
};

export default Page;
