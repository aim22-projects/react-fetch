# FetchConsumer

`FetchConsumer` is a declarative, render-prop React component for consuming data from HTTP fetch requests. It supports automated request cancellation (`AbortController`), JSON/text parsing, and accepts custom fetchers.

## Features

- 🌐 **Declarative Syntax**: No more manually managing `useEffect`, `useState`, or state flags.
- 🛑 **Automatic Cancellation**: Cancels pending requests using `AbortController` when the URL changes or the component unmounts to prevent memory leaks.
- 🛠️ **Custom Fetcher Support**: Fully compatible with custom fetch implementations (like `axios` wrappers, authenticated clients, or mock fetchers).
- 📱 **Multi-Platform**: Works out of the box on both React Web and React Native.

---

## Basic Usage

Here is a standard example of fetching a single item using `FetchConsumer`:

```tsx
import React from 'react';
import { FetchConsumer } from 'react-consumer';

const App = () => {
  return (
    <FetchConsumer url="https://jsonplaceholder.typicode.com/todos/1">
      {(data, pending, error, status, response) => {
        if (pending) return <div>Loading...</div>;
        if (error) return <div>Error: {error.message}</div>;
        if (!data) return <div>No data available</div>;

        return (
          <div>
            <h3>Todo Item</h3>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Title:</strong> {data.title}</p>
            <p><strong>HTTP Status:</strong> {response?.status}</p>
          </div>
        );
      }}
    </FetchConsumer>
  );
};

export default App;
```

---

## Dynamic Fetching

You can pass a function that returns a URL to perform dynamic fetching. If the URL function evaluates to an empty/null string, `FetchConsumer` will clear all states and sit in an `idle` state.

```tsx
<FetchConsumer url={() => (userId ? `https://api.example.com/users/${userId}` : '')}>
  {(data, pending, error, status) => {
    if (status === 'idle') return <div>Select a user to load data...</div>;
    if (pending) return <div>Loading User...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return <UserProfile user={data} />;
  }}
</FetchConsumer>
```

---

## API Reference

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string \| (() => string)` | *Required* | The target URL to fetch from, or a lazy function returning the target URL. |
| `init` | `RequestInit` | `undefined` | Optional fetch configurations (e.g. methods, headers, body). |
| `fetcher` | `typeof fetch` | `globalThis.fetch` | Optional custom fetch implementation to override the native `fetch`. |
| `parseJson` | `boolean` | `true` | When `true`, automatically parses the response as JSON. Otherwise, reads it as plain text. |
| `children` | `Function` | *Required* | The render-prop function that receives the request state. See signature below. |

### Render-Prop Signature

The `children` function receives the following arguments in order:

1. **`data: T | null`** - The fetched and parsed payload (or `null` if loading, errored, or idle).
2. **`pending: boolean`** - A boolean flag indicating if the HTTP request is currently active.
3. **`error: Error | null`** - Contains any network or parsing error encountered during the fetch.
4. **`status: FetchStatus`** - A high-level status string: `'idle' | 'pending' | 'success' | 'error'`.
5. **`response: Response | null`** - The full native `Response` object returned by the fetcher (useful for inspecting headers, status codes, etc.).
