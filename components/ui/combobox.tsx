import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { Button } from './button';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  label: React.ReactNode;
  filterValue: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ComboboxProps {
  value?: string;
  onValueChange(value: ComboboxOption): void;
  options: ComboboxOption[] | undefined;
  placeholder?: string;
  searchPlaceholder: string;
  emptyState?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  popoverContentClassName?: string;
  deselectable?: boolean;
}

const Combobox = ({
  options,
  value = '',
  onValueChange,
  placeholder = 'Placeholder',
  searchPlaceholder = 'Buscar opção',
  emptyState = 'Nenhum resultado',
  disabled,
  className,
  popoverContentClassName,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[200px] justify-between', className)}
          disabled={disabled}
        >
          {value ? options?.find((option) => option.value === value)?.label : placeholder}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('p-0', popoverContentClassName)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyState}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {options?.map((option) => (
              <CommandItem
                value={option.filterValue || ''}
                key={option.value}
                onSelect={() => {
                  // deselectable ?
                  // onValueChange(currentValue === value ? '' : currentValue);
                  onValueChange(option);
                  setOpen(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { Combobox };
