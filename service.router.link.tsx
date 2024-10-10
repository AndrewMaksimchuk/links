import type { Context } from "hono"
import type { ServiceLink, Link } from "./service.link"
import type { Stringify, Prettify } from "./utility.types"
import type { ServicePagination } from "./service.pagination"
import type { ServiceLinkView } from "./service.link-view"
import type { ServiceTag } from "./service.tag"
import type { UserDatabase, LinkDatabase, TagDatabase } from "./service.database"
import { Fragment } from "hono/jsx"
import { Logger } from "./service.logger"
import { TagNotification } from "./component.tag-notification"
import { Add, LinksContext, LinksCounter, TagsContext } from './page.dashboard'
import { Notification } from "./component.notification"
import { LinkFormEdit, LinkOne } from "./component.links"
import { Pagination } from "./component.pagination"


export class RouterLink {
    private serviceLinkView: ServiceLinkView
    private servicePagination: ServicePagination
    private serviceLink: ServiceLink
    private serviceTag: ServiceTag
    private getUser: (ctx: Context) => Promise<UserDatabase | null>
    private getUserId: (ctx: Context) => Promise<number | null>
    private getUserLinks: (userId: number) => Promise<(LinkDatabase & TagDatabase)[]>


    constructor(
        ServiceLink: ServiceLink,
        ServiceTag: ServiceTag,
        ServicePagination: ServicePagination,
        ServiceLinkView: ServiceLinkView,
        getUser: (ctx: Context) => Promise<UserDatabase | null>,
        getUserId: (ctx: Context) => Promise<number | null>,
        getUserLinks: (userId: number) => Promise<(LinkDatabase & TagDatabase)[]>
    ) {
        this.serviceLink = ServiceLink
        this.serviceTag = ServiceTag
        this.servicePagination = ServicePagination
        this.serviceLinkView = ServiceLinkView
        this.getUser = getUser
        this.getUserId = getUserId
        this.getUserLinks = getUserLinks
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


    private isNotValidBodyLinkAdd = (body: Stringify<Pick<Link, "url" | "created_at"> & { tags: string }>) => {
        try {
            Logger.log('Function: isValidBodyLinkAdd', '[ START ]', __filename)
            const urlToAdd = new URL(body.url)
            const isValidProtocol = 'https:' === urlToAdd.protocol // TODO: refactore this function, add more exit points
            const domainParts = urlToAdd.hostname.split('.')
            const topLevelDomain = (1 < domainParts.length && domainParts.at(-1)?.length) || 0
            const isValidDomainname = 1 < topLevelDomain // TODO: change 1 to variable minLengthDomainName=1
            return !(isValidProtocol && isValidDomainname);
        } catch {
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
        const [View] = this.serviceLinkView.getLinkView(ctx)
        const userLinks = "number" === typeof user.user_id ? await this.getUserLinks(user.user_id) : []
        LinksContext.values = [userLinks]

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
        const linkId = ctx.req.query('linkId')
        const link = this.serviceLink.getLink(Number(linkId))

        if (null === link) {
            return ctx.html(<Notification status="error" body="Can`t get link!" />);
        }

        const userId = await this.getUserId(ctx)

        if (null == userId) {
            return ctx.html(<TagNotification text="Can`t find you!" />);
        }

        const tags = this.serviceTag.getTags(userId)
        TagsContext.values = [tags]

        const [, linkViewState] = this.serviceLinkView.getLinkView(ctx)

        return ctx.html(
            <LinkFormEdit view={linkViewState} link={link} />
        );
    }


    public linkUpdate = async (ctx: Context) => {
        Logger.log('Function: linkUpdate', __filename)
        const userId = await this.getUserId(ctx)

        if (null === userId) {
            return ctx.html(<Notification status="error" body="Can`t get you!" />);
        }

        const body = await ctx.req.parseBody<Stringify<Pick<Link, "title" | "url" | "tags" | "link_id" | "description" | "site_name">>>()
        const link = this.serviceLink.updateLink({ ...body, user_id: String(userId) })

        if (null === link) {
            return ctx.html(<Notification status="error" body="Can`t get link!" />);
        }

        const [, linkViewState] = this.serviceLinkView.getLinkView(ctx)
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

        const [, linkViewState] = this.serviceLinkView.getLinkView(ctx)
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


    public linkAddFormUpdate = async (ctx: Context) => {
        Logger.log('Function: linkAddFormUpdate', __filename)
        const userId = await this.getUserId(ctx)

        if (null !== userId) {
            const tags = this.serviceTag.getTags(userId)
            TagsContext.values = [tags]
        }

        return ctx.html(<Add />);
    }
}
