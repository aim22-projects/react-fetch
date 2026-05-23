import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { FetchResolver, PromiseResolver } from 'react-fetch';

const todoUrl = 'https://jsonplaceholder.typicode.com/todos/1';
const postPromise = fetch('https://jsonplaceholder.typicode.com/posts/1').then(
  (res) => res.json()
);

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>react-fetch example</Text>

      <View style={styles.card}>
        <Text style={styles.title}>FetchResolver</Text>
        <FetchResolver url={() => todoUrl}>
          {(data, pending, error, status) => {
            if (pending) {
              return <Text>Loading todo…</Text>;
            }
            if (error) {
              return <Text style={styles.error}>Error: {error.message}</Text>;
            }
            return (
              <Text>
                status={status} data={JSON.stringify(data)}
              </Text>
            );
          }}
        </FetchResolver>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>PromiseResolver</Text>
        <PromiseResolver promise={postPromise}>
          {(data, pending, error, status) => {
            if (pending) {
              return <Text>Resolving promise…</Text>;
            }
            if (error) {
              return <Text style={styles.error}>Error: {error.message}</Text>;
            }
            return (
              <Text>
                status={status} data={JSON.stringify(data)}
              </Text>
            );
          }}
        </PromiseResolver>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9fb',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  error: {
    color: '#b00020',
  },
});
