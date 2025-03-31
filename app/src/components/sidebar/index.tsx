import { useUser } from '@/hooks/use-user';
import { ChevronUp, User2 } from 'lucide-react';
import { memo } from 'react';
import { AdminOnly } from '../admin-only';
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';
import { Administrator } from './administrator';
import { Buckets } from './buckets';
import { UserActionsDropdown } from './user-actions-dropdown';

const AppSidebar = memo(() => {
  const user = useUser();

  return (
    <Sidebar>
      <SidebarContent>
        <Buckets />
        <AdminOnly>
          <Administrator />
        </AdminOnly>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <UserActionsDropdown />
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
});

export { AppSidebar };
