import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all addresses so Docker can expose the port
    port: 5173,
    // The browser calls /api/...; Vite forwards it to the backend and drops "/api".
    // Same origin for the browser = no CORS setup needed.
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom', // fake browser so components can render in tests
    globals: true, // lets Testing Library clean up the page between tests automatically
  },
})
