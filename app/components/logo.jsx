const Logo = () => {
  return (
    <div className='flex items-center gap-2 no-underline '>
      <img
        alt='Punk Squirrel'
        src='/images/punk-squirrel-pink-hair-64x64.jpg'
        className='m-0 w-10 h-10 bg-brand-surface-1 rounded-full border border-brand-surface-2'
      />
      <strong className='font-black'>Punk Squirrel</strong>
    </div>
  );
};

export default Logo;
