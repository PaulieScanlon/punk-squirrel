import { Link } from '@remix-run/react';
import Logo from '../components/logo';

const AppLayout = ({ handleNav, isNavOpen, children }) => {
  return (
    <div className='relative'>
      <div
        id='sidebar'
        className={`fixed top-0 ${
          isNavOpen ? 'left-0' : '-left-[12rem] lg:left-0'
        } w-[12rem] h-screen bg-brand-surface-0 overflow-auto border-r border-r-brand-border z-30 transition-all duration-300`}
      >
        <nav className='p-4'>
          <Link className='flex items-center no-underline' to='/' aria-current='page'>
            <Logo />
          </Link>
          <ul className='list-none m-0 p-0'>
            <li className='m-0 p-0'></li>
          </ul>
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
        className={`p-4 ${isNavOpen ? 'ml-0 lg:ml-[12rem]' : 'lg:ml-[12rem]'} max-w-8xl transition-all duration-300`}
      >
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
