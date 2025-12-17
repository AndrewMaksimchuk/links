import type { Context } from "hono"
import type { ServiceTag } from "./service.tag"
import { getCookie, setCookie } from 'hono/cookie'
import { Logger } from "./service.logger"
import { Links } from "./component.links"
import { Tabs } from "./component.tabs"
import { TagsContext } from "./page.dashboard"


export type View = 'card' | 'table'


export class ServiceLinkView {
    private serviceTag: ServiceTag
    private getUserId: (ctx: Context) => Promise<number | null>
    private defaultView = 'card' as const
    private cookieKey = 'linkView' as const
    public views = {
        card: 'card',
        table: 'table',
    } as const


    constructor(
        serviceTag: ServiceTag,
        getUserId: (ctx: Context) => Promise<number | null>,
    ) {
        Logger.log('Function: constructor, class ServiceLinkView', __filename)
        this.getUserId = getUserId
        this.serviceTag = serviceTag
    }


    private getView(view: View) {
        return <Tabs><Links view={view} /></Tabs>;
    }


    public setLinkView(ctx: Context, currentView: View = this.defaultView) {
        setCookie(ctx, this.cookieKey, currentView, { httpOnly: true, secure: true })
        return this.getView(currentView);
    }


    public getLinkView = async (ctx: Context) => {
        Logger.log('Function: getLinkView', __filename)

        TagsContext.values = [[]]
        const userId = await this.getUserId(ctx)

        if (userId) {
            const tags = this.serviceTag.getTags(userId);
            TagsContext.values = [tags];
        }

        const view = (getCookie(ctx, this.cookieKey) ?? this.defaultView) as View
        return [this.getView(view), view] as const;
    }
}
