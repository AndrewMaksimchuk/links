import type { Context, Next } from "hono";
import type { ServiceAuth } from "./service.auth";
import type { ServiceUser } from "./service.user";
import type { ServiceLink } from "./service.link";
import type { ServiceSearch } from "./service.search";
import type { ServicePagination } from "./service.pagination";
import type { ServiceLinkView } from "./service.link-view";
import { Fragment } from "hono/jsx";
import { Dashboard, LinksContext, LinksCounter } from "./page.dashboard";
import { ServiceTag } from "./service.tag";
import { Logger } from "./service.logger";
import { Layout } from "./page.layout";
import { Index } from "./page.index";
import { Notification } from "./component.notification";
import { Pagination } from "./component.pagination";
import { RouterTag } from "./service.router.tag";
import { RouterLink } from "./service.router.link";
import { RouterUser } from "./service.router.user";
import { RouterApplication } from "./service.router.application";

export const routes = {
  main: "/",
  login: "/login",
  logout: "/logout",
  dashboard: "/dashboard",
  search: "/search",
  linkAdd: "/link-add",
  linkDelete: "/link-delete",
  linkEdit: "/link-edit",
  linkUpdate: "/link-update",
  linkGet: "/link-get",
  linkChangeView: "/link-change-view",
  linkAddFormUpdate: "/link-add-form-update",
  tagCreate: "/tag-create",
  tagDelete: "/tag-delete",
  userUpdateName: "/user-update-name",
  userDataDownload: "/user-data-download",
  paginationViewUpdate: "/pagination-view-update",
  settings: "/settings",
  applicationClose: "/close",
} as const;

export class Router {
  private serviceAuth: ServiceAuth;
  private serviceUser: ServiceUser;
  private serviceLink: ServiceLink;
  private serviceTag: ServiceTag;
  private serviceSearch: ServiceSearch;
  private servicePagination: ServicePagination;
  private serviceLinkView: ServiceLinkView;

  constructor(
    ServiceUser: ServiceUser,
    ServiceAuth: ServiceAuth,
    ServiceLink: ServiceLink,
    ServiceTag: ServiceTag,
    ServiceSearch: ServiceSearch,
    ServicePagination: ServicePagination,
    ServiceLinkView: ServiceLinkView
  ) {
    this.serviceUser = ServiceUser;
    this.serviceAuth = ServiceAuth;
    this.serviceLink = ServiceLink;
    this.serviceTag = ServiceTag;
    this.serviceSearch = ServiceSearch;
    this.servicePagination = ServicePagination;
    this.serviceLinkView = ServiceLinkView;
    Object.assign(this, new RouterTag(this.serviceTag, this.getUserId));
    Object.assign(
      this,
      new RouterLink(
        this.serviceLink,
        this.serviceTag,
        this.servicePagination,
        this.serviceLinkView,
        this.getUser,
        this.getUserId,
        this.getUserLinks
      )
    );
    Object.assign(
      this,
      new RouterUser(
        this.serviceUser,
        this.serviceAuth,
        this.routes,
        this.getUser,
        this.getUserId
      )
    );
  }

  private getUser = async (ctx: Context) => {
    Logger.log("Function: getUser", __filename);
    const token = await this.serviceAuth.getLoginToken(ctx);
    if ("string" !== typeof token) {
      return null;
    }

    return this.serviceUser.findByPasswordHash(token);
  };

  private itCanPass = async (ctx: Context) => {
    Logger.log("Function: itCanPass", __filename);
    const token = await this.serviceAuth.getLoginToken(ctx);

    if ("string" !== typeof token) {
      return false;
    }

    if (null === this.serviceUser.findByPasswordHash(token)) {
      return false;
    }

    return true;
  };

  private getUserId = async (ctx: Context) => {
    Logger.log("Function: getUserId", __filename);
    const token = await this.serviceAuth.getLoginToken(ctx);
    return "string" === typeof token
      ? this.serviceUser.getUserData(token, "user_id")
      : null;
  };

  private getUserLinks = async (userId: number) => {
    Logger.log("Function: getUserLinks", __filename);
    return "number" === typeof userId ? this.serviceLink.getLinks(userId) : [];
  };

  public routes = routes;

  public usePrivateRoute = async (ctx: Context, next: Next) => {
    Logger.log("Function: usePrivateRoute", __filename);
    return (await this.itCanPass(ctx))
      ? await next()
      : ctx.redirect(this.routes.main);
  };

  public main = async (ctx: Context) => {
    Logger.log("Function: main", __filename);
    return (await this.itCanPass(ctx))
      ? ctx.redirect(this.routes.dashboard)
      : ctx.html(
          <Layout>
            <Index></Index>
          </Layout>
        );
  };

  public dashboard = async (ctx: Context) => {
    Logger.log("Function: dashboard", __filename);
    const user = await this.getUser(ctx);

    if (null === user) {
      return ctx.redirect(this.routes.login);
    }

    const isNumber = "number" === typeof user.user_id;
    const userLinks = isNumber ? await this.getUserLinks(user.user_id) : [];
    const tags = isNumber ? this.serviceTag.getTags(user.user_id) : [];
    const [View, linkViewState] = this.serviceLinkView.getLinkView(ctx);
    LinksContext.values = [userLinks];

    ctx.header("Permissions-Policy", "web-share=*");
    // ctx.header("Permissions-Policy", "web-share=self");
    return ctx.html(
      <Layout>
        <Dashboard linkViewState={linkViewState} tags={tags} user={user}>
          {View}
        </Dashboard>
      </Layout>
    );
  };

  public search = async (ctx: Context) => {
    Logger.log("Function: search", __filename);
    const body = await ctx.req.parseBody<{ search: string }>();

    if (body.search.length < 2) {
      return ctx.html("Need more letters!");
    }

    const userId = await this.getUserId(ctx);
    if (null === userId) {
      return ctx.html("Can`t find you!");
    }

    const links = this.serviceSearch
      .search(body.search, userId)
      .filter((link) => null !== link);

    if (links.length === 0) {
      return ctx.html("Nothing found");
    }

    LinksContext.values = [links];
    const [View] = this.serviceLinkView.getLinkView(ctx);
    return ctx.html(
      <Fragment>
        {View}
        <div id="searchResult" hx-swap-oob="beforebegin">
          <button
            id="searchClearButton"
            type="button"
            onclick="searchResult.innerText = ''; this.remove();"
          >
            Clear search result view
          </button>
        </div>
      </Fragment>
    );
  };

  public paginationViewUpdate = async (ctx: Context) => {
    Logger.log("Function: paginationViewUpdate", __filename);
    const user = await this.getUser(ctx);

    if (null === user) {
      return ctx.html(
        <Notification status="warn" body="Something is wrong!" />
      );
    }

    const isNumber = "number" === typeof user.user_id;
    const userLinks = isNumber ? await this.getUserLinks(user.user_id) : [];
    const [View] = this.serviceLinkView.getLinkView(ctx);
    LinksContext.values = [userLinks];
    const body = await ctx.req.parseBody<{ page: string }>();
    const activePage = Number(body.page) || 1;
    this.servicePagination.setActivePage(ctx, body.page);
    ctx.header(
      "HX-Trigger",
      JSON.stringify({ notifyClose: { notificationid: Date.now() } })
    );
    return ctx.html(
      <Fragment>
        <LinksCounter />
        <Pagination activePage={activePage} />
        {View}
      </Fragment>
    );
  };

  public settings = (ctx: Context) => {
    Logger.log("Function: settings", __filename);
    return this.dashboard(ctx);
  };

  public applicationClose = (ctx: Context) => {
    Logger.log("Function: applicationClose", __filename);
    return RouterApplication.close(ctx);
  };
}
