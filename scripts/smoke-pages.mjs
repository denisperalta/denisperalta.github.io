import assert from 'node:assert/strict';

const base = new URL(process.env.PAGES_URL ?? 'https://denisperalta.github.io/');
assert.equal(base.origin, 'https://denisperalta.github.io', 'Unexpected GitHub Pages origin');
assert.equal(base.username + base.password + base.search + base.hash, '', 'Invalid GitHub Pages URL');
base.pathname = `${base.pathname.replace(/\/+$/g, '')}/`;

const routes = [
  ['./', 200, /Denis Peralta/i],
  ['work/trading-platform/', 200, /Testing a trading platform for financial advisors/i],
  ['work/bilingual-voice-assistant/', 200, /Quality for a bilingual voice assistant/i],
  ['quality/', 200, /How I tested this site/i],
  ['missing-portfolio-smoke-page/', 404, /Page not found/i],
  ['assets/CV Denis Peralta EN-573ed27d.pdf', 404, /Page not found/i],
];

await Promise.all(routes.map(async ([route, status, marker]) => {
  const url = new URL(route, base);
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, status, url.href);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/i, url.href);
  assert.match(await response.text(), marker, url.href);
  console.log(`${response.status} ${url.pathname}`);
}));
