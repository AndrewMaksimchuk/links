import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { useRouter } from './server.router'


const app = new Hono({
  strict: true,
})


app.use(logger())
useRouter(app)


export default {
  port: 6969,
  fetch: app.fetch,
}
