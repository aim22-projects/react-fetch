export { default as FetchConsumer } from './FetchConsumer';
export type {
  FetchConsumerProps,
  FetchConsumerRenderState,
} from './FetchConsumer';

export { default as PromiseConsumer } from './PromiseConsumer';
export type { PromiseConsumerProps } from './PromiseConsumer';

export { default as EventStreamConsumer } from './EventStreamConsumer';
export type { EventStreamConsumerProps } from './EventStreamConsumer';

// Aliases for backward compatibility
export { default as FetchResolver } from './FetchConsumer';
export type {
  FetchConsumerProps as FetchResolverProps,
  FetchConsumerRenderState as FetchResolverRenderState,
} from './FetchConsumer';

export { default as PromiseResolver } from './PromiseConsumer';
export type { PromiseConsumerProps as PromiseResolverProps } from './PromiseConsumer';

export { default as Fetch } from './FetchConsumer';
export { default as WithPromise } from './PromiseConsumer';
