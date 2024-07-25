import type { Context } from 'hono'
import { Logger } from './service.logger'
import {
    getCookie,
    setCookie,
} from 'hono/cookie'


const NAME = 'pagination-active-page'


export class ServicePagination {
    public setActivePage(ctx: Context, page: string) {
        Logger.log('Function: setActivePage', __filename)
        setCookie(ctx, NAME, page, { httpOnly: true, secure: true })
    }


    public getActivePage(ctx: Context) {
        Logger.log('Function: getActivePage', __filename)
        return Number(getCookie(ctx, NAME)) || 1;
    }
}
