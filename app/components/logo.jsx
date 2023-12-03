const Logo = () => {
  return (
    <div className='flex items-center gap-2 no-underline '>
      <img
        alt='Punk Squirrel'
        src='/images/punk-squirrel-pink-hair-64x64.png'
        className='m-0 w-10 h-10 bg-brand-surface-1 rounded border border-brand-surface-2'
      />
      {/* <strong className='font-black'>Punk Squirrel</strong> */}
      <strong className='font-black'>PUNK SQUIRREL</strong>
    </div>
  );
};

export default Logo;
