---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "React Consumer"
  text: "Declarative Async Data Fetching"
  tagline: Lightweight, render-prop wrappers for consuming fetch requests, promises, and real-time event streams in React and React Native.
  image:
    src: /logo.png
    alt: React Consumer Logo
  actions:
    - theme: brand
      text: Get Started
      link: /components/fetch-consumer
    - theme: alt
      text: GitHub
      link: https://github.com/aim22-projects/react-fetch

features:
  - title: 🌐 Declarative HTTP Fetch
    details: Consume REST APIs declaratively with automatic request cancellation (AbortController), loading indicators, custom fetchers, and JSON parsing.
  - title: ⚡ Promise Resolution
    details: Easily resolve any async task or dynamic Promise with support for auto-updating states, idle status, and errors.
  - title: 🔌 Real-time Streams
    details: Hook into WebSockets, Server-Sent Events, or custom EventTargets. Automatically registers and tears down event listeners cleanly.
  - title: 🚀 Ultra Lightweight
    details: Zero external dependencies. Extremely lightweight with minimal footprint, perfectly suited for both React Web and React Native environments.
---
