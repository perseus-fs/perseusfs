import { setToken } from '@/actions/user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Group } from '@/components/ui/group';
import { Input } from '@/components/ui/input';
import { getApiUrl } from '@/helpers/get-api-url';
import { TErrors } from '@perseusfs/shared';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

const Login = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<TErrors>({});

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const response = await fetch(`${getApiUrl()}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();

        setErrors(data.errors);
        return;
      }

      const { token } = await response.json();

      setToken(token);
      navigate('/');
    },
    [navigate, values]
  );

  return (
    <div className="flex w-full items-center justify-center min-h-screen">
      <Card className="w-96 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            PerseusFS
          </CardTitle>
          <CardDescription className="text-center">Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-2 mt-2" onSubmit={onSubmit}>
            <Group
              label="Username"
              error={errors.username}
              required
              className="w-full"
            >
              <Input
                type="text"
                value={values.username}
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
              />
            </Group>

            <Group
              label="Password"
              error={errors.password}
              required
              className="w-full"
            >
              <Input
                type="password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
              />
            </Group>

            <Button disabled={loading} type="submit">
              Login
            </Button>
          </form>

          <div className="flex gap-2 items-center justify-center mt-2">
            <span className="text-xs text-primary/60">
              v{import.meta.env.PACKAGE_VERSION}
            </span>
            <a
              href="https://github.com/diogomartino/perseusfs"
              target="_blank"
              className="hover:underline"
            >
              <span className="text-xs text-primary/60">Github</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { Login };
