import { getApiUrl } from '@/helpers/get-api-url';
import { useAuthenticateUser } from '@/hooks/use-authenticate-user';
import { useIsAuthenticated } from '@/hooks/use-is-authenticated';
import { Login } from '@/screens/login';
import { memo, useEffect } from 'react';
import { LoadingSection } from '../loading-section';
import { Routing } from '../routing';

const App = memo(() => {
  const { loading } = useAuthenticateUser();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    console.log('PerseusFS API:', getApiUrl());
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <LoadingSection />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Routing />;
});

export { App };
