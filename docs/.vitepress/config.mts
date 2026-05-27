import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "React Consumer",
  description: "React and React Native async data render-prop wrappers.",
  base: '/react-consumer/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/components/fetch-consumer' }
    ],

    sidebar: [
      {
        text: 'Components',
        items: [
          { text: 'FetchConsumer', link: '/components/fetch-consumer' },
          { text: 'PromiseConsumer', link: '/components/promise-consumer' },
          { text: 'EventStreamConsumer', link: '/components/event-stream-consumer' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aim22-projects/react-consumer' }
    ]
  }
})
