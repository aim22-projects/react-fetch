# react-fetch

a component library to simplify GET api calls. api

## Installation


```sh
npm install react-fetch
```


## Usage

```tsx
import { FetchResolver, PromiseResolver } from 'react-fetch';
import { Text } from 'react-native';

function Example() {
  return (
    <>
      <FetchResolver url={() => 'https://api.example.com/data'}>
        {(data, pending, error, status, response) => {
          if (pending) {
            return <Text>Loading…</Text>;
          }
          if (error) {
            return <Text>Error: {error.message}</Text>;
          }
          return <Text>Status: {status}, Data: {JSON.stringify(data)}</Text>;
        }}
      </FetchResolver>

      <PromiseResolver promise={fetch('https://api.example.com/data').then((res) => res.json())}>
        {(data, pending, error, status) => {
          if (pending) {
            return <Text>Waiting for promise…</Text>;
          }
          if (error) {
            return <Text>Error: {error.message}</Text>;
          }
          return <Text>Promise result: {JSON.stringify(data)}</Text>;
        }}
      </PromiseResolver>
    </>
  );
}
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
