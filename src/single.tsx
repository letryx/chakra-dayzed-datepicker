import React, { useEffect, useRef, useState } from 'react';
import {
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useOutsideClick,
} from '@chakra-ui/react';
import { useDayzed } from 'dayzed';
import { format, parse } from 'date-fns';
import { Month_Names_Short, Weekday_Names_Short } from './utils/calanderUtils';
import { CalendarPanel } from './components/calendarPanel';
import {
  DatepickerConfigs,
  DatepickerProps,
  OnDateSelected,
} from './utils/commonTypes';

export interface SingleDatepickerProps extends DatepickerProps {
  date: Date;
  configs?: DatepickerConfigs;
  disabled?: boolean;
  onDateChange: (date: Date) => void;
  id?: string;
  name?: string;
}

const DefaultConfigs = {
  dateFormat: 'yyyy-MM-dd',
  monthNames: Month_Names_Short,
  dayNames: Weekday_Names_Short,
};

export const SingleDatepicker: React.FC<SingleDatepickerProps> = ({
  configs = DefaultConfigs,
  propsConfigs,
  ...props
}) => {
  const { date, name, disabled, onDateChange, id } = props;

  // chakra popover utils
  const ref = useRef<HTMLElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const [popoverOpen, setPopoverOpen] = useState(false);

  useOutsideClick({
    ref: ref,
    handler: () => setPopoverOpen(false),
  });

  const [typedValue, setTypedValue] = useState(
    format(date, configs.dateFormat)
  );

  // dayzed utils
  const handleOnDateSelected: OnDateSelected = ({ selectable, date }) => {
    if (!selectable) return;
    if (date instanceof Date && !isNaN(date.getTime())) {
      onDateChange(date);
      setTypedValue(format(date, configs.dateFormat));
      setPopoverOpen(false);
      return;
    }
  };
  const onBlur = () => {
    const parsedDate = parse(typedValue, configs.dateFormat, date);
    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime()) && parsedDate.getTime() !== date.getTime()) {
      onDateChange(parsedDate);
      setTypedValue(format(parsedDate, configs.dateFormat));
      setPopoverOpen(false);
      return;
    }
    // Bad, so go back to what was there before.
    setTypedValue(format(date, configs.dateFormat));
  };

  useEffect(() => {
    if (!popoverOpen) {
      onBlur();
    }
  }, [popoverOpen]);

  const onSubmit = onBlur;

  const dayzedData = useDayzed({
    showOutsideDays: true,
    onDateSelected: handleOnDateSelected,
    selected: date,
  });

  return (
    <Popover
      placement="bottom-start"
      variant="responsive"
      isOpen={popoverOpen}
      onClose={() => setPopoverOpen(false)}
      initialFocusRef={initialFocusRef}
      isLazy
    >
      <PopoverTrigger>
        <form onSubmit={onSubmit}>
          <Input
            id={id}
            autoComplete="off"
            isDisabled={disabled}
            ref={initialFocusRef}
            onClick={() => setPopoverOpen(!popoverOpen)}
            name={name}
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            onSubmit={onSubmit}
            {...propsConfigs?.inputProps}
          />
        </form>
      </PopoverTrigger>
      <PopoverContent ref={ref} width="100%">
        <PopoverBody>
          <CalendarPanel
            renderProps={dayzedData}
            configs={configs}
            propsConfigs={propsConfigs}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
