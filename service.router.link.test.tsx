// @ts-nocheck
import type { ServiceLink } from './service.link'
import type { ServiceTag } from './service.tag'
import type { ServicePagination } from './service.pagination'
import type { ServiceLinkView } from './service.link-view'
import type { UserDatabase, LinkDatabase, TagDatabase } from './service.database'
import { describe, test, expect, mock } from 'bun:test'
import { HonoRequest } from './node_modules/hono/dist/request'
import { Context } from './node_modules/hono/dist/context'
import { Fragment } from 'hono/jsx'
import { testUserLinks, testTags } from './test.fixture'
import { RouterLink } from './service.router.link'


let service: RouterLink


const buildService = (options: Partial<{
    ServiceLink: ServiceLink,
    ServiceTag: ServiceTag,
    ServicePagination: ServicePagination,
    ServiceLinkView: ServiceLinkView,
    getUser: (ctx: Context) => Promise<UserDatabase | null>,
    getUserId: (ctx: Context) => Promise<number | null>,
    getUserLinks: (userId: number) => Promise<(LinkDatabase & TagDatabase)[]>
}> = {}) => {
    return new RouterLink(
        { ...options.ServiceLink },
        { ...options.ServiceTag },
        {
            getActivePage: () => 1,
            ...options.ServicePagination
        },
        {
            views: {
                table: 'table',
                card: 'card',
            },
            setLinkView: (_, setViewTo: string) => setViewTo,
            ...options.ServiceLinkView
        },
        options.getUser ?? (async () => { }),
        options.getUserId ?? (async () => { }),
        options.getUserLinks ?? (async () => { }),
    );
}


describe('Service router link', () => {
    test('linkChangeView(), should show by default card view', async () => {
        const client = new Request('http://localhost/link-change-view', { method: "POST" })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.linkChangeView(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const elementPagination = document.getElementById('paginationSectionButtons')
        expect(elementPagination).toBeNull()

        const elementView = document.body.textContent
        expect(elementView).toContain("card")
    })


    test('linkChangeView(), should show table view', async () => {
        const client = new Request('http://localhost/change-view', { method: "POST", body: new URLSearchParams("viewState=on") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.linkChangeView(ctx)
        expect(res.status).toBe(200)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const elementPagination = document.getElementById('paginationSectionButtons')
        expect(elementPagination).toBeNull()

        const elementView = document.body.textContent
        expect(elementView).toContain("table")
    })


    test('linkAdd(), should show notification - bad url protocol', async () => {
        const client = new Request('http://localhost/link-add', {
            method: "POST", body: new URLSearchParams({
                url: 'http://localhost',
                created_at: '0',
                tags: '1'
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.linkAdd(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.innerText.trim()).toContain('Change to correct working link')
    })



    test('linkAdd(), should show notification - bad url domain name', async () => {
        const client = new Request('http://localhost/link-add', {
            method: "POST", body: new URLSearchParams({
                url: 'https://localhost',
                created_at: '0',
                tags: '1'
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService()
        const res = await service.linkAdd(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.innerText.trim()).toContain('Change to correct working link')
    })


    test('linkAdd(), should show notification - bad user', async () => {
        const client = new Request('http://localhost/link-add', {
            method: "POST", body: new URLSearchParams({
                url: 'https://localhost.io',
                created_at: '0',
                tags: '1'
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUser: async () => null
        })
        const res = await service.linkAdd(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.innerText.trim()).toContain('Can`t get user')
    })


    test('linkAdd(), should faile when create a new link', async () => {
        const client = new Request('http://localhost/link-add', {
            method: "POST", body: new URLSearchParams({
                url: 'https://localhost.io',
                created_at: '0',
                tags: '1'
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                setNewLink: async () => null,
            },
            ServiceLinkView: {
                getLinkView: () => [<Fragment />, "card"],
            },
            getUser: async () => ({
                user_id: 1,
                name: '',
                password: '',
                telephone: '',
            }),
            getUserLinks: async () => testUserLinks
        })
        const res = await service.linkAdd(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.innerText.trim()).toContain('Can`t create new link')
    })


    test('linkAdd(), should update UI with new link', async () => {
        const client = new Request('http://localhost/link-add', {
            method: "POST", body: new URLSearchParams({
                url: 'https://localhost.io',
                created_at: '0',
                tags: '1'
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                setNewLink: async () => (testUserLinks[0]),
            },
            ServiceLinkView: {
                getLinkView: () => [<Fragment />, "card"],
            },
            ServicePagination: {
                getActivePage: () => 1,
            },
            getUser: async () => ({
                user_id: 1,
                name: '',
                password: '',
                telephone: '',
            }),
            getUserLinks: async () => testUserLinks
        })
        const res = await service.linkAdd(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const elementLinkCounter = document.getElementById('linksCounter')
        expect(elementLinkCounter?.textContent).toBe(testUserLinks.length + ' pcs')

        const elementPagination = document.getElementById('paginationSectionButtons')
        expect(elementPagination).toBeNull()

        const elementNotification = document.querySelector('p')
        expect(elementNotification?.innerText.trim()).toContain('Add new link!')
    })


    test('linkEdit(), should show notification - can`t get link', async () => {
        const client = new Request('http://localhost/link-edit', {
            method: "POST", body: new URLSearchParams('linkId=1')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                getLink: () => null,
            },
        })
        const res = await service.linkEdit(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const element = document.querySelector('p')
        expect(element?.textContent).toContain('Can`t get link')
    })


    test('linkEdit(), should show notification - bad user', async () => {
        const client = new Request('http://localhost/link-edit', {
            method: "POST", body: new URLSearchParams('linkId=1')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                getLink: () => { },
            },
            getUserId: async () => null,
        })
        const res = await service.linkEdit(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const element = document.querySelector('span')
        expect(element?.textContent).toContain('Can`t find you!')
    })


    test('linkEdit(), should show edit form', async () => {
        const client = new Request('http://localhost/link-edit', {
            method: "POST", body: new URLSearchParams('linkId=1')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                getLink: () => testUserLinks[0],
            },
            ServiceLinkView: {
                getLinkView: () => [<Fragment />, "card"]
            },
            ServiceTag: {
                getTags: () => []
            },
            getUserId: async () => 1,
        })
        const res = await service.linkEdit(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('form')
        expect(element).not.toBeNil()
    })


    test('linkUpdate(), should show notification - bad user', async () => {
        const client = new Request('http://localhost/link-update', {
            method: "POST", body: new URLSearchParams()
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUserId: async () => null,
        })
        const res = await service.linkUpdate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.textContent).toContain('Can`t get you')
    })


    test('linkUpdate(), should show notification - bad link', async () => {
        const client = new Request('http://localhost/link-update', {
            method: "POST", body: new URLSearchParams({
                title: '',
                url: '',
                tags: '',
                link_id: '1',
                description: '',
                site_name: '',
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                updateLink: () => null,
            },
            getUserId: async () => 1,
        })
        const res = await service.linkUpdate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.textContent).toContain('Can`t get link')
    })


    test('linkUpdate(), should show one link component', async () => {
        const client = new Request('http://localhost/link-update', {
            method: "POST", body: new URLSearchParams({
                title: '',
                url: '',
                tags: '',
                link_id: '1',
                description: '',
                site_name: '',
            })
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                updateLink: () => testUserLinks[0],
            },
            ServiceLinkView: {
                getLinkView: () => [<Fragment />, "card"]
            },
            getUserId: async () => 1,
        })
        const res = await service.linkUpdate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('article')
        expect(element?.textContent).toContain(testUserLinks[0].url)
    })


    test('linkGet(), should show notification - bad link id', async () => {
        const client = new Request('http://localhost/link-get', {
            method: "POST", body: new URLSearchParams('linkId=')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                getLink: () => null,
            },
        })
        const res = await service.linkGet(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('p')
        expect(element?.textContent).toContain('Can`t get link')
    })


    test('linkGet(), should show one link', async () => {
        const client = new Request('http://localhost/link-get', {
            method: "POST", body: new URLSearchParams('linkId=1')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                getLink: () => testUserLinks[0],
            },
            ServiceLinkView: {
                getLinkView: () => [<Fragment />, "card"]
            },
        })
        const res = await service.linkGet(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('article')
        expect(element?.textContent).toContain(testUserLinks[0].url)
    })


    test('linkDelete(), should delete link and update UI', async () => {
        const client = new Request('http://localhost/link-delete', {
            method: "POST", body: new URLSearchParams('linkId=1')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                deleteLink: () => true,
            },
            ServicePagination: {
                getActivePage: () => 1,
            },
            getUserId: async () => 1,
            getUserLinks: async () => testUserLinks,
        })
        const res = await service.linkDelete(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const elementCounter = document.getElementById('linksCounter')
        expect(elementCounter).not.toBeNull()

        const elementNotification = document.querySelector('p')
        expect(elementNotification?.textContent).toContain('Link deleted')
    })


    test('linkDelete(), should show notification - can`t delete link', async () => {
        const client = new Request('http://localhost/link-delete', {
            method: "POST", body: new URLSearchParams('linkId=1')
        })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceLink: {
                deleteLink: () => false,
            },
            getUserId: async () => 1,
        })
        const res = await service.linkDelete(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const elementNotification = document.querySelector('p')
        expect(elementNotification?.textContent).toContain('Can`t delete link')
    })


    test('linkAddFormUpdate(), should show add form without tags', async () => {
        const client = new Request('http://localhost/link-add', { method: "POST" })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            getUserId: async () => null,
        })
        const res = await service.linkAddFormUpdate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const elementForm = document.querySelector('form')
        expect(elementForm).not.toBeNull()

        const elementSelect = document.getElementById('tags')
        expect(elementSelect).toBeNull()
    })


    test('linkAddFormUpdate(), should show add form with tags', async () => {
        const client = new Request('http://localhost/link-add', { method: "POST" })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = buildService({
            ServiceTag: {
                getTags: () => testTags
            },
            getUserId: async () => 1,
        })
        const res = await service.linkAddFormUpdate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)

        const elementForm = document.querySelector('form')
        expect(elementForm).not.toBeNull()

        const elementSelect = document.getElementById('tags')
        expect(elementSelect).toBeTruthy()
    })
})