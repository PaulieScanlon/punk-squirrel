import { Link } from '@remix-run/react';
import Logo from '../components/logo';

const AppHeader = ({ handleNav, isNavOpen = false }) => {
  return (
    <header className='sticky top-0 z-20 w-full border-b border-b-brand-border bg-brand-surface-0'>
      <nav className='flex px-4 h-[64px]'>
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
  );
};

export default AppHeader;
