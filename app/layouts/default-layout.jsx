import { Link } from '@remix-run/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import Logo from '../components/logo';

const navLinks = [
  {
    to: '/',
    text: 'Home',
  },
  {
    to: '/about',
    text: 'About',
  },
];

const authLinks = [
  {
    to: '/app',
    text: 'Dashboard',
  },
];

const DefaultLayout = ({ supabase, user, children }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className='sticky top-0 z-20 w-full border-b border-b-brand-border bg-brand-surface-0'>
        <nav className='flex gap-8 max-w-8xl mx-auto px-4 h-[64px]'>
          <ul className='flex items-center list-none m-0 p-0'>
            <li className='m-0 p-0'>
              <Link className='flex items-center no-underline' to='/' aria-current='page'>
                <Logo />
              </Link>
            </li>
          </ul>
          <ul className='flex grow gap-4 items-center list-none m-0 p-0'>
            {navLinks.map((link, index) => {
              const { to, text } = link;

              return (
                <li key={index} className='mt-2'>
                  <Link
                    to={to}
                    className='no-underline px-3 py-2 rounded transition-colors duration-300 hover:bg-brand-surface-1'
                  >
                    {text}
                  </Link>
                </li>
              );
            })}
            {user ? (
              <>
                {authLinks.map((link, index) => {
                  const { to, text } = link;

                  return (
                    <li key={index} className='mt-2'>
                      <Link
                        to={to}
                        className='no-underline px-3 py-2 rounded transition-colors duration-300 hover:bg-brand-surface-1'
                      >
                        {text}
                      </Link>
                    </li>
                  );
                })}
              </>
            ) : null}
          </ul>
          {user ? (
            <ul className='flex items-center list-none m-0 p-0'>
              <li className='m-0 p-0'>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className='flex w-auto border-none items-center gap-2 p-0' aria-label='Sign out'>
                      <img
                        alt={user.user_metadata.full_name}
                        src={user.user_metadata.avatar_url}
                        className='rounded-full border-2 border-brand-text w-9 h-9 m-0'
                      />
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='w-4 h-4 stroke-brand-text'
                        aria-label='Down chevron'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M19.5 8.25l-7.5 7.5-7.5-7.5'
                          aria-hidden
                        />
                      </svg>
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align='end'
                      className='flex flex-col items-center bg-brand-surface-0 border border-brand-border rounded shadow-lg px-4 py-6 w-52 mt-2 z-50'
                    >
                      <DropdownMenu.Item disabled>
                        <span className='block text-center text-xs text-brand-mid-gray'>Signed in as</span>
                        <strong className='block text-center font-medium text-xl text-brand-text'>
                          {user.user_metadata.full_name}
                        </strong>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className='w-full h-px my-6 bg-brand-dark-gray' />
                      <DropdownMenu.Item asChild>
                        <button
                          aria-label='Sign out'
                          className='flex items-center justify-center border border-brand-border text-brand-text w-full rounded p-2'
                          onClick={handleSignOut}
                        >
                          <span className='text-sm font-medium'>Sign out</span>
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </li>
            </ul>
          ) : null}
        </nav>
      </header>

      <div className='p-4 mx-auto max-w-8xl h-[calc(100vh-70px)] min-h-full'>{children}</div>
    </>
  );
};

export default DefaultLayout;
