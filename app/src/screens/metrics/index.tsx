import { LoadingSection } from '@/components/loading-section';
import { Checkbox } from '@/components/ui/checkbox';
import { useMetrics } from '@/hooks/use-metrics';
import { formatDuration, intervalToDuration } from 'date-fns';
import { filesize } from 'filesize';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

type TMetricCardProps = {
  title: string;
  value: string | number | undefined;
  description?: string;
};

const MetricCard = memo(({ title, value, description }: TMetricCardProps) => {
  return (
    <div className="flex flex-col p-4 border border-border shadow rounded-lg w-fit">
      <h3 className="text-md">{title}</h3>
      <span className="text-2xl font-bold">
        {value !== undefined ? value : 'N/A'}{' '}
        {description && (
          <span className="text-sm text-muted-foreground font-medium">
            {description}
          </span>
        )}
      </span>
    </div>
  );
});

const Metrics = memo(() => {
  const {
    metrics,
    loading: loadingData,
    loadedFirstTime,
    refetch
  } = useMetrics();
  const [liveUpdate, setLiveUpdate] = useState(false);
  const intervalRef = useRef<any | null>(null);

  useEffect(() => {
    if (liveUpdate) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, 2000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [liveUpdate, refetch]);

  const uptime = useMemo(() => {
    const duration = intervalToDuration({
      start: 0,
      end: metrics?.uptime ? metrics?.uptime * 1000 : 0
    });

    return formatDuration(duration, {
      format: ['days', 'hours', 'minutes', 'seconds']
    });
  }, [metrics]);

  const totalMemoryUsage = useMemo(() => {
    if (!metrics?.memoryUsage) {
      return 0;
    }

    return metrics.memoryUsage.heapTotal + metrics.memoryUsage.external;
  }, [metrics]);

  const errorLogs = useMemo(() => {
    return metrics?.logsStats.find((log) => log.status === 200)?.count;
  }, [metrics]);

  const successLogs = useMemo(() => {
    return metrics?.logsStats.find((log) => log.status === 400)?.count;
  }, [metrics]);

  if (loadingData && !loadedFirstTime) {
    return <LoadingSection />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <span>Live update</span>
        <Checkbox
          checked={liveUpdate}
          onCheckedChange={() => setLiveUpdate(!liveUpdate)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <MetricCard title="Files" value={metrics?.filesCount ?? 0} />
          <MetricCard title="Logs" value={metrics?.logsCount ?? 0} />
          <MetricCard title="Buckets" value={metrics?.bucketsCount ?? 0} />
        </div>

        <div className="flex gap-2">
          <MetricCard
            title="Files size"
            value={filesize(metrics?.filesSize ?? 0)}
          />
          <MetricCard
            title="Database size"
            value={filesize(metrics?.dbSize ?? 0)}
          />
        </div>

        <div className="flex gap-2">
          <MetricCard title="RAM usage" value={filesize(totalMemoryUsage)} />
          <MetricCard
            title="CPU usage"
            value={`${metrics?.cpuUsage ? metrics?.cpuUsage.toFixed(2) : 0}%`}
          />
        </div>

        <div className="flex gap-2">
          <MetricCard
            title="Success Requests"
            value={errorLogs}
            description="served"
          />
          <MetricCard
            title="Failed Requests"
            value={successLogs}
            description="failed"
          />
        </div>

        <MetricCard title="Uptime" value={uptime} />
      </div>
    </div>
  );
});

export { Metrics };
