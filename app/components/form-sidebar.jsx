import { formatDate } from '../utils/format-date';

const FormSidebar = ({ title, dates, children }) => {
  return (
    <div className='relative lg:fixed bg-brand-surface-1 w-full lg:w-60 lg:h-screen top-0 right-0 border-l border-l-brand-border overflow-auto'>
      <div className='flex flex-col gap-4 px-4 pt-8 lg:pt-24 pb-8'>
        <div>
          <h1 className='mb-0 text-2xl'>{title}</h1>
          <time className='block text-sm font-medium'>
            {formatDate(dates.from)} &bull; {formatDate(dates.to)}
          </time>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FormSidebar;
