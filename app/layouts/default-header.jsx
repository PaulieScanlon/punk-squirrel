import { Link } from '@remix-run/react';
import Logo from '../components/logo';

const DefaultHeader = () => {
  return (
    <header className='sticky top-0 z-20 w-full border-b border-b-brand-border bg-brand-background'>
      <nav className='max-w-8xl mx-auto p-4'>
        <Link className='flex items-center no-underline' to='/' aria-current='page'>
          <Logo />
        </Link>
      </nav>
    </header>
  );
};

export default DefaultHeader;
