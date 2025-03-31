import { UserRole } from '@perseusfs/shared';
import { useUser } from './use-user';

const useIsAdmin = () => {
  const user = useUser();

  return user?.role === UserRole.ADMIN;
};

export { useIsAdmin };
