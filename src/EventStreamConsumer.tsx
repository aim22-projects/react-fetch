import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Status of an event stream
 * @type FetchStatus
 * - 'idle': Initial state before listening to events
 * - 'pending': Waiting for the first event
 * - 'success': Event received successfully
 * - 'error': An error occurred on the event stream
 */
export type FetchStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Props for the EventStreamConsumer component
 * @template T - The type of data from the event stream
 */
export interface EventStreamConsumerProps<T = unknown> {
  /** The event target to listen to, or a function that returns an event target */
  eventStream: EventTarget | (() => EventTarget);
  /** The event name to listen for */
  eventName: string;
  /** Whether to parse event data as JSON (default: true) */
  parseJson?: boolean;
  /** Render function that receives the event stream state */
  children: (
    data: T | null,
    pending: boolean,
    error: Error | null,
    status: FetchStatus
  ) => ReactNode;
}

/**
 * EventStreamConsumer - A render-prop component for consuming event streams
 *
 * Supports any EventTarget (WebSocket, Server-Sent Events, custom events, etc.).
 * Handles both MessageEvent and CustomEvent data formats.
 *
 * @template T - The type of data from the event stream
 * @param props - EventStreamConsumerProps
 * @returns ReactNode
 *
 * @example
 * ```tsx
 * // With WebSocket
 * <EventStreamConsumer
 *   eventStream={() => new WebSocket('wss://example.com')}
 *   eventName="message"
 * >
 *   {(data, pending, error, status) => {
 *     if (pending) return <Text>Connecting…</Text>;
 *     if (error) return <Text>Error: {error.message}</Text>;
 *     return <Text>Message: {JSON.stringify(data)}</Text>;
 *   }}
 * </EventStreamConsumer>
 * ```
 *
 * @example
 * ```tsx
 * // With custom events
 * <EventStreamConsumer
 *   eventStream={eventEmitter}
 *   eventName="data"
 * >
 *   {(data, pending, error, status) => {
 *     if (pending) return <Text>Waiting…</Text>;
 *     if (error) return <Text>Error: {error.message}</Text>;
 *     return <Text>{data?.message}</Text>;
 *   }}
 * </EventStreamConsumer>
 * ```
 */
export function EventStreamConsumer<T = unknown>(
  props: EventStreamConsumerProps<T>
): ReactNode {
  const { eventStream, eventName, parseJson = true, children } = props;
  const resolvedEventStream = useMemo(
    () => (typeof eventStream === 'function' ? eventStream() : eventStream),
    [eventStream]
  );

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');

  useEffect(() => {
    let active = true;

    const handleEvent = (event: Event) => {
      if (!active) {
        return;
      }

      try {
        setStatus('pending');
        setError(null);

        let payload: T | null = null;
        const anyEvent = event as unknown as Record<string, unknown>;

        // Handle MessageEvent (from WebSocket, Worker, etc.)
        if (typeof anyEvent.data !== 'undefined') {
          const eventData = anyEvent.data;
          if (parseJson && typeof eventData === 'string') {
            payload = JSON.parse(eventData) as T;
          } else {
            payload = eventData as T;
          }
        }
        // Handle CustomEvent (from dispatchEvent with detail)
        else if (typeof anyEvent.detail !== 'undefined') {
          const detail = anyEvent.detail;
          if (parseJson && typeof detail === 'string') {
            payload = JSON.parse(detail) as T;
          } else {
            payload = detail as T;
          }
        } else {
          payload = event as unknown as T;
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
    };

    const handleError = (event: Event) => {
      if (!active) {
        return;
      }

      const anyEvent = event as unknown as Record<string, unknown>;
      const message = anyEvent.message;
      const nextError = new Error(
        typeof message === 'string'
          ? message
          : 'An error occurred on the event stream'
      );
      setError(nextError);
      setStatus('error');
    };

    setStatus('pending');
    setData(null);
    setError(null);

    resolvedEventStream.addEventListener(eventName, handleEvent);
    resolvedEventStream.addEventListener('error', handleError);

    return () => {
      active = false;
      resolvedEventStream.removeEventListener(eventName, handleEvent);
      resolvedEventStream.removeEventListener('error', handleError);
    };
  }, [resolvedEventStream, eventName, parseJson]);

  return children(data, status === 'pending', error, status);
}

export default EventStreamConsumer;
