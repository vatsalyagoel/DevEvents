import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://devevents.io',
  integrations: [
    preact({ compat: false }),
  ],
  output: 'static',
});
