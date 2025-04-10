import { memo } from 'react';

const ExtraHeadersHelp = memo(() => {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-bold">Example:</span>
      <pre>
        {JSON.stringify(
          {
            'X-Custom-Header': 'value',
            'Cache-Control': 'public, max-age=604800'
          },
          null,
          2
        )}
      </pre>
    </div>
  );
});

const DiskUsageHelp = memo(() => {
  return (
    <span>
      If the usage is already higher than this limit when you set it, the
      current files won't be deleted, but no new files will be allowed to be
      uploaded.
    </span>
  );
});

const InterfaceScriptsHelp = memo(() => {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-bold">Example:</span>
      <pre>
        {`<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=XXXXXXXXXX"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-XXXXXXX');
</script>`}
      </pre>
    </div>
  );
});

const DemoModeHelp = memo(() => {
  return (
    <span>
      This will enable demo mode, which will allow to showcase the app in a
      production-like environment. Some settings that normally are editable by
      any administrator will only be editable by the super administrator. This
      is to prevent users from changing critical configurations that could
      affect the overall system stability and security.
    </span>
  );
});

export { DemoModeHelp, DiskUsageHelp, ExtraHeadersHelp, InterfaceScriptsHelp };
