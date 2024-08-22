import { describe, test, expect } from 'bun:test'
import { renderToReadableStream } from 'hono/jsx/streaming'
import { Notification } from './component.notification'

describe('Component Notification', () => {
    test('status info', async () => {
        const stream = renderToReadableStream(<Notification
            status='info'
            body='Test info status'
            header='Information about some stuff'
            notificationid={0} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('status error', async () => {
        const stream = renderToReadableStream(<Notification
            status='error'
            body='Test info status'
            header='Information about some stuff'
            notificationid={0} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('status success', async () => {
        const stream = renderToReadableStream(<Notification
            status='success'
            body='Test info status'
            header='Information about some stuff'
            notificationid={0} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('status warn', async () => {
        const stream = renderToReadableStream(<Notification
            status='warn'
            body='Test info status'
            header='Information about some stuff'
            notificationid={0} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })
})
