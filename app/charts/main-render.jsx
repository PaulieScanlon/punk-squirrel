import { forwardRef } from 'react';

const MainRender = forwardRef(({ isDisabled, handleRender }, ref) => {
  return (
    <div className='flex items-center justify-between bg-brand-surface-0 p-2'>
      <small ref={ref} className='text-xs text-brand-text'></small>
      <div className='flex gap-4'>
        <button
          type='button'
          className='inline-flex items-center px-3 py-2 rounded-md bg-brand-blue enabled:hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-1 disabled:text-brand-mid-gray'
          onClick={handleRender}
          disabled={isDisabled}
        >
          Render
        </button>
      </div>
    </div>
  );
});
export default MainRender;
