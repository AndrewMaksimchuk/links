import { describe, test, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { ServiceAuth } from './service.auth'


const USER = {
    id: 'Scuhos6drewim%',
}
const cookieString = `token=Scuhos6drewim%25.EraT0WiommR1vOMv8XLldeRxWsLgQMFlgt4WELz%2Bkjg%3D; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Strict`
let service: ServiceAuth


beforeAll(() => {
    service = new ServiceAuth()
})


describe('Service Auth', () => {
    const app = new Hono()


    app.get('/login', async (ctx) => {
        await service.login(ctx, USER.id)
        return ctx.text('Welcome!');
    })


    test.todo('should set user as login, set cookie', async () => {
        const res = await app.request('http://localhost/login')
        expect(res.status).toBe(200)
        const header = res.headers.get('Set-Cookie')
        expect(header).toBe(cookieString)
    })


    app.get('/logout', async (ctx) => {
        await service.logout(ctx)
        return ctx.text('Goodby!');
    })


    test.todo('should set user as logout, delete cookie', async () => {
        const res = await app.request('http://localhost/logout')
        expect(res.status).toBe(200)
        const header = res.headers.get('Set-Cookie')
        expect(header).toBe(`token=; Max-Age=0; Path=/`)
    })


    app.get('/get-token', async (ctx) => {
        const token = await service.getLoginToken(ctx)
        return ctx.json({ token });
    })


    test('should return correct user login token', async () => {
        const req = new Request('http://localhost/get-token')
        req.headers.set('Cookie', cookieString)
        const res = await app.request(req)
        const { token } = await res.json()
        expect(token).toBe(USER.id)
    })


    test('should not return user login token', async () => {
        const req = new Request('http://localhost/get-token')
        const res = await app.request(req)
        const { token } = await res.json()
        expect(token).toBeUndefined()
    })
})
