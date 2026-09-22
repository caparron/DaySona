import { useEffect, useRef, useState } from 'react';

export function useNow(intervalMs: number = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  const ref = useRef(now);
  ref.current = now;
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
