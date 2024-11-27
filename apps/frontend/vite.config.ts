import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
    proxy: {
      '/main': {
        target: 'http://localhost:5173', // Ваш dev-сервер
        rewrite: () => 'src/pages/messenger.html',
      },
    },
  },
});
