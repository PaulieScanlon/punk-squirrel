import Loading from './loading';

const SubmitButton = ({ state, isDisabled }) => {
  return (
    <button
      type='submit'
      className='inline-flex justify-center items-center px-3 py-2 rounded bg-brand-pink enabled:hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-2 disabled:text-brand-mid-gray h-8'
      disabled={isDisabled}
    >
      {state === 'submitting' ? <Loading /> : 'Submit'}
    </button>
  );
};

export default SubmitButton;
