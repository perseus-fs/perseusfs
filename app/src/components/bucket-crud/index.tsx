import { formatSeconds } from '@/helpers/format-seconds';
import { useBucket } from '@/hooks/use-bucket';
import { useForm } from '@/hooks/use-form';
import { useIsDemoModeLocked } from '@/hooks/use-is-demo-mode-locked';
import { CODE_READ_BOILERPLATE, CODE_WRITE_BOILERPLATE } from '@/statics';
import { javascript } from '@codemirror/lang-javascript';
import {
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  TErrors,
  TZedBucket
} from '@perseusfs/shared';
import { filesize } from 'filesize';
import { memo, useCallback, useMemo } from 'react';
import { CodeEditor } from '../code-editor';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { IOHelp, QuotaHelp } from './help';
import { BucketPermissions } from './permissions';

type TBucketCrudProps = {
  bucketId?: number;
  onSubmit?: (values: Partial<TZedBucket>) => Promise<TErrors | undefined>;
  loading: boolean;
};

const DEFAULT_VALUES: Partial<TZedBucket> = {
  name: '',
  read: IOPermission.PUBLIC,
  write: IOPermission.PRIVATE,
  retentionPolicy: RetentionPolicy.NEVER_DELETE,
  quotaPolicy: QuotaPolicy.UNLIMITED
};

const BucketCrud = memo(({ bucketId, onSubmit, loading }: TBucketCrudProps) => {
  const { bucket } = useBucket(bucketId);
  const isUpdate = useMemo(() => !!bucketId, [bucketId]);
  const isDemoLocked = useIsDemoModeLocked();

  const { r, rs, setErrors, errors, values, onFieldChange } = useForm(
    bucket ?? DEFAULT_VALUES
  );

  const onSubmitHandler = useCallback(async () => {
    const errors = await onSubmit?.(values);

    if (errors) {
      setErrors(errors);
    }
  }, [onSubmit, values, setErrors]);

  return (
    <Tabs defaultValue="bucket" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="bucket">Bucket</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="bucket" className="w-full">
        <div className="flex flex-col w-full gap-2">
          <Group label="Name" error={errors.name} required>
            <Input {...r('name')} type="text" className="w-[300px]" />
          </Group>
          <Group
            label="Read"
            error={errors.read}
            required
            className="w-full"
            help={<IOHelp verb="read" />}
          >
            <Select
              {...rs('read')}
              defaultValue={IOPermission.PUBLIC}
              disabled={isDemoLocked}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select read permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IOPermission.PUBLIC}>Public</SelectItem>
                <SelectItem value={IOPermission.PRIVATE}>Private</SelectItem>
                <SelectItem value={IOPermission.CUSTOM}>Custom</SelectItem>
              </SelectContent>
            </Select>
          </Group>
          {values.read === IOPermission.CUSTOM && (
            <Group
              label="Custom read permission"
              error={errors.customRead}
              className="w-full"
            >
              <CodeEditor
                height="200px"
                width="1000px"
                extensions={[javascript()]}
                onChange={(value) => onFieldChange('customRead', value)}
                value={CODE_READ_BOILERPLATE}
                readOnly={isDemoLocked}
              />
            </Group>
          )}
          <Group
            label="Write"
            error={errors.write}
            required
            className="w-full"
            help={<IOHelp verb="write" />}
          >
            <Select
              {...rs('write')}
              defaultValue={IOPermission.PRIVATE}
              disabled={isDemoLocked}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select write permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IOPermission.PUBLIC}>Public</SelectItem>
                <SelectItem value={IOPermission.PRIVATE}>Private</SelectItem>
                <SelectItem value={IOPermission.CUSTOM}>Custom</SelectItem>
              </SelectContent>
            </Select>
          </Group>
          {values.write === IOPermission.CUSTOM && (
            <Group
              label="Custom write permission"
              error={errors.customRead}
              className="w-full"
              help={
                <span>
                  Define a custom javascript function to check if a user can
                  write a file.
                </span>
              }
            >
              <CodeEditor
                height="200px"
                width="1000px"
                extensions={[javascript()]}
                value={CODE_WRITE_BOILERPLATE}
                onChange={(value) => onFieldChange('customWrite', value)}
                readOnly={isDemoLocked}
              />
            </Group>
          )}
          <Group
            label="Retention"
            error={errors.read}
            required
            className="w-full"
          >
            <Select
              {...rs('retentionPolicy')}
              defaultValue={RetentionPolicy.NEVER_DELETE}
              disabled={isDemoLocked}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select retention policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RetentionPolicy.NEVER_DELETE}>
                  Never delete files
                </SelectItem>
                <SelectItem value={RetentionPolicy.DISPOSE}>
                  Delete files after a certain period
                </SelectItem>
              </SelectContent>
            </Select>
          </Group>

          {values.retentionPolicy === RetentionPolicy.DISPOSE && (
            <Group
              label="Retention period"
              error={errors.retention}
              className="flex items-center gap-2"
              description="The time after which files will be deleted. In seconds."
              required
            >
              <Input
                {...r('retention', true)}
                type="number"
                step={1}
                min={0}
                className="w-[200px]"
                disabled={isDemoLocked}
                defaultValue={3600}
              />
              <span className="text-xs text-muted-foreground">
                {formatSeconds(values.retention ?? 0)}
              </span>
            </Group>
          )}
          <Group
            label="Quota"
            error={errors.read}
            required
            className="w-full"
            help={<QuotaHelp />}
          >
            <Select
              {...rs('quotaPolicy')}
              defaultValue={QuotaPolicy.UNLIMITED}
              disabled={isDemoLocked}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Quota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuotaPolicy.UNLIMITED}>Unlimited</SelectItem>
                <SelectItem value={QuotaPolicy.LIMITED}>Limited</SelectItem>
              </SelectContent>
            </Select>
          </Group>
          {values.quotaPolicy === QuotaPolicy.LIMITED && (
            <Group
              className="flex items-center gap-2"
              label="Quota amount"
              error={errors.quota}
              description="The maximum disk usage for this specific bucket in bytes."
              required
            >
              <Input
                {...r('quota', true)}
                type="number"
                className="w-[300px]"
                disabled={isDemoLocked}
              />
              <span className="text-xs text-muted-foreground">
                {filesize(values.quota ?? 0)}
              </span>
            </Group>
          )}
          <div>
            <Button onClick={onSubmitHandler} disabled={loading}>
              {isUpdate ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="permissions">
        <BucketPermissions bucketId={bucketId} />
      </TabsContent>
    </Tabs>
  );
});

export { BucketCrud };
