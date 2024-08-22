import type { Context } from 'hono'
import {
    getCookie,
    setCookie,
} from 'hono/cookie'
import { Logger } from './service.logger'


export const NAME = 'pagination-active-page'


export class ServicePagination {
    public setActivePage(ctx: Context, page: string) {
        Logger.log('Function: setActivePage', __filename)
        const isSafePageNumber = parseInt(page, 10) > 0
        const pageNumber = isSafePageNumber ? page : '1'
        setCookie(ctx, NAME, pageNumber, { httpOnly: true, secure: true })
        return Number(getCookie(ctx, NAME)) || 1;
    }


    public getActivePage(ctx: Context) {
        Logger.log('Function: getActivePage', __filename)
        return Number(getCookie(ctx, NAME)) || 1;
    }
}
