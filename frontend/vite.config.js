import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true, // Allow access from network
      port: 5173,
    },
    envDir: './',
    // Use .env.mobile for mobile mode
    define: mode === 'mobile' ? {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://10.0.0.78:8000/api/v1')
    } : {}
  }
})
