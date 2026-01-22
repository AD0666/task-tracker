import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
// Uses a proxy in development to avoid CORS issues with Google Apps Script
export default defineConfig(({ mode }) => {
  // Load environment variables (reads app/frontend/.env)
  const env = loadEnv(mode, process.cwd(), '');
  const APPS_SCRIPT_URL = env.VITE_API_BASE_URL;

  // Build a proxy config that always matches type Record<string, string | ProxyOptions>
  const proxy: Record<string, string | { target: string; changeOrigin?: boolean; rewrite?: (path: string) => string; configure?: (proxy: any, options: any) => void }> = {};

  if (APPS_SCRIPT_URL) {
    // In development with Apps Script: proxy /api/* to the Web App URL
    // Apps Script Web Apps need the path after /exec for pathInfo
    // So /api/auth/login becomes https://.../exec/auth/login
    proxy['/api'] = {
      target: APPS_SCRIPT_URL,
      changeOrigin: true,
      // Rewrite path: /api/auth/login -> /auth/login
      // Apps Script will receive this as pathInfo: "auth/login"
      rewrite: (path: string) => {
        const newPath = path.replace(/^\/api/, '');
        console.log(`[Vite Proxy] Rewriting ${path} -> ${newPath}, target: ${APPS_SCRIPT_URL}`);
        return newPath;
      },
      configure: (proxy, _options) => {
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log(`\n[Vite Proxy] ====== REQUEST START ======`);
          console.log(`[Vite Proxy] Method: ${req.method}`);
          console.log(`[Vite Proxy] URL: ${req.url}`);
          console.log(`[Vite Proxy] Headers:`, JSON.stringify(req.headers, null, 2));
          
          // Get request body for POST requests
          if (req.method === 'POST' && req.body) {
            const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            console.log(`[Vite Proxy] Body: ${bodyData}`);
            // Write body to proxy request
            if (bodyData) {
              proxyReq.write(bodyData);
            }
          }
          
          const targetPath = req.url.replace(/^\/api/, '');
          const fullTargetUrl = `${APPS_SCRIPT_URL}${targetPath}`;
          console.log(`[Vite Proxy] Target URL: ${fullTargetUrl}`);
          console.log(`[Vite Proxy] ====== REQUEST END ======\n`);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log(`[Vite Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        });
        proxy.on('error', (err, _req, _res) => {
          console.error('[Vite Proxy] ERROR:', err);
        });
      },
    };
  } else {
    // Fallback to local Node backend if APPS_SCRIPT_URL is not set
    proxy['/auth'] = 'http://localhost:4000';
    proxy['/tasks'] = 'http://localhost:4000';
    proxy['/health'] = 'http://localhost:4000';
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy,
    },
  };
});

