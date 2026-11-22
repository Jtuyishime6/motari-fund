import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  server: {
    proxy: { '/api': 'http://localhost:4000' },
    // shared/rules.js lives at the repo root and is used by both the API and the web app
    fs: { allow: ['..'] }
  },
  build: {
    rollupOptions: {
      output: { manualChunks: { react: ['react', 'react-dom'], motion: ['framer-motion'], supabase: ['@supabase/supabase-js'] } }
    }
  }
});
