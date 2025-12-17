import type { Hono } from "hono"
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
import { ServiceOGP } from './service.ogp'
import { ServiceRouterMiddleware } from "./service.router.middleware"


const ServiceUserInstance = new ServiceUser(ServiceDatabase.instance)
const ServiceAuthInstance = new ServiceAuth()
const ServiceLinkInstance = new ServiceLink(ServiceDatabase.instance, ServiceOGP.getMeta)
const ServiceTagInstance = new ServiceTag(ServiceDatabase.instance)
const ServiceRouterMiddlewareInstance = new ServiceRouterMiddleware(
    ServiceUserInstance,
    ServiceAuthInstance,
    ServiceLinkInstance,
)
const ServiceLinkViewInstance = new ServiceLinkView(
    ServiceTagInstance,
    ServiceRouterMiddlewareInstance.getUserId
)

const serviceRouter = new Router(
    ServiceUserInstance,
    ServiceAuthInstance,
    ServiceLinkInstance,
    ServiceTagInstance,
    new ServiceSearch(ServiceDatabase.instance),
    new ServicePagination(),
    ServiceLinkViewInstance,
    ServiceRouterMiddlewareInstance,
)


const useStaticFiles = (app: Hono) => {
    app.use('/favicon.svg', serveStatic({ path: './favicon.svg' }))
    app.use('/favicon.ico', serveStatic({ path: './favicon.svg' }))
    app.use('/pico.yellow.min.css', serveStatic({ path: './pico.yellow.min.css' }))
    app.use('/htmx.min.js', serveStatic({ path: './htmx.min.js' }))
    app.use('/alpine.min.js', serveStatic({ path: './alpine.min.js' }))
}


const useRoutesPublic = (app: Hono) => {
    app.get(serviceRouter.routes.main, serviceRouter.main)
    app.post(serviceRouter.routes.login, serviceRouter.routerUser.login)
    app.post(serviceRouter.routes.logout, serviceRouter.routerUser.logout)
}


const useRoutesPrivate = (app: Hono) => {
    app.use(serviceRouter.usePrivateRoute)
    app.get(serviceRouter.routes.dashboard, serviceRouter.dashboard)
    app.post(serviceRouter.routes.search, serviceRouter.search)
    app.post(serviceRouter.routes.linkAdd, serviceRouter.routerLink.linkAdd)
    app.get(serviceRouter.routes.linkEdit, serviceRouter.routerLink.linkEdit)
    app.patch(serviceRouter.routes.linkUpdate, serviceRouter.routerLink.linkUpdate)
    app.post(serviceRouter.routes.linkGet, serviceRouter.routerLink.linkGet)
    app.delete(serviceRouter.routes.linkDelete, serviceRouter.routerLink.linkDelete)
    app.post(serviceRouter.routes.linkChangeView, serviceRouter.routerLink.linkChangeView)
    app.post(serviceRouter.routes.tagCreate, serviceRouter.routerTag.tagCreate)
    app.post(serviceRouter.routes.tagDelete, serviceRouter.routerTag.tagDelete)
    app.post(serviceRouter.routes.linkAddFormUpdate, serviceRouter.routerLink.linkAddFormUpdate)
    app.post(serviceRouter.routes.userUpdateName, serviceRouter.routerUser.userUpdateName)
    app.get(serviceRouter.routes.userDataDownload, serviceRouter.routerUser.userDataDownload)
    app.post(serviceRouter.routes.paginationViewUpdate, serviceRouter.paginationViewUpdate)
    app.get(serviceRouter.routes.settings, serviceRouter.settings)
    app.post(serviceRouter.routes.applicationClose, serviceRouter.applicationClose)
}


export const useRouter = (app: Hono) => {
    useStaticFiles(app)
    useRoutesPublic(app)
    useRoutesPrivate(app)
    app.notFound((ctx) => ctx.redirect(serviceRouter.routes.main))
}
