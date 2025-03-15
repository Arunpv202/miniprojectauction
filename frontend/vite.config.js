import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load environment variables properly
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8045",  // Correct way to access env
          changeOrigin: true,
        },
      },
    },
  };
});
