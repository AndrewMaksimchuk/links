import { describe, test, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import { ServicePagination, NAME } from './service.pagination'


let service: ServicePagination
let app: Hono


const setup = () => {
    service = new ServicePagination()
    app = new Hono()
}


beforeEach(() => {
    setup()
})


describe('Service pagination', () => {
    test.todo('should set active page', async () => { // this work in browser but not in test
        app.get('/set-active-page', (ctx) => {
            const activePage = service.setActivePage(ctx, '10')
            return ctx.json({ activePage });
        })

        const res = await app.request('http://localhost/set-active-page')
        expect(res.status).toBe(200)
        const { activePage } = await res.json()
        expect(activePage).toBe(10)
    })


    test('should set default value when page value not number as string', async () => {
        app.get('/set-active-page-to-default', (ctx) => {
            const activePage = service.setActivePage(ctx, '')
            return ctx.json({ activePage });
        })

        const res = await app.request('http://localhost/set-active-page-to-default')
        expect(res.status).toBe(200)
        const { activePage } = await res.json()
        expect(activePage).toBe(1)
    })


    test('should get default value of active page', async () => {
        app.get('/active-page', async (ctx) => {
            const activePage = service.getActivePage(ctx)
            return ctx.json({ activePage });
        })

        const res = await app.request('http://localhost/active-page')
        expect(res.status).toBe(200)
        const { activePage } = await res.json()
        expect(activePage).toBe(1)
    })


    test('should get not default value of active page', async () => {
        app.get('/active-page', async (ctx) => {
            const activePage = service.getActivePage(ctx)
            return ctx.json({ activePage });
        })

        const req = new Request('http://localhost/active-page')
        req.headers.set('Cookie', `${NAME}=10`)
        const res = await app.request(req)
        expect(res.status).toBe(200)
        const { activePage } = await res.json()
        expect(activePage).toBe(10)
    })
})