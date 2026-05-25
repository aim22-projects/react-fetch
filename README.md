# react-consumer

A component library to consume async data from fetch requests, promises, and event streams. Provides render-prop components for managing async state in React and React Native.

## Installation

```sh
npm install react-consumer
```

## Components

### FetchConsumer

A render-prop component for consuming data from HTTP fetch requests. Manages loading, success, and error states automatically.

#### Props

- `url` (required): `string | (() => string)` - The URL to fetch from. Can be a function for dynamic URLs.
- `init` (optional): `RequestInit` - Fetch options (headers, method, body, etc.)
- `fetcher` (optional): `typeof fetch` - Custom fetch implementation (defaults to global fetch)
- `parseJson` (optional): `boolean` - Whether to parse response as JSON (default: `true`)
- `children` (required): `(data, pending, error, status, response) => ReactNode` - Render function

#### Status Values

- `'idle'` - Initial state before fetch starts
- `'pending'` - Fetch is in progress
- `'success'` - Fetch completed successfully
- `'error'` - Fetch failed

#### Example

```tsx
import { FetchConsumer } from 'react-consumer';
import { Text, View } from 'react-native';

function UserProfile({ userId }: { userId: string }) {
  return (
    <FetchConsumer url={`https://api.example.com/users/${userId}`}>
      {(data, pending, error, status, response) => {
        if (pending) {
          return <Text>Loading user…</Text>;
        }
        if (error) {
          return <Text style={{ color: 'red' }}>Error: {error.message}</Text>;
        }
        return (
          <View>
            <Text>User: {data?.name}</Text>
            <Text>Status Code: {response?.status}</Text>
          </View>
        );
      }}
    </FetchConsumer>
  );
}
```

#### Example with Custom Headers

```tsx
<FetchConsumer
  url="https://api.example.com/data"
  init={{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }}
>
  {(data, pending, error, status, response) => {
    if (pending) return <Text>Loading…</Text>;
    if (error) return <Text>Error: {error.message}</Text>;
    return <Text>{JSON.stringify(data)}</Text>;
  }}
</FetchConsumer>
```

---

### PromiseConsumer

A render-prop component for consuming data from any Promise. Useful for complex async operations beyond simple fetch requests.

#### Props

- `promise` (required): `Promise<T> | (() => Promise<T>)` - The promise to consume. Can be a function for lazy evaluation.
- `children` (required): `(data, pending, error, status) => ReactNode` - Render function

#### Status Values

Same as FetchConsumer: `'idle' | 'pending' | 'success' | 'error'`

#### Example

```tsx
import { PromiseConsumer } from 'react-consumer';
import { Text, View } from 'react-native';

function DataProcessor() {
  const processData = async () => {
    const response = await fetch('https://api.example.com/data');
    const json = await response.json();
    // Complex processing
    return json.map((item: any) => item.value);
  };

  return (
    <PromiseConsumer promise={processData}>
      {(data, pending, error, status) => {
        if (pending) {
          return <Text>Processing data…</Text>;
        }
        if (error) {
          return <Text style={{ color: 'red' }}>Error: {error.message}</Text>;
        }
        return (
          <View>
            <Text>Processed items: {data?.length}</Text>
            {data?.map((item: any, idx: number) => (
              <Text key={idx}>{item}</Text>
            ))}
          </View>
        );
      }}
    </PromiseConsumer>
  );
}
```

#### Example with Lazy Promise

```tsx
<PromiseConsumer promise={() => new Promise((resolve) => {
  setTimeout(() => resolve({ message: 'Hello!' }), 2000);
})}>
  {(data, pending, error, status) => {
    if (pending) return <Text>Waiting 2 seconds…</Text>;
    if (error) return <Text>Error: {error.message}</Text>;
    return <Text>{data?.message}</Text>;
  }}
</PromiseConsumer>
```

---

### EventStreamConsumer

A render-prop component for consuming data from event streams (WebSocket, Server-Sent Events, custom events, etc.).

#### Props

- `eventStream` (required): `EventTarget | (() => EventTarget)` - The event source to listen to. Can be a function for lazy initialization.
- `eventName` (required): `string` - The event name to listen for
- `parseJson` (optional): `boolean` - Whether to parse event data as JSON (default: `true`)
- `children` (required): `(data, pending, error, status) => ReactNode` - Render function

#### Status Values

- `'idle'` - Initial state before listening
- `'pending'` - Waiting for first event
- `'success'` - Event received successfully
- `'error'` - Error occurred on event stream

#### Example with Custom Event

```tsx
import { EventStreamConsumer } from 'react-consumer';
import { Text, View, Button } from 'react-native';

function EventListener() {
  const eventTarget = new EventTarget();

  return (
    <View>
      <Button
        title="Emit Event"
        onPress={() => {
          const event = new CustomEvent('data', {
            detail: { message: 'Hello from event!' }
          });
          eventTarget.dispatchEvent(event);
        }}
      />

      <EventStreamConsumer
        eventStream={eventTarget}
        eventName="data"
      >
        {(data, pending, error, status) => {
          if (pending) {
            return <Text>Waiting for events…</Text>;
          }
          if (error) {
            return <Text style={{ color: 'red' }}>Error: {error.message}</Text>;
          }
          return <Text>Received: {data?.message}</Text>;
        }}
      </EventStreamConsumer>
    </View>
  );
}
```

#### Example with WebSocket

```tsx
<EventStreamConsumer
  eventStream={() => {
    return new WebSocket('wss://echo.websocket.org/');
  }}
  eventName="message"
  parseJson={true}
>
  {(data, pending, error, status) => {
    if (pending) {
      return <Text>Connecting…</Text>;
    }
    if (error) {
      return <Text style={{ color: 'red' }}>Connection error: {error.message}</Text>;
    }
    return <Text>Message: {JSON.stringify(data)}</Text>;
  }}
</EventStreamConsumer>
```

---

## Backward Compatibility

All components have backward-compatible aliases:

- `FetchResolver` → alias for `FetchConsumer`
- `PromiseResolver` → alias for `PromiseConsumer`
- `Fetch` → alias for `FetchConsumer`
- `WithPromise` → alias for `PromiseConsumer`

You can still use the old names, but new code should use the `*Consumer` naming:

```tsx
// Old (still works)
import { FetchResolver, PromiseResolver } from 'react-consumer';

// New (recommended)
import { FetchConsumer, PromiseConsumer } from 'react-consumer';
```

## Importing

Import the named exports from the package root to allow bundlers to tree-shake unused code:

```tsx
import { FetchConsumer, PromiseConsumer, EventStreamConsumer } from 'react-consumer';
```

Avoid deep/relative imports into package internals (for example, `react-consumer/src/FetchConsumer`), as those import paths are not part of the public package contract and may not be supported by the published package.

## Common Patterns

### Retry Logic

```tsx
const [retryCount, setRetryCount] = useState(0);

<FetchConsumer
  url={`https://api.example.com/data?retry=${retryCount}`}
>
  {(data, pending, error, status) => (
    <View>
      {error && (
        <Button
          title={`Retry (${retryCount})`}
          onPress={() => setRetryCount(c => c + 1)}
        />
      )}
      {/* render data */}
    </View>
  )}
</FetchConsumer>
```

### Dependent Fetches

```tsx
<FetchConsumer url="https://api.example.com/user">
  {(user, pending, error) => (
    pending ? <Text>Loading user…</Text> :
    error ? <Text>Error loading user</Text> :
    <FetchConsumer url={`https://api.example.com/posts?userId=${user?.id}`}>
      {(posts, pendingPosts, errorPosts) => (
        // render posts
      )}
    </FetchConsumer>
  )}
</FetchConsumer>
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
