import { describe, test, expect } from 'bun:test'
import { renderToReadableStream } from 'hono/jsx/streaming'
import { Index } from './page.index'


describe('Page Index', () => {
    test('render', async () => {
        const stream = renderToReadableStream(<Index />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })
})
