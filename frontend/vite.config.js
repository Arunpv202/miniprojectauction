import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(),tailwindcss()],
	proxy: {
		"/api": {
			target: import.meta.env.VITE_API_URL || "http://localhost:8045", // Use env variable or fallback to localhost
			changeOrigin: true,
		},
	},
	server: {
		port: 3000,
		host: true,
	},
});