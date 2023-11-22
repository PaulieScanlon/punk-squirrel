import { Link } from '@remix-run/react';
import Logo from '../components/logo';
import SignOutButton from '../components/sign-out-button';

const AppLayout = ({ handleNav, isNavOpen, supabase, user, children }) => {
  return (
    <div className='relative'>
      <div
        id='sidebar'
        className={`fixed top-0 ${
          isNavOpen ? 'left-0' : '-left-[12rem] lg:left-0'
        } w-[12rem] h-screen bg-brand-surface-0 overflow-auto border-r border-r-brand-border z-30 transition-all duration-300`}
      >
        <nav className='flex flex-col p-4 h-full'>
          <Link className='flex items-center no-underline' to='/' aria-current='page'>
            <Logo />
          </Link>
          <div className='flex flex-col grow'>
            <div className='grow'>
              <ul className='list-none m-0 p-0'>
                <li className='m-0 p-0'></li>
              </ul>
            </div>
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
        className={`p-4 ${
          isNavOpen ? 'ml-0 lg:ml-[12rem]' : 'lg:ml-[12rem]'
        } max-w-8xl h-[calc(100vh-70px)] min-h-full transition-all duration-300`}
      >
        {user ? <> {children}</> : null}
      </div>
    </div>
  );
};

export default AppLayout;
