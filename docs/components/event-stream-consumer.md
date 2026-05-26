# EventStreamConsumer

`EventStreamConsumer` is a high-level declarative render-prop React component that makes it easy to hook into and consume real-time event streams from standard `EventTarget` interfaces—such as `WebSocket`, `EventSource` (Server-Sent Events), custom native events, or custom background workers.

## Features

- 🔌 **Dynamic WebSockets & SSE**: Connects and listens to native streams effortlessly.
- 🧹 **Automatic Listener Management**: Registers listeners on mount and automatically unbinds/cleans up when unmounting or when targets change to avoid memory leaks.
- 📦 **Smart Parsing**: Automatically detects `MessageEvent` or `CustomEvent` data payloads and optionally parses them as JSON.

---

## WebSocket Example

Here is a standard example of capturing real-time crypto price updates via a public WebSocket using `EventStreamConsumer`:

```tsx
import React, { useMemo } from 'react';
import { EventStreamConsumer } from 'react-consumer';

const App = () => {
  // Use useMemo to prevent creating a new WebSocket connection on every render
  const socket = useMemo(() => new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade'), []);

  return (
    <EventStreamConsumer
      eventStream={socket}
      eventName="message"
      parseJson={true}
    >
      {(data, pending, error) => {
        if (pending) return <div>Connecting to WebSocket stream...</div>;
        if (error) return <div>Stream Error: {error.message}</div>;
        if (!data) return <div>Waiting for first event...</div>;

        return (
          <div>
            <h3>BTC/USDT Real-time Price</h3>
            <p><strong>Price:</strong> ${parseFloat(data.p).toFixed(2)}</p>
            <p><strong>Quantity:</strong> {data.q}</p>
          </div>
        );
      }}
    </EventStreamConsumer>
  );
};

export default App;
```

---

## Server-Sent Events (SSE) / EventSource Example

You can also easily consume Server-Sent Events (SSE) from an `EventSource`:

```tsx
const sseSource = () => new EventSource('https://api.example.com/live-news');

// ...
<EventStreamConsumer
  eventStream={sseSource}
  eventName="news-flash"
>
  {(data, pending, error) => {
    if (pending) return <div>Connecting to live news feed...</div>;
    if (error) return <div>Feed disconnected: {error.message}</div>;

    return (
      <div className="news-alert">
        <h4>{data?.headline}</h4>
        <p>{data?.summary}</p>
      </div>
    );
  }}
</EventStreamConsumer>
```

---

## API Reference

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `eventStream` | `EventTarget \| (() => EventTarget)` | *Required* | The event emitter target (WebSocket, EventSource, Custom Emitter) or a lazy creator function returning the target. |
| `eventName` | `string` | *Required* | The name of the event to register listeners for (e.g. `'message'`, `'news'`, etc.). |
| `parseJson` | `boolean` | `true` | When `true`, automatically parses standard event payloads (`event.data` or `event.detail`) as JSON. |
| `children` | `Function` | *Required* | The render-prop function that receives the active event stream status. See signature below. |

### Render-Prop Signature

The `children` function receives the following arguments in order:

1. **`data: T | null`** - The latest parsed message or custom data payload received from the stream.
2. **`pending: boolean`** - Indicates if the stream listener is active and waiting for the first event to arrive.
3. **`error: Error | null`** - Contains any network, connection, or parsing error that occurred.
4. **`status: FetchStatus`** - A status string: `'idle' | 'pending' | 'success' | 'error'`.
