const ErrorAnnounce = ({ message }) => {
  return (
    <div className='w-full min-h-8'>
      {message ? (
        <div className='p-2 text-brand-red rounded bg-brand-surface-0 mb-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='not-prose w-6 h-6 mx-auto'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
            />
          </svg>
          <small className='not-prose break-words font-medium text-xs leading-tight'>{message}</small>
        </div>
      ) : null}
    </div>
  );
};

export default ErrorAnnounce;
