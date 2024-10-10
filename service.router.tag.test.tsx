// @ts-nocheck
import { describe, test, expect } from 'bun:test'
import { HonoRequest } from './node_modules/hono/dist/request'
import { Context } from './node_modules/hono/dist/context'
import { RouterTag } from './service.router.tag'


let service: RouterTag


describe('Service router tag', () => {
    test('tagCreate(), should not create tag, user not found', async () => {
        const req = new Request('http://localhost/tag-create')
        const ctx = new Context(req)
        service = new RouterTag({}, () => null)
        const res = await service.tagCreate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('span')
        expect(element?.innerText.trim()).toBe('Can`t create tag!')
    })


    test('tagCreate(), should not create tag, serviceTag error ', async () => {
        const client = new Request('http://localhost/tag-create', { method: "POST", body: new URLSearchParams("tag_id=1") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = new RouterTag(
            {
                createTag: () => { },
                getTags: () => [],
            },
            () => 1
        )
        const res = await service.tagCreate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('span')
        expect(element?.innerText.trim()).toBe('Can`t create tag!')
    })


    test('tagCreate(), should create a new tag', async () => {
        const tag = { tag_id: 1, name: 'html', color: 'blue' }
        const client = new Request('http://localhost/tag-create', { method: "POST", body: new URLSearchParams("tag_id=1") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = new RouterTag(
            {
                createTag: () => { },
                getTags: () => [tag],
            },
            () => tag.tag_id
        )
        const res = await service.tagCreate(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('span')
        expect(element?.querySelector('button[value="1"')).not.toBeNull()
        expect(element?.innerText.trim()).toContain(tag.name)
        expect(element?.style.color).toBe(tag.color)
    })


    test('tagDelete(), should delete existing tag', async () => {
        const client = new Request('http://localhost/tag-delete', { method: "POST", body: new URLSearchParams("tag_id=1") })
        const req = new HonoRequest(client)
        const ctx = new Context(req)
        service = new RouterTag(
            {
                deleteTag: () => { },
            }
        )
        const res = await service.tagDelete(ctx)
        document.body.innerHTML = await Bun.readableStreamToText(res.body!)
        const element = document.querySelector('span')
        expect(element?.innerText.trim()).toContain('Tag deleted!')
    })
})