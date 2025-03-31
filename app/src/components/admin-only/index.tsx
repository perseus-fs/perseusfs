import { useUser } from '@/hooks/use-user';
import { UserRole } from '@perseusfs/shared';
import { memo } from 'react';

type TAdminOnlyProps = {
  children: React.ReactNode;
};

const AdminOnly = memo(({ children }: TAdminOnlyProps) => {
  const user = useUser();

  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  return <>{children}</>;
});

export { AdminOnly };
