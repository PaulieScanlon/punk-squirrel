const ErrorAnnounce = ({ message }) => {
  return (
    <div className='h-8'>
      {message ? (
        <div className='flex gap-1 rounded items-center p-2 text-brand-red'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='not-prose w-5 h-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
            />
          </svg>

          <small className='not-prose font-medium text-xs'>{message}</small>
        </div>
      ) : null}
    </div>
  );
};

export default ErrorAnnounce;
