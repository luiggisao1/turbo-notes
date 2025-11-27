import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: [
      // Map TypeScript path aliases (tsconfig.json) to their runtime paths for Vitest
      { find: '@/styles', replacement: path.resolve(__dirname, 'app/styles') },
      { find: '@/components', replacement: path.resolve(__dirname, 'app/_components') },
      { find: '@/lib', replacement: path.resolve(__dirname, 'app/_lib') },
      { find: '@/app', replacement: path.resolve(__dirname, 'app') },
      // Generic alias so imports like `import x from "@/something"` resolve to `app/something`
      { find: '@/', replacement: path.resolve(__dirname, 'app/') },
    ],
  },
});
