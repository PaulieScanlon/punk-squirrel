import { Link } from '@remix-run/react';
import Logo from '../components/logo';
import SignOutButton from '../components/sign-out-button';

const appLinks = [
  {
    to: '/app',
    text: 'Dashboard',
  },
  {
    to: '/app/issues',
    text: 'Issues',
  },
];

const accountLinks = [
  {
    to: '/app/account',
    text: 'Account',
  },
];

const AppLayout = ({ handleNav, isNavOpen, supabase, user, children }) => {
  return (
    <>
      <header className='sticky top-0 z-20 w-full border-b border-b-brand-border bg-brand-surface-0'>
        <nav className='flex px-4 h-[72px]'>
          <Link className='flex items-center no-underline' to='/' aria-current='page'>
            <Logo />
          </Link>
          <div className='relative flex lg:hidden items-center ml-auto'>
            <button id='menu' className='ml-auto flex items-center justify-center' onClick={handleNav}>
              <span className='sr-only'>Navigation</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  id='menuPath'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d={isNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <div className='relative'>
        <div
          id='sidebar'
          className={`fixed top-0 ${
            isNavOpen ? 'left-0' : '-left-[16rem] lg:left-0'
          } w-[16rem] h-screen bg-brand-surface-0 overflow-auto border-r border-r-brand-border z-30 transition-all duration-300`}
        >
          <nav className='flex flex-col p-4 h-full'>
            <Link className='flex items-center no-underline' to='/' aria-current='page'>
              <Logo />
            </Link>
            <div className='flex flex-col grow pt-8'>
              <ul className='list-none m-0 p-0 grow'>
                {appLinks.map((link, index) => {
                  const { to, text } = link;

                  return (
                    <li key={index} className='p-0 m-0'>
                      <Link
                        to={to}
                        className='flex no-underline px-3 py-2 rounded transition-colors duration-300 hover:bg-brand-surface-2'
                      >
                        {text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <ul className='list-none m-0 p-0'>
                {accountLinks.map((link, index) => {
                  const { to, text } = link;

                  return (
                    <li key={index} className='p-0 m-0'>
                      <Link
                        to={to}
                        className='flex no-underline text-sm text-brand-mid-gray px-3 py-2 rounded transition-colors duration-300 hover:text-brand-text hover:bg-brand-surface-2'
                      >
                        {text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {user ? (
                <>
                  <hr />
                  <div>
                    <ul className='list-none m-0 p-0'>
                      <li className='flex items-center gap-1 m-0 p-0'>
                        <img
                          alt={user.user_metadata.full_name}
                          src={user.user_metadata.avatar_url}
                          className='rounded-full border border-brand-border w-8 h-8 m-0'
                        />
                        <SignOutButton supabase={supabase} />
                      </li>
                    </ul>
                  </div>
                </>
              ) : null}
            </div>
          </nav>
        </div>
        <div
          id='lightbox'
          aria-label='lightbox'
          tab-index='0'
          role='button'
          className={`z-10 top-0 left-0 w-screen h-screen bg-brand-background opacity-80 ${
            isNavOpen ? 'fixed' : 'hidden'
          } lg:hidden`}
          onClick={handleNav}
        />
        <div
          className={`p-4 md:p-8 ${
            isNavOpen ? 'ml-0 lg:ml-[16rem]' : 'lg:ml-[16rem]'
          } max-w-8xl h-[calc(100vh-73px)] transition-all duration-300`}
        >
          {user ? <> {children}</> : null}
        </div>
      </div>
    </>
  );
};

export default AppLayout;
