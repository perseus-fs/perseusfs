import { useForm } from '@/hooks/use-form';
import { useRemoteUser } from '@/hooks/use-remote-user';
import { getRandomString, TErrors, TUser, UserRole } from '@perseusfs/shared';
import { RefreshCw } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { LoadingSection } from '../loading-section';
import { Button } from '../ui/button';
import { Group } from '../ui/group';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Tooltip } from '../ui/tooltip';

type TUserCrudProps = {
  userId?: number;
  onSubmit?: (values: Partial<TUser>) => Promise<TErrors | undefined>;
  loading: boolean;
};

const DEFAULT_VALUES: Partial<TUser> = {
  name: '',
  role: UserRole.USER,
  password: '',
  email: ''
};

const UserCrud = memo(({ userId, onSubmit, loading }: TUserCrudProps) => {
  const { user, loading: loadingData } = useRemoteUser(userId);
  const isUpdate = useMemo(() => !!userId, [userId]);

  const { r, rs, setErrors, errors, values, onFieldChange } = useForm(
    user ?? DEFAULT_VALUES
  );

  const onSubmitHandler = useCallback(async () => {
    const errors = await onSubmit?.({
      ...values,
      email: values.email ? values.email : undefined
    });

    if (errors) {
      setErrors(errors);
    }
  }, [onSubmit, values, setErrors]);

  const onGeneratePassword = useCallback(() => {
    const newPassword = getRandomString(24);

    onFieldChange('password', newPassword);

    navigator.clipboard.writeText(newPassword);
    toast.info('Generated password copied to clipboard.');
  }, [onFieldChange]);

  if (loadingData && isUpdate) {
    return <LoadingSection />;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <Group label="Username" error={errors.name} required>
        <Input {...r('name')} type="text" className="w-[300px]" />
      </Group>

      <Group label="Email" error={errors.email}>
        <Input {...r('email')} type="text" className="w-[300px]" />
      </Group>

      <Group
        className="flex items-center gap-2"
        label="Password"
        error={errors.password}
        required
      >
        <Input {...r('password')} type="password" className="w-[300px]" />
        <Tooltip content="Generate password">
          <Button variant="outline" size="icon" onClick={onGeneratePassword}>
            <RefreshCw />
          </Button>
        </Tooltip>
      </Group>

      <Group label="Role" error={errors.role} required className="w-full">
        <Select {...rs('role')} defaultValue={UserRole.USER}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select user role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.USER}>User</SelectItem>
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
          </SelectContent>
        </Select>
      </Group>

      <div>
        <Button onClick={onSubmitHandler} disabled={loading}>
          {isUpdate ? 'Save' : 'Create'}
        </Button>
      </div>
    </div>
  );
});

export { UserCrud };
