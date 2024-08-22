import { test, expect } from 'bun:test'
import { renderToReadableStream } from 'hono/jsx/streaming'
import { NotificationContainer } from './component.notification-container'

test('Component NotificationContainer', async () => {
    const stream = renderToReadableStream(<NotificationContainer />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
})