/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
      ],
    },
    include: ["./src/__tests__/**/*.{text,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
})
