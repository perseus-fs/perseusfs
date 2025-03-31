import { useIsAdmin } from '@/hooks/use-is-admin';
import { Bucket } from '@/screens/bucket';
import { CreateBucket } from '@/screens/bucket/create';
import { UpdateBucket } from '@/screens/bucket/update';
import { Home } from '@/screens/home';
import { Logs } from '@/screens/logs';
import { Metrics } from '@/screens/metrics';
import { Settings } from '@/screens/settings';
import { Users } from '@/screens/user';
import { CreateUser } from '@/screens/user/create';
import { UpdateUser } from '@/screens/user/update';
import { memo } from 'react';
import { Route, Routes } from 'react-router';
import { AdminOnly } from '../admin-only';
import { AppSidebar } from '../sidebar';

const Routing = memo(() => {
  const isAdmin = useIsAdmin();

  return (
    <>
      <AppSidebar />
      <div className="p-2 w-screen h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bucket/:id" element={<Bucket />} />
          <Route path="/bucket/:id/edit" element={<UpdateBucket />} />
          <Route path="/bucket/create" element={<CreateBucket />} />

          {isAdmin && (
            <>
              <Route path="/users" element={<Users />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/:id/edit" element={<UpdateUser />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/metrics" element={<Metrics />} />
            </>
          )}
        </Routes>

        <AdminOnly>
          <Routes></Routes>
        </AdminOnly>
      </div>
    </>
  );
});

export { Routing };
