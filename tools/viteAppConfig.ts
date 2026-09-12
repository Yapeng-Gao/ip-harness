import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function defineAppConfig(opts: { port: number; appRoot: string }) {
  return defineConfig({
    root: opts.appRoot,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@shared': path.join(repoRoot, 'src'),
        '@ip/contracts': path.join(repoRoot, 'packages/contracts/src/index.ts'),
        '@ip/domain/types': path.join(repoRoot, 'packages/domain/src/types/index.ts'),
        '@ip/domain': path.join(repoRoot, 'packages/domain/src/index.ts'),
        '@ip/app-state/AppContext': path.join(repoRoot, 'packages/app-state/src/AppContext.tsx'),
        '@ip/app-state/AgentContext': path.join(repoRoot, 'packages/app-state/src/AgentContext.tsx'),
        '@ip/app-state/ProductContext': path.join(repoRoot, 'packages/app-state/src/ProductContext.tsx'),
        '@ip/app-state/crossPortStore': path.join(repoRoot, 'packages/app-state/src/crossPortStore.ts'),
        '@ip/app-state': path.join(repoRoot, 'packages/app-state/src/index.ts'),
        '@ip/ui': path.join(repoRoot, 'packages/ui/src/index.ts'),
      },
    },
    define: {
      'import.meta.env.VITE_MULTI_APP': JSON.stringify('true'),
    },
    server: {
      host: '0.0.0.0',
      port: opts.port,
      strictPort: true,
      fs: { allow: [repoRoot] },
    },
    preview: {
      host: '0.0.0.0',
      port: opts.port,
    },
  })
}
