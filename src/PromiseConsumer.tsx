import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Status of a promise resolution
 * @type FetchStatus
 * - 'idle': Initial state before promise is executed
 * - 'pending': Promise is in progress
 * - 'success': Promise resolved successfully
 * - 'error': Promise rejected with an error
 */
export type FetchStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Props for the PromiseConsumer component
 * @template T - The type of data the promise resolves to
 */
export interface PromiseConsumerProps<T = unknown> {
  /** The promise to consume, or a function that returns a promise */
  promise: Promise<T> | (() => Promise<T>);
  /** Render function that receives the promise state */
  children: (
    data: T | null,
    pending: boolean,
    error: Error | null,
    status: FetchStatus
  ) => ReactNode;
}

/**
 * PromiseConsumer - A render-prop component for consuming any Promise
 *
 * Useful for complex async operations beyond simple fetch requests.
 * The promise can be a function for lazy evaluation.
 *
 * @template T - The type of data the promise resolves to
 * @param props - PromiseConsumerProps
 * @returns ReactNode
 *
 * @example
 * ```tsx
 * <PromiseConsumer promise={async () => {
 *   const res = await fetch('https://api.example.com/data');
 *   return res.json();
 * }}>
 *   {(data, pending, error, status) => {
 *     if (pending) return <Text>Loading…</Text>;
 *     if (error) return <Text>Error: {error.message}</Text>;
 *     return <Text>{JSON.stringify(data)}</Text>;
 *   }}
 * </PromiseConsumer>
 * ```
 */
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
