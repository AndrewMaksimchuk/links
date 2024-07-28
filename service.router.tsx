import type { Context, Next } from "hono"
import type { ServiceAuth } from "./service.auth"
import type { ServiceUser, User } from "./service.user"
import type { ServiceLink, Link } from "./service.link"
import type { Stringify, Prettify } from "./utility.types"
import type { ServiceSearch } from "./service.search"
import type { ServicePagination } from "./service.pagination"
import { getCookie, setCookie } from 'hono/cookie'
import { Fragment } from "hono/jsx"
import { Add, Dashboard, Greeting, LinksContext, LinksCounter, SettingsUser, TagsContext, UserContext } from './page.dashboard'
import { ServiceTag, type Tag } from "./service.tag"
import { Logger } from "./service.logger"
import { Layout } from "./page.layout"
import { Index } from "./page.index"
import { Notification, type NotificationProps } from "./component.notification"
import { Links } from "./component.links"
import { TagNotification } from "./component.tag-notification"
import { Pagination } from "./component.pagination"


export const routes = {
  main: '/',
  login: '/login',
  logout: '/logout',
  dashboard: '/dashboard',
  search: '/search',
  linkAdd: '/link-add',
  linkDelete: '/link-delete',
  linkEdit: '/link-edit',
  linkChangeView: '/link-change-view',
  linkAddFormUpdate: '/link-add-form-update',
  tagCreate: '/tag-create',
  tagDelete: '/tag-delete',
  userUpdateName: '/user-update-name',
  paginationViewUpdate: '/pagination-view-update',
  settings: '/settings',
} as const


export class Router {
  private serviceAuth: ServiceAuth
  private serviceUser: ServiceUser
  private serviceLink: ServiceLink
  private serviceTag: ServiceTag
  private serviceSearch: ServiceSearch
  private servicePagination: ServicePagination


  constructor(ServiceUser: ServiceUser, ServiceAuth: ServiceAuth, ServiceLink: ServiceLink, ServiceTag: ServiceTag, ServiceSearch: ServiceSearch, ServicePagination: ServicePagination) {
    this.serviceUser = ServiceUser
    this.serviceAuth = ServiceAuth
    this.serviceLink = ServiceLink
    this.serviceTag = ServiceTag
    this.serviceSearch = ServiceSearch
    this.servicePagination = ServicePagination
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


  private getUserId = async (ctx: Context) => {
    Logger.log('Function: getUserId', __filename)
    const token = await this.serviceAuth.getLoginToken(ctx)
    return 'string' === typeof token ? this.serviceUser.getUserData(token, "user_id") : null;
  }


  private getUserLinks = async (userId: number) => {
    Logger.log('Function: getUserLinks', __filename)
    return 'number' === typeof userId ? this.serviceLink.getLinks(userId) : []
  }


  private selectLinkView = (isCard: boolean) => {
    Logger.log('Function: selectLinkView', __filename)
    return isCard ? <Links /> : <Links view="table" />;
  }

  public dashboard = async (ctx: Context) => {
    Logger.log('Function: dashboard', __filename)
    const user = await this.getUser(ctx)

    if (null === user) {
      return ctx.redirect(this.routes.login);
    }

    const isNumber = "number" === typeof user.user_id
    const userLinks = isNumber ? await this.getUserLinks(user.user_id) : []
    const tags = isNumber ? this.serviceTag.getTags(user.user_id) : []
    const linkViewState = getCookie(ctx, 'linkView') ?? ''
    const View = this.selectLinkView(!linkViewState)
    LinksContext.values = [userLinks]

    return ctx.html(
      <Layout>
        <Dashboard linkViewState={linkViewState} tags={tags} user={user}>
          {View}
        </Dashboard>
      </Layout>);
  }

  public linkChangeView = async (ctx: Context) => {
    Logger.log('Function: linkChangeView', __filename)
    const body = await ctx.req.parseBody<{ viewState?: "on" }>()
    setCookie(ctx, 'linkView', body.viewState ?? '', { httpOnly: true, secure: true })
    const userId = await this.getUserId(ctx)
    const userLinks = "number" === typeof userId ? await this.getUserLinks(userId) : []
    LinksContext.values = [userLinks]
    const View = this.selectLinkView(!body.viewState)
    const activePage = this.servicePagination.getActivePage(ctx)
    return ctx.html(
      <Fragment>
        <Pagination activePage={activePage} />
        {View}
      </Fragment>
    );
  }


  public search = async (ctx: Context) => {
    Logger.log('Function: search', __filename)
    const body = await ctx.req.parseBody<{ search: string }>()

    if (body.search.length < 2) {
      return ctx.html("Need more letters!");
    }

    const userId = await this.getUserId(ctx)
    if (null === userId) {
      return ctx.html("Can`t find you!");
    }

    const links = this.serviceSearch.search(body.search, userId).filter((link) => null !== link)

    if (links.length === 0) {
      return ctx.html("Nothing found");
    }

    LinksContext.values = [links]
    const linkViewState = getCookie(ctx, 'linkView') ?? ''
    const View = this.selectLinkView(!linkViewState)
    return ctx.html(
      <Fragment>
        {View}
        <div id="searchResult" hx-swap-oob="beforebegin">
          <button id="searchClearButton" type="button" onclick="searchResult.innerText = ''; this.remove();">Clear search result view</button>
        </div>
      </Fragment>
    );
  }


  public linkAdd = async (ctx: Context) => {
    Logger.log('Function: linkAdd', __filename)
    type LinkAddBody = Prettify<Stringify<Pick<Link, "url" | "created_at"> & { tags: string }>>
    const formBody = await ctx.req.parseBody<LinkAddBody>()

    const user = await this.getUser(ctx)
    if (null === user) {
      Logger.error('Function: linkAdd', __filename, 'user is null')
      return ctx.html(<Notification status="error" body="Can`t get user!"></Notification>)
    }

    const isNewLinkCreate = this.serviceLink.setNewLink(formBody, user.user_id)
    const userLinks = "number" === typeof user.user_id ? await this.getUserLinks(user.user_id) : []
    LinksContext.values = [userLinks]
    const linkViewState = getCookie(ctx, 'linkView') ?? ''
    const View = this.selectLinkView(!linkViewState)

    if (null === isNewLinkCreate) {
      Logger.error('Function: linkAdd', __filename, 'new link is null')
      return ctx.html(
        <Fragment>
          {View}
          <Notification status="warn" body="Can`t create new link!"></Notification>
        </Fragment>
      );
    }

    const activePage = this.servicePagination.getActivePage(ctx)
    const notificationid = Date.now()
    ctx.header('HX-Trigger', JSON.stringify({ notifyClose: { notificationid } }))
    return ctx.html(
      <Fragment>
        {View}
        <LinksCounter />
        <Pagination activePage={activePage} />
        <Notification status="success" body="Add new link!" notificationid={notificationid}></Notification>
      </Fragment>
    );
  }


  public linkEdit(ctx: Context) {
    Logger.log('Function: linkEdit', __filename)
    return ctx.html('Edit link!');
  }

  public linkDelete = async (ctx: Context) => {
    Logger.log('Function: linkDelete', __filename)
    const body = await ctx.req.parseBody<Stringify<Pick<Link, "link_id">>>()
    const userId = await this.getUserId(ctx)

    if (this.serviceLink.deleteLink(Number(body.link_id))) {
      const userLinks = "number" === typeof userId ? await this.getUserLinks(userId) : []
      LinksContext.values = [userLinks]
      const activePage = this.servicePagination.getActivePage(ctx)
      const notificationid = Date.now()
      ctx.header('HX-Trigger', JSON.stringify({ notifyClose: { notificationid } }))
      return ctx.html(
        <Fragment>
          <LinksCounter />
          <Pagination activePage={activePage} />
          <Notification status="success" body="Link deleted" notificationid={notificationid}></Notification>
        </Fragment>
      );
    }

    return ctx.html(<Notification status="warn" body="Can`t delete link!"></Notification>);
  }


  public tagCreate = async (ctx: Context) => {
    Logger.log('Function: tagCreate', __filename)
    const body = await ctx.req.parseBody<Omit<Tag, "tag_id">>()
    const userId = await this.getUserId(ctx)

    if (null == userId) {
      return ctx.html(<TagNotification text="Can`t create tag!" />);
    }

    this.serviceTag.createTag(body, userId)
    const tag = this.serviceTag.getTags(userId).at(-1)
    return tag ? ctx.html(<TagNotification tagId={tag.tag_id} name={tag?.name} color={tag?.color} />) : ctx.html(<TagNotification text="Can`t create tag!" />);
  }


  public tagDelete = async (ctx: Context) => {
    Logger.log('Function: tagDelete', __filename)
    const body = await ctx.req.parseBody<{ tagId: string }>()
    this.serviceTag.deleteTag(Number(body.tagId))
    return ctx.html(<TagNotification text="Tag deleted!" />);
  }


  public linkAddFormUpdate = async (ctx: Context) => {
    Logger.log('Function: linkAddFormUpdate', __filename)
    const userId = await this.getUserId(ctx)

    if (null === userId) {
      return ctx.html(<Add />);
    }

    const tags = this.serviceTag.getTags(userId)
    TagsContext.values = [tags]
    return ctx.html(<Add />);
  }


  public userUpdateName = async (ctx: Context) => {
    Logger.log('Function: userUpdateName', __filename)
    const body = await ctx.req.parseBody<{ userName: string }>()
    const currentUser = await this.getUser(ctx)
    const notification: NotificationProps = {
      status: "warn",
      body: "Can`t update your name!",
    }
    let userNewName = ""

    if (body.userName && currentUser) {
      const updatedCurrentUser = this.serviceUser.updateName(body.userName, currentUser)
      if (updatedCurrentUser) {
        if (currentUser.name === updatedCurrentUser.name) {
          notification.status = "info"
          notification.body = "Your name the same, nothing to change"
        } else {
          UserContext.values = [updatedCurrentUser]
          notification.status = "success"
          notification.body = "Name is updated"
          userNewName = updatedCurrentUser.name
        }
      }
    }

    return ctx.html(
      <Fragment>
        <SettingsUser />
        <div id="userGreeting" hx-swap-oob="outerHTML">
          <Greeting name={userNewName} />
        </div>
        <Notification status={notification.status} body={notification.body}></Notification>
      </Fragment>
    );
  }


  public paginationViewUpdate = async (ctx: Context) => {
    Logger.log('Function: paginationViewUpdate', __filename)
    const body = await ctx.req.parseBody<{ page: string }>()
    const user = await this.getUser(ctx)

    if (null === user) {
      return ctx.html(<Notification status="warn" body="Something is wrong!" />);
    }

    const isNumber = "number" === typeof user.user_id
    const userLinks = isNumber ? await this.getUserLinks(user.user_id) : []
    const linkViewState = getCookie(ctx, 'linkView') ?? ''
    const View = this.selectLinkView(!linkViewState)
    LinksContext.values = [userLinks]
    const activePage = Number(body.page) || 1
    this.servicePagination.setActivePage(ctx, body.page)

    const notificationid = Date.now()
    ctx.header('HX-Trigger', JSON.stringify({ notifyClose: { notificationid } }))
    return ctx.html(
      <Fragment>
        <LinksCounter />
        <Pagination activePage={activePage} />
        {View}
      </Fragment>
    );
  }


  public settings = (ctx: Context) => {
    Logger.log('Function: settings', __filename)
    return this.dashboard(ctx);
  }
}
