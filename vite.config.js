import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Include the React plugin
  server: {
    host: '0.0.0.0', // Exposes the server for external access
    port: process.env.PORT || 3000, // Uses the PORT environment variable
  },
});
