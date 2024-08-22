import { describe, test, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { renderToReadableStream } from "hono/jsx/streaming"
import { ServiceLinkView } from './service.link-view'


let service: ServiceLinkView


beforeAll(() => {
    service = new ServiceLinkView()
})


describe('Service ServiceLinkView', () => {
    const app = new Hono()


    app.get('/view-default', (ctx) => {
        const View = service.setLinkView(ctx)
        return ctx.html(View);
    })


    test('should show default view', async () => {
        const res = await app.request('http://localhost/view-default')
        expect(res.status).toBe(200)
        expect(res.headers.get('content-type')).toBe('text/html; charset=UTF-8')
        expect(res.body).not.toBeNull()
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('section.grid')
        expect(element).not.toBeNull()
    })


    app.get('/view-table', (ctx) => {
        const View = service.setLinkView(ctx, service.views.table)
        return ctx.html(View);
    })


    test('should show selected "table" view', async () => {
        const res = await app.request('http://localhost/view-table')
        expect(res.status).toBe(200)
        expect(res.headers.get('content-type')).toBe('text/html; charset=UTF-8')
        expect(res.body).not.toBeNull()
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('table')
        expect(element).not.toBeNull()
    })


    app.get('/view-card', async (ctx) => {
        const [Representation, name] = service.getLinkView(ctx)
        const stream = renderToReadableStream(Representation)
        const html = await Bun.readableStreamToText(stream)
        return ctx.json({
            html,
            name,
        });
    })


    test('should return correct setted "card" view name and html representation', async () => {
        const req = new Request('http://localhost/view-card')
        req.headers.set('Cookie', `linkView=${service.views.card}`)
        const res = await app.request(req)
        const { html, name } = await res.json()
        expect(name).toBe(service.views.card)
        document.body.innerHTML = html
        const element = document.querySelector('section.grid')
        expect(element).not.toBeNull()
    })


    test('should return correct setted "table" view name and html representation', async () => {
        const req = new Request('http://localhost/view-card')
        req.headers.set('Cookie', `linkView=${service.views.table}`)
        const res = await app.request(req)
        const { html, name } = await res.json()
        expect(name).toBe(service.views.table)
        document.body.innerHTML = html
        const element = document.querySelector('table')
        expect(element).not.toBeNull()
    })
})
