const Loading = () => {
  return (
    <div className='flex gap-1'>
      <div className='rounded-full w-2 h-2 bg-brand-mid-gray animate-pulse delay-200 duration-700 ' />
      <div className='rounded-full w-2 h-2 bg-brand-mid-gray animate-pulse delay-300 duration-700 ' />
      <div className='rounded-full w-2 h-2 bg-brand-mid-gray animate-pulse delay-500 duration-700 ' />
    </div>
  );
};

export default Loading;
