import { CodeEditor } from '@/components/code-editor';
import { LoadingSection } from '@/components/loading-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Group } from '@/components/ui/group';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatSeconds } from '@/helpers/format-seconds';
import { getApiUrl } from '@/helpers/get-api-url';
import { useForm } from '@/hooks/use-form';
import { useIsDemoModeLocked } from '@/hooks/use-is-demo-mode-locked';
import { useIsSuperUser } from '@/hooks/use-is-super-user';
import { useSettings } from '@/hooks/use-settings';
import { useToken } from '@/hooks/use-token';
import { javascript } from '@codemirror/lang-javascript';
import { filesize } from 'filesize';
import { AlertCircle } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DemoModeHelp,
  DiskUsageHelp,
  ExtraHeadersHelp,
  InterfaceScriptsHelp
} from './help';

const Settings = memo(() => {
  const token = useToken();
  const isSuperUser = useIsSuperUser();
  const isDemoLocked = useIsDemoModeLocked();
  const { settings, loading: loadingData } = useSettings();
  const [loading, setLoading] = useState(false);
  const [changedMaxRequestSize, setChangedMaxRequestSize] = useState(false);

  const parsedSettings = useMemo(() => {
    return {
      ...settings,
      extraHeaders: JSON.stringify(settings?.extraHeaders ?? '{}', null, 2)
    };
  }, [settings]);

  const { r, setErrors, errors, values, onFieldChange } =
    useForm(parsedSettings);

  const onSubmitHandler = useCallback(async () => {
    try {
      JSON.parse(values.extraHeaders);
    } catch {
      setErrors({ extraHeaders: 'Invalid JSON' });
      return;
    }

    if (values.maxRequestSize !== 0 && values.maxRequestSize < 2048) {
      setErrors({
        maxRequestSize:
          'Unsafe value. Provide 0 for unlimited or a value greater than 2048.'
      });
      return;
    }

    setLoading(true);

    const res = await fetch(`${getApiUrl()}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        maxRequestSize: values.maxRequestSize,
        corsAllowOrigin: values.corsAllowOrigin,
        extraHeaders: JSON.parse(values.extraHeaders),
        extraCode: values.extraCode,
        maxDiskUsage: values.maxDiskUsage,
        demoMode: isSuperUser ? values.demoMode : undefined,
        requestLogsRetention: values.requestLogsRetention
      })
    });

    setLoading(false);

    if (!res.ok) {
      const { errors } = await res.json();

      setErrors(errors);
      return;
    }

    toast.success('Settings updated successfully');
  }, [token, values, setErrors, isSuperUser]);

  if (loadingData) {
    return <LoadingSection />;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <Group
        className="flex items-center gap-2"
        label="Max Request Size"
        error={errors.maxRequestSize}
        description="The maximum size of a request body in bytes. This ultimately will limit the size of files that can be uploaded. Set to 0 for no limit. Setting a very small value will prevent you from using the API as a whole. Will only be applied after a restart."
        required
      >
        <Input
          {...r('maxRequestSize', true, () => {
            setChangedMaxRequestSize(true);
          })}
          type="number"
          className="w-[300px]"
          disabled={isDemoLocked}
        />
        <span className="text-xs text-muted-foreground">
          {filesize(values.maxRequestSize ?? 0)}
        </span>
      </Group>

      <Group
        className="flex items-center gap-2"
        label="Max Disk Usage"
        error={errors.maxDiskUsage}
        description="The maximum disk usage in bytes. Set to 0 for no limit."
        help={<DiskUsageHelp />}
        required
      >
        <Input
          {...r('maxDiskUsage', true)}
          type="number"
          className="w-[300px]"
          disabled={isDemoLocked}
        />
        <span className="text-xs text-muted-foreground">
          {filesize(values.maxDiskUsage ?? 0)}
        </span>
      </Group>

      <Group
        className="flex items-center gap-2"
        label="Logs Retention"
        error={errors.requestLogsRetention}
        description="The amount of time that logs will be kept in the database. In seconds. Set to 0 to keep logs forever."
        required
      >
        <Input
          {...r('requestLogsRetention', true)}
          type="number"
          className="w-[300px]"
          disabled={isDemoLocked}
        />
        <span className="text-xs text-muted-foreground">
          {formatSeconds(values.requestLogsRetention ?? 0)}
        </span>
      </Group>

      <Group
        label="CORS Allow Origin"
        error={errors.corsAllowOrigin}
        description="The origin that is allowed to access PerseusFS. Use '*' to allow all origins. Make sure you know what you are doing before changing this. Invalid values WILL prevent you from reaching your server."
        required
      >
        <Input
          {...r('corsAllowOrigin')}
          type="text"
          className="w-[300px]"
          disabled={isDemoLocked}
        />
      </Group>

      <Group
        label="Extra Headers"
        error={errors.extraHeaders}
        description="Extra headers to be added to every response. Must be a valid JSON object"
        help={<ExtraHeadersHelp />}
      >
        <CodeEditor
          height="200px"
          width="1000px"
          extensions={[javascript()]}
          onChange={(value) => onFieldChange('extraHeaders', value)}
          value={values.extraHeaders}
          readOnly={isDemoLocked}
        />
      </Group>

      <Group
        label="Interface scripts"
        error={errors.extraCode}
        description="Custom JavaScript code that will be injected into the <head> of the interface. Can be useful for adding things like analytics. Be careful with this as it can be a security risk and/or break the interface."
        help={<InterfaceScriptsHelp />}
      >
        <CodeEditor
          height="200px"
          width="1000px"
          extensions={[javascript()]}
          onChange={(value) => onFieldChange('extraCode', value)}
          value={isDemoLocked ? '' : values.extraCode}
          readOnly={isDemoLocked}
        />
      </Group>

      <Group
        label="Demo Mode"
        error={errors.demoMode}
        description="This setting can only be changed by the super user."
        help={<DemoModeHelp />}
      >
        <div className="flex items-center space-x-2">
          <Switch
            id="demo-mode"
            disabled={!isSuperUser || isDemoLocked}
            checked={values.demoMode}
            onCheckedChange={(value) => onFieldChange('demoMode', value)}
          />
          <span className="text-sm text-muted-foreground">
            {values.demoMode ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </Group>

      {changedMaxRequestSize && (
        <Alert className="mt-4 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You changed the max request size. That setting will only be applied
            after a server restart
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Button onClick={onSubmitHandler} disabled={loading || isDemoLocked}>
          Save
        </Button>
      </div>
    </div>
  );
});

export { Settings };
