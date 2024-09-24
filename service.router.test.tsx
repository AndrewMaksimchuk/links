// @ts-nocheck
import { describe, test, expect, spyOn } from 'bun:test'
import { HonoRequest } from './node_modules/hono/dist/request'
import { Context } from './node_modules/hono/dist/context'
import { Router } from './service.router'
import { Links } from "./component.links"
import { testUserLinks } from './test.fixture'


let service: Router


describe('Service Router', () => {
    test('should have one or more routes', () => {
        service = new Router()
        const length = Object.keys(service.routes).length
        expect(length).toBeGreaterThan(0)
    })


    test('usePrivateRoute(), should pass to private routes', async () => {
        const req = new Request('http://localhost/')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: async () => '',
            }
        )
        const honoNext = {
            next: () => ({ status: 200 })
        }
        const res = await service.usePrivateRoute(ctx, honoNext.next)
        expect(res.status).toBe(200)
    })


    test('usePrivateRoute(), should not pass to private routes', async () => {
        const req = new Request('http://localhost/')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => null,
            },
            {
                getLoginToken: async () => false,
            }
        )
        const res = await service.usePrivateRoute(ctx)
        expect(res.status).toBe(302)
    })


    test('should redirect to dashboard page', async () => {
        const req = new Request('http://localhost/')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: async () => '',
            }
        )
        const { status } = await service.main(ctx)
        expect(status).toBe(302)
    })


    test('should not redirect to dashboard page, but show main page', async () => {
        const req = new Request('http://localhost/')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: async () => undefined,
            }
        )
        const res = await service.main(ctx)
        expect(res.status).toBe(200)
        expect(await Bun.readableStreamToText(res.body)).toMatchSnapshot()
    })


    test('should not show dashboard, but redirect to login page, can`t get user', async () => {
        const req = new Request('http://localhost/dashboard')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: async () => undefined,
            }
        )
        const { status } = await service.dashboard(ctx)
        expect(status).toBe(302)
    })



    test('should show dashboard', async () => {
        const req = new Request('http://localhost/dashboard')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => ({
                    user_id: 1,
                }),
            },
            {
                getLoginToken: async () => '',
            },
            {
                getLinks: () => [],
            },
            {
                getTags: () => [],
            }, {}, {},
            {
                getLinkView: () => [<Links view='card' />, 'card']
            }
        )
        const { status, body } = await service.dashboard(ctx)
        expect(status).toBe(200)
        expect(await Bun.readableStreamToText(body)).toMatchSnapshot()
    })


    test('search, should ask to write more letters', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=a") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router()
        const res = await service.search(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await res.text()).toBe("Need more letters!")
    })


    test('search, should not find a user', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=abc") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router({},
            {
                getLoginToken: () => undefined
            }
        )
        const res = await service.search(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await res.text()).toBe("Can`t find you!")
    })


    test('search, should not find any results', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=abc") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router(
            {
                getUserData: () => { }
            },
            {
                getLoginToken: () => ''
            }, {}, {},
            {
                search: () => []
            }
        )
        const res = await service.search(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await res.text()).toBe("Nothing found")
    })


    test('search, should find results', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=T62") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router(
            {
                getUserData: () => { }
            },
            {
                getLoginToken: () => ''
            }, {}, {},
            {
                search: () => testUserLinks
            }, {},
            {
                getLinkView: () => [<Links view='card' />]
            }
        )
        const res = await service.search(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await Bun.readableStreamToText(res.body)).toMatchSnapshot()
    })


    test('paginationViewUpdate(), should show notification with "warn" status and message', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=T62") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router(
            {},
            {
                getLoginToken: () => undefined
            }
        )
        const res = await service.paginationViewUpdate(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await Bun.readableStreamToText(res.body)).toMatchSnapshot()
    })


    test('paginationViewUpdate(), should show view as card', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=T62") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router(
            {
                getUserData: () => { },
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: () => ''
            }, {}, {},
            {
                search: () => testUserLinks
            },
            {
                setActivePage: () => { }
            },
            {
                getLinkView: () => [<Links view='card' />]
            }
        )
        const res = await service.paginationViewUpdate(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await Bun.readableStreamToText(res.body)).toMatchSnapshot()
    })


    test('paginationViewUpdate(), should show view as table', async () => {
        const client = new Request('http://localhost/search', { method: "POST", body: new URLSearchParams("search=T62") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        const service = new Router(
            {
                getUserData: () => ({ user_id: 1 }),
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: () => ''
            },
            {
                getLinks: () => []
            }, {},
            {
                search: () => testUserLinks
            },
            {
                setActivePage: () => { }
            },
            {
                getLinkView: () => [<Links view='table' />]
            }
        )
        const res = await service.paginationViewUpdate(ctx)
        expect(res.headers.get('Content-Type')).toMatch('text/html')
        expect(await Bun.readableStreamToText(res.body)).toMatchSnapshot()
    })


    test('settings(), should show dashboard', async () => {
        const req = new Request('http://localhost/dashboard')
        const ctx = new Context(req)
        const service = new Router(
            {
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: async () => '',
            }, {}, {}, {}, {},
            {
                getLinkView: () => [<Links view='card' />, 'card']
            }
        )
        const { status, body } = await service.settings(ctx)
        expect(status).toBe(200)
        expect(await Bun.readableStreamToText(body)).toMatchSnapshot()
    })
})
