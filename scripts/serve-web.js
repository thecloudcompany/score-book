// Simple server to preview the web export (local use only).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// expo export --platform web writes to the project-root dist/.
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // Add COEP/COOP headers for SharedArrayBuffer support
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  const urlPath = (req.url || '/').split('?')[0].split('#')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  const joined = path.normalize(path.join(DIST_DIR, decoded === '/' ? 'index.html' : decoded));
  // Reject paths escaping the public directory.
  if (joined !== DIST_DIR && !joined.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  let filePath = joined;

  // Handle client-side routing for SPA
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📱 Open this URL in Chrome/Safari/Firefox');
  console.log('⚠️  Make sure to do a web export first: npx expo export --platform web');
});
