import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser DOM environment in tests.
    environment: 'jsdom',
    // Make vitest globals (describe, it, expect, vi) available without importing.
    globals: true,
    // Register jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.).
    setupFiles: ['./src/tests/setup.ts'],
  },
});
