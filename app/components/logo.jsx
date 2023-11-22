const Logo = () => {
  return (
    <div className='no-underline'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={1.4}
        className='stroke-brand-text w-8 h-8'
      >
        <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z' />
        <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z' />
      </svg>
    </div>
  );
};

export default Logo;
