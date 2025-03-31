import { doLogout } from '@/actions/user';
import { LogOut, Moon, Sun } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTheme } from '../theme-provider';
import { DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

const UserActionsDropdown = memo(() => {
  const { setTheme, theme } = useTheme();

  const onSignOut = useCallback(() => {
    doLogout();
  }, []);

  return (
    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
      <DropdownMenuItem
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
        {theme === 'dark' ? 'Light' : 'Dark'} mode
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSignOut}>
        <LogOut />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
});

export { UserActionsDropdown };
