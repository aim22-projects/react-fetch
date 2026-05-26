# PromiseConsumer

`PromiseConsumer` is a powerful render-prop React component designed to consume and resolve *any* generic standard JavaScript Promise. It is highly useful for managing custom asynchronous actions beyond simple fetch calls—such as batch processing, database transactions, file reads, or complex multi-step workflows.

## Features

- ⚡ **Dynamic Resolving**: Consumes a `Promise` directly or executes a lazy loader function returning a promise.
- 🔄 **Automatic Lifecycle Hooks**: Manages standard states (`pending`, `success`, `error`) and resets automatically when the promise reference changes.
- 📱 **Framework Agnostic Async**: Resolves database, local storage, custom APIs, or native plugins transparently.

---

## Basic Usage

Here is a basic example of resolving a mock Promise using `PromiseConsumer`:

```tsx
import React from 'react';
import { PromiseConsumer } from 'react-consumer';

const mockAsyncTask = () => 
  new Promise((resolve) => setTimeout(() => resolve("Task Completed!"), 2000));

const App = () => {
  return (
    <PromiseConsumer promise={mockAsyncTask}>
      {(data, pending, error, status) => {
        if (pending) return <div>Resolving async action...</div>;
        if (error) return <div>Error: {error.message}</div>;

        return (
          <div>
            <h3>Status: {status}</h3>
            <p>Data received: {data}</p>
          </div>
        );
      }}
    </PromiseConsumer>
  );
};

export default App;
```

---

## Lazy Evaluated Promises

By passing a function that returns a Promise, you can trigger dynamic promises dynamically only when dependencies or state changes, avoiding immediate executions on initial render:

```tsx
const loadUserProfile = async () => {
  const user = await myCustomDb.getUser(userId);
  const preferences = await myCustomDb.getPrefs(userId);
  return { ...user, preferences };
};

// ...
<PromiseConsumer promise={() => loadUserProfile()}>
  {(data, pending, error) => {
    if (pending) return <div>Resolving profile details...</div>;
    if (error) return <div>Failed to load: {error.message}</div>;
    return <Dashboard user={data} />;
  }}
</PromiseConsumer>
```

---

## API Reference

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `promise` | `Promise<T> \| (() => Promise<T>)` | *Required* | The dynamic JS Promise to be resolved, or a lazy loader function returning a Promise. |
| `children` | `Function` | *Required* | The render-prop function that receives the resolution state. See signature below. |

### Render-Prop Signature

The `children` function receives the following arguments in order:

1. **`data: T | null`** - The resolved result from the Promise (or `null` if loading, errored, or idle).
2. **`pending: boolean`** - A boolean flag indicating if the Promise is currently in the process of resolving.
3. **`error: Error | null`** - Contains any error thrown/rejected by the Promise.
4. **`status: FetchStatus`** - A status string: `'idle' | 'pending' | 'success' | 'error'`.
