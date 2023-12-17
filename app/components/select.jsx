import { Button, Label, ListBox, ListBoxItem, Popover, Select as Selector, SelectValue } from 'react-aria-components';

const Select = ({ label, name, placeholder, onChange, disabled, items }) => {
  return (
    <Selector
      name={name}
      placeholder={placeholder}
      className='relative flex flex-col'
      defaultSelectedKey={items[0].value}
      onSelectionChange={onChange}
      isDisabled={disabled}
    >
      <Label className='label'>{label}</Label>
      <Button
        isDisabled={disabled}
        className={({ isDisabled }) =>
          `input flex text-xs items-center justify-between ${
            isDisabled ? 'text-brand-mid-gray bg-brand-surface-0' : 'text-brand-text'
          }`
        }
      >
        <SelectValue className='text-inherit' />
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={2}
          stroke='currentColor'
          className='not-prose w-3 h-3'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
        </svg>
      </Button>
      <Popover className='select-none flex flex-col gap-6 px-4 pt-6 pb-4 border border-brand-border bg-brand-surface-0 shadow-lg w-64 text-xs'>
        <ListBox className='flex flex-col gap-2' items={items}>
          {items.map((item, index) => {
            const { name, value } = item;

            return (
              <ListBoxItem
                id={value}
                key={index}
                value={value}
                className='p-2 text-brand-light-gray bg-brand-surface-1 transition-colors duration-100 hover:bg-brand-surface-2 cursor-pointer'
              >
                {name}
              </ListBoxItem>
            );
          })}
        </ListBox>
      </Popover>
    </Selector>
  );
};

export default Select;
