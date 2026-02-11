import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/ws': {
          target: 'http://localhost:8080',
          ws: true,
          changeOrigin: true,
          secure: false,
          rewriteWsOrigin: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
