import { useBuckets } from '@/hooks/use-buckets';
import { useSelectFirstBucket } from '@/hooks/use-select-first-bucket';
import { useSidebarCount } from '@/hooks/use-sidebar-count';
import { FolderOpen, Plus } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AdminOnly } from '../admin-only';
import { Button } from '../ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';

const Buckets = memo(() => {
  const { buckets, refetch } = useBuckets();
  const navigate = useNavigate();
  const location = useLocation();
  const count = useSidebarCount();

  useSelectFirstBucket(buckets);

  // I know this fucking sucks, but I don't care.
  useEffect(() => {
    if (count === 0) return;

    refetch();
  }, [count, refetch]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <span>Buckets</span>
        <AdminOnly>
          <Button
            size="icon"
            onClick={() => navigate('/bucket/create')}
            className="ml-auto"
            variant="ghost"
          >
            <Plus size="0.9rem" />
          </Button>
        </AdminOnly>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {buckets.length === 0 && (
            <span className="text-xs text-primary/60">
              No buckets available.
            </span>
          )}
          {buckets.map((bucket) => (
            <SidebarMenuItem key={bucket.id}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith(`/bucket/${bucket.id}`)}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/bucket/${bucket.id}`)}
                >
                  <FolderOpen />
                  <span>{bucket.name}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});

export { Buckets };
