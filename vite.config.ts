import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ip/contracts': path.join(root, 'packages/contracts/src/index.ts'),
      '@ip/domain/types': path.join(root, 'packages/domain/src/types/index.ts'),
      '@ip/domain': path.join(root, 'packages/domain/src/index.ts'),
      '@ip/app-state/AppContext': path.join(root, 'packages/app-state/src/AppContext.tsx'),
      '@ip/app-state/AgentContext': path.join(root, 'packages/app-state/src/AgentContext.tsx'),
      '@ip/app-state/ProductContext': path.join(root, 'packages/app-state/src/ProductContext.tsx'),
      '@ip/app-state/crossPortStore': path.join(root, 'packages/app-state/src/crossPortStore.ts'),
      '@ip/app-state': path.join(root, 'packages/app-state/src/index.ts'),
      '@ip/ui': path.join(root, 'packages/ui/src/index.ts'),
      '@shared': path.join(root, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
