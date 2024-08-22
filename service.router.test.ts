// @ts-nocheck
// import type { Context } from 'hono'
import { describe, test, expect } from 'bun:test'
import { Router } from './service.router'
import { Context } from './node_modules/hono/dist/context'


describe('Service Router', () => {
    test.todo('', async () => {
        const req = new Request('http://localhost/')
        const ctx = new Context(req)
        console.log(ctx)

        const service = new Router(
            {
                findByPasswordHash: () => ({}),
            },
            {
                getLoginToken: async () => '',
            }
        )
        const res = await service.main(ctx)

        console.log(res)
    })



})
