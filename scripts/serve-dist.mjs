import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? '4173');
const siteBase = (process.env.SITE_BASE ?? '').replace(/^\/+|\/+$/g, '');
const mount = siteBase ? `/${siteBase}/` : '/';
const origin = `http://${host}:${port}`;
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const notFound = join(dist, '404.html');

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

try {
  await Promise.all([access(join(dist, 'index.html')), access(notFound)]);
} catch {
  console.error('Run npm run build before serving dist.');
  process.exit(1);
}

async function sendFile(request, response, path, status) {
  const { size } = await stat(path);
  response.writeHead(status, {
    'Content-Type': mime[extname(path).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': size,
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(path);
  stream.on('error', (error) => response.destroy(error));
  stream.pipe(response);
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let url;
  let pathname;
  try {
    url = new URL(request.url, origin);
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  if (url.origin !== origin || /[\\:\0]/.test(pathname)) {
    response.writeHead(400).end();
    return;
  }
  if (`${pathname}/` === mount) {
    response.writeHead(308, { Location: `${mount}${url.search}` }).end();
    return;
  }
  if (!pathname.startsWith(mount)) {
    await sendFile(request, response, notFound, 404);
    return;
  }

  let filePath = resolve(dist, pathname.slice(mount.length));
  const fromDist = relative(dist, filePath);
  if (fromDist === '..' || fromDist.startsWith('../') || fromDist.startsWith('..\\') || isAbsolute(fromDist)) {
    await sendFile(request, response, notFound, 404);
    return;
  }

  try {
    if ((await stat(filePath)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end();
        return;
      }
      filePath = join(filePath, 'index.html');
    }
    await sendFile(request, response, filePath, 200);
  } catch {
    await sendFile(request, response, notFound, 404);
  }
});

server.listen(port, host, () => console.log(`Serving dist at ${origin}${mount}`));
