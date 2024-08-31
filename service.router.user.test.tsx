// @ts-nocheck
import { describe, test, expect, mock } from 'bun:test'
import { HonoRequest } from './node_modules/hono/dist/request'
import { Context } from './node_modules/hono/dist/context'
import { RouterUser } from './service.router.user'
import { testUser } from './test.fixture'


mock.module('bun', () => {
    return {
        $: async () => 0
    };
})


let service: RouterUser
const routes = {
    main: '/',
    dashboard: '/dashboard'
}


const buildService = (options: Partial<{
    ServiceUser: ServiceUser,
    ServiceAuth: ServiceAuth,
    getUser: (ctx: Context) => Promise<UserDatabase | null>,
    getUserId: (ctx: Context) => Promise<number | null>,
}> = {}) => {
    return new RouterUser(
        {
            isNewUser: () => true,
            setNewUser: async () => {
                return {
                    telephone: testUser.telephone,
                    password: testUser.password,
                };
            },
            verifyUser: async () => { },
            updateName: () => { },
            ...options.ServiceUser
        },
        {
            login: async () => { },
            logout: () => true,
            ...options.ServiceAuth
        },
        routes,
        options.getUser ?? (async () => { }),
        options.getUserId ?? (async () => { })
    );
}


describe('Service router user', () => {
    test('login(), should redirect to main page, bad user', async () => {
        const client = new Request('http://localhost/login', { method: "POST", body: new URLSearchParams("telephone=" + testUser.telephone) })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceUser: {
                setNewUser: async () => null,
            }
        })
        const res = await service.login(ctx)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(routes.main)
    })


    test('login(), should redirect to dashboard page, all good', async () => {
        const client = new Request('http://localhost/login', { method: "POST", body: new URLSearchParams("telephone=" + testUser.telephone) })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.login(ctx)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(routes.dashboard)
    })


    test('logout(), should redirect to main page', async () => {
        const client = new Request('http://localhost/logout')
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.logout(ctx)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(routes.main)
    })


    test('userUpdateName(), should show notification - user name is empty', async () => {
        const client = new Request('http://localhost/user-update-name', { method: "POST", body: new URLSearchParams("userName=") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.userUpdateName(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = document.querySelector('p')?.textContent
        expect(element).toContain('Can`t update your name')
    })


    test('userUpdateName(), should show notification - bad user', async () => {
        const client = new Request('http://localhost/user-update-name', { method: "POST", body: new URLSearchParams("userName=admin") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => null
        })
        const res = await service.userUpdateName(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = document.querySelector('p')?.textContent
        expect(element).toContain('You bad')
    })


    test('userUpdateName(), should show notification - can`t update name', async () => {
        const client = new Request('http://localhost/user-update-name', { method: "POST", body: new URLSearchParams("userName=admin") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => { },
            ServiceUser: {
                updateName: () => null,
            }
        })
        const res = await service.userUpdateName(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = document.querySelector('p')?.textContent
        expect(element).toContain('Can`t update your name')
    })


    test('userUpdateName(), should show notification - the same name', async () => {
        const client = new Request('http://localhost/user-update-name', { method: "POST", body: new URLSearchParams("userName=admin") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => ({ name: 'admin' }),
            ServiceUser: {
                updateName: () => ({ name: 'admin' }),
            }
        })
        const res = await service.userUpdateName(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = document.querySelector('p')?.textContent
        expect(element).toContain('Your name the same, nothing to change')
    })


    test('userUpdateName(), should show new UI ', async () => {
        const newName = 'admin'
        const client = new Request('http://localhost/user-update-name', { method: "POST", body: new URLSearchParams("userName=" + newName) })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => ({ name: 'user' }),
            ServiceUser: {
                updateName: () => ({ name: newName }),
            }
        })
        const res = await service.userUpdateName(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const nameElement = document.getElementById('userGreeting')?.textContent
        expect(nameElement).toContain(newName)
        const element = String(document.querySelector('#notification > div > p')?.textContent)
        expect(element).toContain('Name is updated')
    })


    test('userDataDownload(), should show notification - error with user', async () => {
        const client = new Request('http://localhost/user-data-download')
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUserId: async () => null,
        })
        const res = await service.userDataDownload(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = String(document.querySelector('p')?.textContent)
        expect(element).toContain('Can`t get you')
    })


    test.todo('userDataDownload(), should show notification - can`t get user data', async () => {
        const client = new Request('http://localhost/user-data-download')
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => 1,
        })
        const res = await service.userDataDownload(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = String(document.querySelector('p')?.textContent)
        expect(element).toContain('Can`t get your data')
    })


    test.todo('userDataDownload(), should show notification - can`t create archive', async () => {
        const client = new Request('http://localhost/user-data-download')
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => 1,
        })
        const res = await service.userDataDownload(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = String(document.querySelector('p')?.textContent)
        expect(element).toContain('Can`t create archive')
    })


    test.todo('userDataDownload(), should show notification - can`t get archive', async () => {
        const client = new Request('http://localhost/user-data-download')
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => 1,
        })
        const res = await service.userDataDownload(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body)
        const element = String(document.querySelector('p')?.textContent)
        expect(element).toContain('Can`t get archive')
    })


    test.todo('userDataDownload(), should send file for download', async () => {
        const client = new Request('http://localhost/user-data-download')
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => 1,
        })
        const res = await service.userDataDownload(ctx)
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="user-data.tar.gz"')
    })
})
