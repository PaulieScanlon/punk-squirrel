import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as Picker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
} from 'react-aria-components';
import { parseDate } from '@internationalized/date';

const DatePicker = ({ label, name, onChange, disabled }) => {
  const date = parseDate(new Date().toLocaleDateString('en-CA'));

  return (
    <Picker name={name} defaultValue={date} maxValue={date} onChange={onChange} isDisabled={disabled}>
      <Label className='label'>{label}</Label>
      <Group className='relative flex'>
        <DateInput
          isDisabled={disabled}
          className={({ isDisabled }) =>
            `input flex text-xs ${isDisabled ? 'text-brand-mid-gray bg-brand-surface-0' : 'text-brand-text'}`
          }
        >
          {(segment) => <DateSegment segment={segment} className='text-inherit' />}
        </DateInput>
        <Button className='not-prose absolute top-1 right-0 p-2 disabled:text-brand-mid-gray' isDisabled={disabled}>
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
      </Group>
      <Popover>
        <Dialog>
          <Calendar className='select-none flex flex-col gap-6 px-4 pt-6 pb-4 border border-brand-border bg-brand-surface-0 shadow-lg'>
            <header className='flex justify-between gap-2'>
              <Button slot='previous'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-4 h-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                </svg>
              </Button>
              <Heading className='text-sm text-center m-0' />
              <Button slot='next'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-4 h-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                </svg>
              </Button>
            </header>
            <CalendarGrid className='not-prose font-bold text-sm m-0'>
              {(date) => (
                <CalendarCell
                  date={date}
                  className={({ isDisabled }) =>
                    `text-xs p-2 font-normal text-center rounded-full ${
                      isDisabled
                        ? 'text-brand-dark-gray'
                        : 'text-brand-light-gray bg-brand-surface-1 transition-colors duration-100 hover:bg-brand-surface-2'
                    }`
                  }
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </Picker>
  );
};

export default DatePicker;
