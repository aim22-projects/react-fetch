import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type FetchStatus = 'idle' | 'pending' | 'success' | 'error';

export interface PromiseConsumerProps<T = unknown> {
  promise: Promise<T> | (() => Promise<T>);
  children: (
    data: T | null,
    pending: boolean,
    error: Error | null,
    status: FetchStatus
  ) => ReactNode;
}

export function PromiseConsumer<T = unknown>(
  props: PromiseConsumerProps<T>
): ReactNode {
  const { promise, children } = props;
  const resolvedPromise = useMemo(
    () => (typeof promise === 'function' ? promise() : promise),
    [promise]
  );

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');

  useEffect(() => {
    let active = true;

    setStatus('pending');
    setData(null);
    setError(null);

    resolvedPromise
      .then((result) => {
        if (!active) {
          return;
        }
        setData(result);
        setStatus('success');
      })
      .catch((caughtError) => {
        if (!active) {
          return;
        }
        const nextError =
          caughtError instanceof Error
            ? caughtError
            : new Error(String(caughtError));
        setError(nextError);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [resolvedPromise]);

  return children(data, status === 'pending', error, status);
}

export default PromiseConsumer;
