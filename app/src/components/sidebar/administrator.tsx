import { LayoutDashboard, Logs, Settings, Users } from 'lucide-react';
import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';

const Administrator = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <span>Administrator</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === `/users`}
            >
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/users`)}
              >
                <Users />
                <span>Users</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === `/metrics`}
            >
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/metrics`)}
              >
                <LayoutDashboard />
                <span>Metrics</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === `/logs`}>
              <div className="cursor-pointer" onClick={() => navigate(`/logs`)}>
                <Logs />
                <span>Logs</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === `/settings`}
            >
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/settings`)}
              >
                <Settings />
                <span>Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});

export { Administrator };
