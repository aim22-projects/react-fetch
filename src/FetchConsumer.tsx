import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Status of a fetch request
 * @type FetchStatus
 * - 'idle': Initial state before fetch starts
 * - 'pending': Fetch is in progress
 * - 'success': Fetch completed successfully
 * - 'error': Fetch failed
 */
export type FetchStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Render state passed to FetchConsumer children function
 * @template T - The type of data being fetched
 */
export interface FetchConsumerRenderState<T> {
  /** The fetched data, or null if not yet loaded */
  data: T | null;
  /** Whether the fetch is currently pending */
  pending: boolean;
  /** Any error that occurred during the fetch */
  error: Error | null;
  /** Current status of the fetch */
  status: FetchStatus;
  /** The Response object from fetch, or null */
  response: Response | null;
}

/**
 * Props for the FetchConsumer component
 * @template T - The type of data being fetched
 */
export interface FetchConsumerProps<T = unknown> {
  /** The URL to fetch from, or a function that returns a URL */
  url: string | (() => string);
  /** Optional fetch options (headers, method, body, etc.) */
  init?: RequestInit;
  /** Optional custom fetch implementation */
  fetcher?: typeof fetch;
  /** Whether to parse the response as JSON (default: true) */
  parseJson?: boolean;
  /** Render function that receives the fetch state */
  children: (
    data: T | null,
    pending: boolean,
    error: Error | null,
    status: FetchStatus,
    response: Response | null
  ) => ReactNode;
}

/**
 * FetchConsumer - A render-prop component for consuming data from HTTP fetch requests
 *
 * @template T - The type of data being fetched
 * @param props - FetchConsumerProps
 * @returns ReactNode
 *
 * @example
 * ```tsx
 * <FetchConsumer url="https://api.example.com/data">
 *   {(data, pending, error, status, response) => {
 *     if (pending) return <Text>Loading…</Text>;
 *     if (error) return <Text>Error: {error.message}</Text>;
 *     return <Text>{JSON.stringify(data)}</Text>;
 *   }}
 * </FetchConsumer>
 * ```
 */
export function FetchConsumer<T = unknown>(
  props: FetchConsumerProps<T>
): ReactNode {
  const { url, init, fetcher, parseJson = true, children } = props;
  const resolvedUrl = useMemo(
    () => (typeof url === 'function' ? url() : url),
    [url]
  );
  const fetchImpl = fetcher ?? globalThis.fetch;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [response, setResponse] = useState<Response | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const signal = controller.signal;

    if (!resolvedUrl) {
      setData(null);
      setError(null);
      setResponse(null);
      setStatus('idle');
      return () => {
        active = false;
        controller.abort();
      };
    }

    async function load() {
      setStatus('pending');
      setError(null);
      setResponse(null);

      if (typeof fetchImpl !== 'function') {
        const fetchError = new Error('Fetch implementation is not available');
        if (active) {
          setError(fetchError);
          setStatus('error');
        }
        return;
      }

      try {
        const res = await fetchImpl(resolvedUrl, { ...init, signal });
        if (!active) {
          return;
        }

        setResponse(res);

        let payload: T | null = null;
        if (parseJson) {
          payload = (await res.json()) as T;
        } else {
          payload = (await res.text()) as unknown as T;
        }

        if (!active) {
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        setData(payload);
        setStatus('success');
      } catch (caughtError) {
        if (!active) {
          return;
        }

        const nextError =
          caughtError instanceof Error
            ? caughtError
            : new Error(String(caughtError));
        setError(nextError);
        setStatus('error');
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [resolvedUrl, fetchImpl, init, parseJson]);

  return children(data, status === 'pending', error, status, response);
}

export default FetchConsumer;
