import { UserCrud } from '@/components/user-crud';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import { TErrors, TUser } from '@perseusfs/shared';
import { memo, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

const UpdateUser = memo(() => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{
    id: string;
  }>();

  const userId = useMemo(() => {
    if (!id || isNaN(Number(id))) {
      return undefined;
    }
    return Number(id);
  }, [id]);

  const token = useToken();

  const onSubmit = useCallback(
    async (values: Partial<TUser>): Promise<TErrors | undefined> => {
      setLoading(true);

      const res = await fetch(`${getApiUrl()}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      setLoading(false);

      if (!res.ok) {
        const { errors } = await res.json();

        return errors;
      }

      toast.success('User updated successfully');
    },
    [token, id]
  );

  return <UserCrud userId={userId} onSubmit={onSubmit} loading={loading} />;
});

export { UpdateUser };
