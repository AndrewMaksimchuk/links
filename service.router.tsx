import type { Context, Next } from "hono"
import type { ServiceAuth } from "./service.auth"
import type { ServiceUser, User } from "./service.user"
import type { ServiceLink, Link } from "./service.link"
import type { Stringify, Prettify } from "./utility.types"
import type { ServiceSearch } from "./service.search"
import type { ServicePagination } from "./service.pagination"
import type { ServiceLinkView } from "./service.link-view"
import { $ } from "bun"
import { Fragment } from "hono/jsx"
import { Add, Dashboard, Greeting, LinksContext, LinksCounter, SettingsUser, TagsContext, UserContext } from './page.dashboard'
import { ServiceTag, type Tag } from "./service.tag"
import { Logger } from "./service.logger"
import { Layout } from "./page.layout"
import { Index } from "./page.index"
import { Notification, type NotificationProps } from "./component.notification"
import { LinkFormEdit, LinkOne } from "./component.links"
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
  linkUpdate: '/link-update',
  linkGet: '/link-get',
  linkChangeView: '/link-change-view',
  linkAddFormUpdate: '/link-add-form-update',
  tagCreate: '/tag-create',
  tagDelete: '/tag-delete',
  userUpdateName: '/user-update-name',
  userDataDownload: '/user-data-download',
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
  private serviceLinkView: ServiceLinkView


  constructor(
    ServiceUser: ServiceUser,
    ServiceAuth: ServiceAuth,
    ServiceLink: ServiceLink,
    ServiceTag: ServiceTag,
    ServiceSearch: ServiceSearch,
    ServicePagination: ServicePagination,
    ServiceLinkView: ServiceLinkView,
  ) {
    this.serviceUser = ServiceUser
    this.serviceAuth = ServiceAuth
    this.serviceLink = ServiceLink
    this.serviceTag = ServiceTag
    this.serviceSearch = ServiceSearch
    this.servicePagination = ServicePagination
    this.serviceLinkView = ServiceLinkView
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


  public dashboard = async (ctx: Context) => {
    Logger.log('Function: dashboard', __filename)
    const user = await this.getUser(ctx)

    if (null === user) {
      return ctx.redirect(this.routes.login);
    }

    const isNumber = "number" === typeof user.user_id
    const userLinks = isNumber ? await this.getUserLinks(user.user_id) : []
    const tags = isNumber ? this.serviceTag.getTags(user.user_id) : []
    const [View, linkViewState] = this.serviceLinkView.getLinkView(ctx)
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
    const setViewTo = 'on' === body.viewState ? this.serviceLinkView.views.table : this.serviceLinkView.views.card
    const View = this.serviceLinkView.setLinkView(ctx, setViewTo)
    const userId = await this.getUserId(ctx)
    const userLinks = "number" === typeof userId ? await this.getUserLinks(userId) : []
    LinksContext.values = [userLinks]
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
    const [View] = this.serviceLinkView.getLinkView(ctx)
    return ctx.html(
      <Fragment>
        {View}
        <div id="searchResult" hx-swap-oob="beforebegin">
          <button id="searchClearButton" type="button" onclick="searchResult.innerText = ''; this.remove();">Clear search result view</button>
        </div>
      </Fragment>
    );
  }


  private isNotValidBodyLinkAdd = (body: Stringify<Pick<Link, "url" | "created_at"> & { tags: string }>) => {
    try {
      Logger.log('Function: isValidBodyLinkAdd', '[ START ]', __filename)
      const urlToAdd = new URL(body.url)
      const isValidProtocol = 'https:' === urlToAdd.protocol
      const domainParts = urlToAdd.hostname.split('.')
      const topLevelDomain = (1 < domainParts.length && domainParts.at(-1)?.length) || 0
      const isValidDomainname = 1 < topLevelDomain
      return !(isValidProtocol && isValidDomainname);
    } catch (error) {
      Logger.error('Function: isValidBodyLinkAdd', '[ ERROR ]', __filename)
      return true;
    } finally {
      Logger.log('Function: isValidBodyLinkAdd', '[ END ]', __filename)
    }
  }


  public linkAdd = async (ctx: Context) => {
    Logger.log('Function: linkAdd', __filename)
    type LinkAddBody = Prettify<Stringify<Pick<Link, "url" | "created_at"> & { tags: string }>>
    const formBody = await ctx.req.parseBody<LinkAddBody>()

    if (this.isNotValidBodyLinkAdd(formBody)) {
      Logger.warning('Function: linkAdd', __filename, 'link not valid')
      return ctx.html(<Notification status="warn" header="Bad link!" body="Change to correct working link"></Notification>)
    }

    const user = await this.getUser(ctx)
    if (null === user) {
      Logger.error('Function: linkAdd', __filename, 'user is null')
      return ctx.html(<Notification status="error" body="Can`t get user!"></Notification>)
    }

    const isNewLinkCreate = await this.serviceLink.setNewLink(formBody, user.user_id)
    const userLinks = "number" === typeof user.user_id ? await this.getUserLinks(user.user_id) : []
    LinksContext.values = [userLinks]
    const [View] = this.serviceLinkView.getLinkView(ctx)

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


  public linkEdit = async (ctx: Context) => {
    Logger.log('Function: linkEdit', __filename)
    const [_, linkViewState] = this.serviceLinkView.getLinkView(ctx)
    const linkId = ctx.req.query('linkId')
    const link = this.serviceLink.getLink(Number(linkId))

    if (null === link) {
      return ctx.html(<Notification status="error" body="Can`t get link!" />);
    }

    const userId = await this.getUserId(ctx)

    if (null == userId) {
      return ctx.html(<TagNotification text="Can`t create tag!" />);
    }

    const tags = this.serviceTag.getTags(userId)
    TagsContext.values = [tags]

    return ctx.html(
      <LinkFormEdit view={linkViewState} link={link} />
    );
  }


  public linkUpdate = async (ctx: Context) => {
    Logger.log('Function: linkUpdate', __filename)
    const body = await ctx.req.parseBody<Stringify<Pick<Link, "title" | "url" | "tags" | "link_id" | "description" | "site_name">>>()
    const userId = await this.getUserId(ctx)

    if (null === userId) {
      return ctx.html(<Notification status="error" body="Can`t get you!" />);
    }

    const link = this.serviceLink.updateLink({ ...body, user_id: String(userId) })

    if (null === link) {
      return ctx.html(<Notification status="error" body="Can`t get link!" />);
    }

    const [_, linkViewState] = this.serviceLinkView.getLinkView(ctx)
    return ctx.html(
      <LinkOne link={link} view={linkViewState} />
    );
  }


  public linkGet = async (ctx: Context) => {
    Logger.log('Function: linkGet', __filename)
    const body = await ctx.req.parseBody<{ linkId: string }>()
    const link = this.serviceLink.getLink(Number(body.linkId))

    if (null === link) {
      return ctx.html(<Notification status="error" body="Can`t get link!" />);
    }

    const [_, linkViewState] = this.serviceLinkView.getLinkView(ctx)
    return ctx.html(
      <LinkOne link={link} view={linkViewState} />
    );
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


  public userDataDownload = async (ctx: Context) => {
    const userId = await this.getUserId(ctx)

    if (null === userId) {
      return ctx.html(<Notification status="error" body="Can`t get you!" />);
    }

    const tables = ['users', 'tags', 'links', 'vlinks']
    const processingCsv = tables.map((table) => $`sqlite3 -csv -header ./database.sqlite "select * from ${table}  where user_id = ${userId};" > /tmp/${table}.csv`)
    const execResult = await Promise.all(processingCsv)
    const isExportFail = execResult.filter((shellOutput) => 0 !== shellOutput.exitCode).length

    if (isExportFail) {
      return ctx.html(<Notification status="error" body="Can`t get your data!" />);
    }

    $.cwd("/tmp")
    const processingArchive = await $`tar -czf user-data.tar.gz users.csv tags.csv links.csv vlinks.csv`

    if (0 !== processingArchive.exitCode) {
      return ctx.html(<Notification status="error" body="Can`t create archive!" />);
    }

    const archive = Bun.file('/tmp/user-data.tar.gz')

    if (! await archive.exists()) {
      return ctx.html(<Notification status="error" body="Can`t get archive!" />);
    }

    const response = new Response(archive)
    response.headers.set('Content-Disposition', 'attachment; filename="user-data.tar.gz"')
    return response;
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
    const [View] = this.serviceLinkView.getLinkView(ctx)
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
