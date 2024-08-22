import { describe, test, expect } from 'bun:test'
import { renderToReadableStream } from 'hono/jsx/streaming'
import { TagNotification } from './component.tag-notification';


describe('Component TagNotification', () => {
    test('without props', async () => {
        const stream = renderToReadableStream(<TagNotification />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('with name, color and tagId', async () => {
        const stream = renderToReadableStream(<TagNotification name='web' color='blue' tagId={0} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('without delete button', async () => {
        const stream = renderToReadableStream(<TagNotification text='fish text' />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })
})
