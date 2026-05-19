import { app, BrowserWindow, shell, session, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

// Mime types for static file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.map':  'application/json',
};

/**
 * Start a minimal local HTTP server to serve the dist/ folder.
 * This gives the renderer a real http://localhost origin so
 * Supabase (and any other API) works without CORS issues.
 */
function startLocalServer(distPath) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';

      const filePath = path.join(distPath, urlPath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Try the exact file, then fallback to index.html (SPA routing)
      const target = existsSync(filePath) ? filePath : path.join(distPath, 'index.html');
      const targetType = existsSync(filePath) ? contentType : 'text/html';

      try {
        const content = readFileSync(target);
        res.writeHead(200, { 'Content-Type': targetType });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    // Listen on random available port
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      console.log(`[Beeforce] Local server running at http://127.0.0.1:${port}`);
      resolve(port);
    });
  });
}

async function createWindow(port) {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,  // Disable CORS enforcement
    },
    title: 'Beeforce - نظام إدارة التمويش',
    show: false,
    backgroundColor: '#F8FAFC',
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Load from local HTTP server instead of file:// to avoid CORS
    mainWindow.loadURL(`http://127.0.0.1:${port}`);
  }

  // Show window when ready to avoid blank flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

app.whenReady().then(async () => {
  // ── CORS bypass headers (safety net) ──────────────────────────────
  const supabaseFilter = { urls: ['*://*.supabase.co/*'] };

  session.defaultSession.webRequest.onBeforeSendHeaders(supabaseFilter, (details, callback) => {
    details.requestHeaders['Origin'] = 'http://localhost';
    callback({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived(supabaseFilter, (details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Headers'] = ['authorization, x-client-info, apikey, content-type, range, Accept, X-Supabase-Api-Version'];
    responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, PATCH, DELETE, OPTIONS'];
    callback({ responseHeaders });
  });

  // Start local HTTP server for production builds
  let port = 0;
  if (!isDev) {
    const distPath = path.join(__dirname, '../dist');
    port = await startLocalServer(distPath);
  }

  await createWindow(port);

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow(port);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
