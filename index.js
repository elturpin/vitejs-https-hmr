// @ts-check
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { createServer as createHttpServer } from 'https'

const key = fs.readFileSync("certs/selfsigned.key");
const cert = fs.readFileSync("certs/selfsigned.crt");

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { 
        middlewareMode: true,
        https: {key, cert},
    },
    appType: 'custom',
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    const url = req.originalUrl
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    template = await vite.transformIndexHtml(url, template)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
  })

  const server = createHttpServer({key, cert}, app)

  server.listen(5173, () => {
    console.log("server listening on 5173")
  })
}

createServer()