/**
 * @ip/api-mock — 同仓样机 HTTP mock（非真后端）
 * Node built-in http · default port 5180
 */
import http from 'node:http'
import { APP_PORTS } from '@ip/contracts'
import { handleRequest, sendJson, setCors } from './routes.js'

const port = Number(process.env.PORT) || APP_PORTS.api || 5180

const server = http.createServer(async (req, res) => {
  setCors(req, res)
  try {
    const host = req.headers.host ?? `localhost:${port}`
    const url = new URL(req.url ?? '/', `http://${host}`)
    const handled = await handleRequest(req, res, url)
    if (!handled) {
      sendJson(res, 404, { ok: false, message: `Not found: ${url.pathname}` })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    sendJson(res, 500, { ok: false, message })
  }
})

server.listen(port, () => {
  console.log(`[api-mock] 同仓样机 · 非真后端 · http://localhost:${port}`)
  console.log(`[api-mock] GET /health  GET /v1/cases  POST /v1/commands/dispatch`)
})
