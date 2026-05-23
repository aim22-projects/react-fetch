import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type FetchStatus = 'idle' | 'pending' | 'success' | 'error';

export interface FetchResolverRenderState<T> {
  data: T | null;
  pending: boolean;
  error: Error | null;
  status: FetchStatus;
  response: Response | null;
}

export interface FetchResolverProps<T = unknown> {
  url: string | (() => string);
  init?: RequestInit;
  fetcher?: typeof fetch;
  parseJson?: boolean;
  children: (
    data: T | null,
    pending: boolean,
    error: Error | null,
    status: FetchStatus,
    response: Response | null
  ) => ReactNode;
}

export function FetchResolver<T = unknown>(
  props: FetchResolverProps<T>
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

export default FetchResolver;
