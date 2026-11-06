import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {devOfflineResetWorker} from './scripts/dev-offline-reset.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),{
    name:'reset-old-offline-worker-in-development',
    apply:'serve',
    configureServer(server){
      server.middlewares.use((req,res,next)=>{
        if(req.url?.split('?')[0]!=='/sw.js')return next();
        res.setHeader('Content-Type','text/javascript');
        res.setHeader('Cache-Control','no-store');
        res.end(devOfflineResetWorker);
      });
    },
  }],
  optimizeDeps:{entries:['index.html']},
  server:{watch:{ignored:['**/android/**','**/ios/**','**/output/**']}},
  // Older Android System WebViews do not understand modern media-query ranges.
  // Keep max-width/min-width rules and compatible colors in the packaged CSS.
  build: { cssTarget: 'chrome61' },
})
