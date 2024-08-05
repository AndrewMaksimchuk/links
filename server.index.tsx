import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { Router } from './service.router'
import { ServiceUser } from './service.user'
import { ServiceDatabase } from './service.database'
import { ServiceAuth } from './service.auth'
import { ServiceLink } from './service.link'
import { ServiceTag } from './service.tag'
import { ServiceSearch } from './service.search'
import { ServicePagination } from './service.pagination'
import { ServiceLinkView } from './service.link-view'

const app = new Hono({
  strict: true,
})

const router = new Router(
  new ServiceUser(ServiceDatabase.instance),
  new ServiceAuth(),
  new ServiceLink(ServiceDatabase.instance),
  new ServiceTag(ServiceDatabase.instance),
  new ServiceSearch(ServiceDatabase.instance),
  new ServicePagination(),
  new ServiceLinkView(),
)

app.use(logger())
app.use('/favicon.svg', serveStatic({ path: './favicon.svg' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.svg' }))
app.use('/pico.yellow.min.css', serveStatic({ path: './pico.yellow.min.css' }))
app.use('/htmx.min.js', serveStatic({ path: './htmx.min.js' }))
app.use('/alpine.min.js', serveStatic({ path: './alpine.min.js' }))
app.post(router.routes.login, router.login)
app.post(router.routes.logout, router.logout)
app.get(router.routes.main, router.main)
app.use(router.usePrivateRoute)
app.get(router.routes.dashboard, router.dashboard)
app.post(router.routes.search, router.search)
app.post(router.routes.linkAdd, router.linkAdd)
app.get(router.routes.linkEdit, router.linkEdit)
app.patch(router.routes.linkUpdate, router.linkUpdate)
app.post(router.routes.linkGet, router.linkGet)
app.delete(router.routes.linkDelete, router.linkDelete)
app.post(router.routes.linkChangeView, router.linkChangeView)
app.post(router.routes.tagCreate, router.tagCreate)
app.post(router.routes.tagDelete, router.tagDelete)
app.post(router.routes.linkAddFormUpdate, router.linkAddFormUpdate)
app.post(router.routes.userUpdateName, router.userUpdateName)
app.get(router.routes.userDataDownload, router.userDataDownload)
app.post(router.routes.paginationViewUpdate, router.paginationViewUpdate)
app.get(router.routes.settings, router.settings)
app.notFound((ctx) => ctx.redirect(router.routes.main))

export default {
  port: 6969,
  fetch: app.fetch,
}
