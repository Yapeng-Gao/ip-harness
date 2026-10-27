import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

export default defineConfig({
  plugins: [react(), inspectAttr()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 8768,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 8768,
    strictPort: true,
  },
})
