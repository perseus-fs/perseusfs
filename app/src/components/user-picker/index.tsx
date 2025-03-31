import { useUsers } from '@/hooks/use-users';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type TUserPickerProps = {
  value?: number;
  onValueChange?: (userId: string | null) => void;
  blacklist?: number[];
  disabled?: boolean;
};

const UserPicker = memo(
  ({ value, onValueChange, blacklist, disabled }: TUserPickerProps) => {
    const [open, setOpen] = useState(false);
    const { users } = useUsers();

    const filteredUsers = useMemo(
      () => users.filter((user) => !blacklist?.includes(user.id)),
      [users, blacklist]
    );

    const selectedValue = useMemo(
      () => filteredUsers.find((user) => user.id === value),
      [filteredUsers, value]
    );

    const selectedLabel = useMemo(
      () => selectedValue?.name ?? 'Select user...',
      [selectedValue]
    );

    const onSelectHandler = useCallback(
      (currentValue: string) => {
        const newUserId = +currentValue === value ? null : currentValue;

        onValueChange?.(newUserId);
        setOpen(false);
      },
      [onValueChange, value]
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            {selectedLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No users available.</CommandEmpty>
              <CommandGroup>
                {filteredUsers.map((filteredUser) => (
                  <CommandItem
                    key={filteredUser.id}
                    value={filteredUser.id.toString()}
                    onSelect={onSelectHandler}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === filteredUser.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {filteredUser.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

export { UserPicker };
