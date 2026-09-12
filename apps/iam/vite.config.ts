import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineAppConfig } from '../../tools/viteAppConfig.ts'

const appRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineAppConfig({ port: 5177, appRoot })
