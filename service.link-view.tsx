import type { Context } from "hono"
import { getCookie, setCookie } from 'hono/cookie'
import { Logger } from "./service.logger"
import { Links } from "./component.links"


export type View = 'card' | 'table'


export class ServiceLinkView {
    private defaultView = 'card' as const
    private cookieKey = 'linkView' as const
    public views = {
        card: 'card',
        table: 'table',
    } as const


    constructor() {
        Logger.log('Function: constructor, class ServiceLinkView', __filename)
    }


    private getView(view: View) {
        return <Links view={view} />;
    }


    public setLinkView(ctx: Context, currentView: View = this.defaultView) {
        setCookie(ctx, this.cookieKey, currentView, { httpOnly: true, secure: true })
        return this.getView(currentView);
    }


    public getLinkView = (ctx: Context) => {
        Logger.log('Function: getLinkView', __filename)
        const view = (getCookie(ctx, this.cookieKey) ?? this.defaultView) as View
        return [this.getView(view), view] as const;
    }
}
