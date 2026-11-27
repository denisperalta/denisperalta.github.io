import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://denisperalta.github.io',
  base: process.env.SITE_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  server: { host: '127.0.0.1' },
});
