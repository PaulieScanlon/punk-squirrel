const PlayerControls = ({ children, onReplay, onPlayPause, isPlaying, disabled }) => {
  return (
    <div className='flex items-center justify-between bg-brand-surface-0 p-2 gap-4'>
      <button
        className='inline-flex items-center p-2 rounded-md bg-brand-surface-2 enabled:hover:brightness-125 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-1 disabled:text-brand-mid-gray'
        onClick={onPlayPause}
        disabled={disabled}
      >
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='not-prose w-4 h-4'>
          {isPlaying ? (
            <path
              fillRule='evenodd'
              d='M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z'
              clipRule='evenodd'
            />
          ) : (
            <path
              fillRule='evenodd'
              d='M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z'
              clipRule='evenodd'
            />
          )}
        </svg>
      </button>
      <div className='w-full bg-brand-surface-2 rounded-full h-1'>{children}</div>
      <button
        className='inline-flex items-center p-2 rounded-md bg-brand-surface-2 enabled:hover:brightness-125 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-1 disabled:text-brand-mid-gray'
        onClick={onReplay}
        disabled={disabled}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={2}
          stroke='currentColor'
          className='not-prose w-4 h-4'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
          />
        </svg>
      </button>
    </div>
  );
};

export default PlayerControls;
