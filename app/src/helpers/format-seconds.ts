import { formatDuration, intervalToDuration } from 'date-fns';

const formatSeconds = (seconds: number) => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  return formatDuration(duration, {
    format: ['years', 'months', 'days', 'hours', 'minutes', 'seconds']
  });
};

export { formatSeconds };
