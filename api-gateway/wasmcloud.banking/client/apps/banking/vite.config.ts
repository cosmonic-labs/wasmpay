import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(async (env) => {
  const {mode} = env;
  const isDevelopment = mode === 'development';
  const shouldMock = isDevelopment && process.env.MOCK === 'true';
  console.log(
    shouldMock
      ? `[API] Detected ${mode} environment, mocking API calls`
      : '[API] Running in production mode for API',
  );

  return {
    resolve: {
      alias: {
        ...(shouldMock
          ? {'#services/backend/api/index.ts': '#services/backend/mocks/index.ts'}
          : {}),
      },
    },
    plugins: [tsconfigPaths(), react()],
  };
});
