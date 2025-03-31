import { UserCrud } from '@/components/user-crud';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import { TErrors, TUser } from '@perseusfs/shared';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const CreateUser = memo(() => {
  const navigate = useNavigate();
  const token = useToken();
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (values: Partial<TUser>): Promise<TErrors | undefined> => {
      setLoading(true);

      const res = await fetch(`${getApiUrl()}/users`, {
        method: 'POST',
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

      toast.success('User created successfully');
      navigate('/users');
    },
    [token, navigate]
  );

  return <UserCrud onSubmit={onSubmit} loading={loading} />;
});

export { CreateUser };
