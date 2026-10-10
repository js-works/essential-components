import { useEffect, useState } from 'react';
import { dateOf, timeOf } from '../../domain';

export { useNow };

// The time now, renewed every `interval` milliseconds (the clock: every second; the running minutes: every 30
// seconds): the date, the time of day (`HH:mm`) and the `Date` itself.
function useNow(interval: number): { date: string; time: string; value: Date } {
  const [value, setValue] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setValue(new Date()), interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { date: dateOf(value), time: timeOf(value.getHours() * 60 + value.getMinutes()), value };
}
