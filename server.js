const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);
for (const name of fs.readdirSync(path.join(__dirname, 'assets'))) {
  if (/\.(jpg|png)$/.test(name)) files.set('/assets/' + name, ['assets/' + name, name.endsWith('.png') ? 'image/png' : 'image/jpeg']);
}
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end();
  }
  let pathname;
  try { pathname = new URL(req.url, 'http://localhost').pathname; }
  catch { res.writeHead(400); return res.end(); }
  const file = files.get(pathname);
  if (!file) { res.writeHead(404); return res.end('Not found'); }
  res.setHeader('Content-Type', file[1]);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache');
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(path.join(__dirname, file[0]));
  stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); });
  stream.pipe(res);
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => console.log('School site ready'));
