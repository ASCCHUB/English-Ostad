import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Older Android System WebViews do not understand modern media-query ranges.
  // Keep max-width/min-width rules and compatible colors in the packaged CSS.
  build: { cssTarget: 'chrome61' },
})
