import type { Context, Next } from "hono"
import type { ServiceAuth } from "./service.auth"
import type { ServiceUser, User } from "./service.user"
import type { ServiceLink, Link } from "./service.link"
import type { Stringify, Prettify } from "./utility.types"
import { Dashboard } from './page.dashboard'
import { Logger } from "./service.logger"
import { Layout } from "./page.layout"
import { Index } from "./page.index"
import { Notification } from "./component.notification"
import { Links } from "./component.links"

export const routes = {
  main: '/',
  login: '/login',
  logout: '/logout',
  dashboard: '/dashboard',
  search: '/search',
  linkAdd: '/link-add',
  linkDelete: '/link-delete',
  linkEdit: '/link-edit',
}


export class Router {
  private serviceAuth: ServiceAuth
  private serviceUser: ServiceUser
  private serviceLink: ServiceLink


  constructor(ServiceUser: ServiceUser, ServiceAuth: ServiceAuth, ServiceLink: ServiceLink) {
    this.serviceUser = ServiceUser
    this.serviceAuth = ServiceAuth
    this.serviceLink = ServiceLink
  }


  public routes = routes


  private getUser = async (ctx: Context) => {
    Logger.log('Function: getUser', __filename)
    const token = await this.serviceAuth.getLoginToken(ctx)
    if ('string' !== typeof token) {
      return null;
    }

    return this.serviceUser.findByPasswordHash(token)
  }


  private itCanPass = async (ctx: Context) => {
    Logger.log('Function: itCanPass', __filename)
    const token = await this.serviceAuth.getLoginToken(ctx)

    if ('string' !== typeof token) {
      return false;
    }

    if (null === this.serviceUser.findByPasswordHash(token)) {
      return false;
    }

    return true;
  }


  public usePrivateRoute = async (ctx: Context, next: Next) => {
    Logger.log('Function: usePrivateRoute', __filename)
    return await this.itCanPass(ctx) ? await next() : ctx.redirect(this.routes.main);
  }


  public main = async (ctx: Context) => {
    Logger.log('Function: main', __filename)
    return await this.itCanPass(ctx) ? ctx.redirect(this.routes.dashboard) : ctx.html(<Layout><Index></Index></Layout>);
  }


  public login = async (ctx: Context) => {
    Logger.log('Function: login', __filename)
    let user: User | null
    const formBody = await ctx.req.parseBody<Stringify<Omit<User, "user_id">>>()

    if (this.serviceUser.isNewUser(formBody.telephone)) {
      user = await this.serviceUser.setNewUser(formBody)
    } else {
      user = await this.serviceUser.verifyUser(formBody)
    }

    if (null === user) {
      Logger.error('Function: login', __filename, 'user is null')
      return ctx.redirect(this.routes.main);
    }

    await this.serviceAuth.login(ctx, user.password)
    return ctx.redirect(this.routes.dashboard);
  }


  public logout = (ctx: Context) => {
    Logger.log('Function: logout', __filename)
    this.serviceAuth.logout(ctx)
    return ctx.redirect(this.routes.main);
  }


  public dashboard = async (ctx: Context) => {
    Logger.log('Function: dashboard', __filename)
    const token = await this.serviceAuth.getLoginToken(ctx)
    const userId = 'string' === typeof token ? this.serviceUser.getUserData(token, "user_id") : null
    const userLinks = 'number' === typeof userId ? this.serviceLink.getLinks(userId) : []
    return ctx.html(
      <Layout>
        <Dashboard>
          <Links links={ userLinks }></Links>
        </Dashboard>
      </Layout>);
  }

  public search(ctx: Context) {
    Logger.log('Function: search', __filename)
    return ctx.html('Search html');
  }

  public linkAdd = async (ctx: Context) => {
    Logger.log('Function: linkAdd', __filename)
    const formBody = await ctx.req.parseBody<Prettify<Stringify<Pick<Link, "url" | "created_at">>>>()

    const user = await this.getUser(ctx)
    if (null === user) {
      Logger.error('Function: linkAdd', __filename, 'user is null')
      return ctx.html(<Notification status="error" body="Can`t get user!"></Notification>)
    }

    if (null === this.serviceLink.setNewLink(formBody, user.user_id)) {
      Logger.error('Function: linkAdd', __filename, 'new link is null')
      return ctx.html(<Notification status="warn" body="Can`t create new link!"></Notification>)
    }

    const notificationid = Date.now()
    ctx.header('HX-Trigger', JSON.stringify({ notifyClose: { notificationid } }))
    return ctx.html(<Notification status="success" body="Add new link!" notificationid={ notificationid }></Notification>)
  }

  public linkEdit(ctx: Context) {
    Logger.log('Function: linkEdit', __filename)
    return ctx.html('Edit link!');
  }
  
  public linkDelete = async (ctx: Context) => {
    Logger.log('Function: linkDelete', __filename)
    const body = await ctx.req.parseBody<Stringify<Pick<Link, "link_id">>>()

    if (this.serviceLink.deleteLink(Number(body.link_id))) {
      const notificationid = Date.now()
      ctx.header('HX-Trigger', JSON.stringify({ notifyClose: { notificationid } }))
      return ctx.html(<Notification status="success" body="Link deleted" notificationid={notificationid}></Notification>);
    }

    return ctx.html(<Notification status="warn" body="Can`t delete link!"></Notification>);
  }
}
