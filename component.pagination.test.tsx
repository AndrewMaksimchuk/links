import { describe, test, expect, mock } from 'bun:test'
import { renderToReadableStream } from 'hono/jsx/streaming'
import { createContext } from 'hono/jsx'
import { link } from './component.links.test'
import { Pagination } from './component.pagination'


mock.module('./page.dashboard', () => {
    return {
        LinksContext: createContext([]),
    };
})


describe('Component Pagination', () => {
    test('without links', async () => {
        const stream = renderToReadableStream(<Pagination activePage={1} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('with links', async () => {
        mock.module('./page.dashboard', () => {
            return {
                LinksContext: createContext(new Array(35).fill(link)),
            };
        })
        const stream = renderToReadableStream(<Pagination activePage={1} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })
})
