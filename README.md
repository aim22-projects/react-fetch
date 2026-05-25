# react-consumer

a component library to consume async data and promises. 

## Installation

```sh
npm install react-consumer
```

## Usage

```tsx
import { FetchConsumer, PromiseConsumer } from 'react-consumer';
import { Text } from 'react-native';

function Example() {
  return (
    <>
      <FetchConsumer url={() => 'https://api.example.com/data'}>
        {(data, pending, error, status, response) => {
          if (pending) {
            return <Text>Loading…</Text>;
          }
          if (error) {
            return <Text>Error: {error.message}</Text>;
          }
          return (
            <Text>
              Status: {status}, Data: {JSON.stringify(data)}
            </Text>
          );
        }}
      </FetchConsumer>

      <PromiseConsumer
        promise={fetch('https://api.example.com/data').then((res) =>
          res.json()
        )}
      >
        {(data, pending, error, status) => {
          if (pending) {
            return <Text>Waiting for promise…</Text>;
          }
          if (error) {
            return <Text>Error: {error.message}</Text>;
          }
          return <Text>Promise result: {JSON.stringify(data)}</Text>;
        }}
      </PromiseConsumer>
    </>
  );
}
```

## API

- **FetchConsumer**: a render-prop component that accepts `url`, optional `init`, optional `fetcher`, and `parseJson`.
  - children signature: `(data, pending, error, status, response) => ReactNode`.

- **PromiseConsumer**: a render-prop component that accepts a `promise` or `() => Promise<T>`.
  - children signature: `(data, pending, error, status) => ReactNode`.

Both components also have backward-compatible aliases exported:

- `FetchResolver` → alias for `FetchConsumer`.
- `PromiseResolver` → alias for `PromiseConsumer`.
- `Fetch` → alias for `FetchConsumer`.
- `WithPromise` → alias for `PromiseConsumer`.

## Importing only what you need

Import the named exports from the package root to allow bundlers to tree-shake unused code:

```js
import { FetchConsumer } from 'react-consumer';
```

Avoid deep/relative imports into package internals (for example, `react-consumer/src/FetchConsumer`), as those import paths are not part of the public package contract and may not be supported by the published package. Rely on named exports from the package root for a stable public API.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
