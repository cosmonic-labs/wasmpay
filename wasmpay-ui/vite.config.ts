import {defineConfig, UserConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import copyBuild from 'vite-plugin-build-copy';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tsconfigPaths({}),
      react(),
      tailwindcss(),
      copyBuild({
        copyDir: '../api-gateway/static/dist',
      }),
    ],
  } satisfies UserConfig;
});
