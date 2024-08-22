import { describe, test, expect } from 'bun:test'
import { renderToReadableStream } from 'hono/jsx/streaming'
import { Dashboard } from './page.dashboard';
import type { User } from './service.user';
import type { Tag } from './service.tag';


const user: User = {
    name: 'Andrew',
    password: 'root',
    telephone: '+380',
    user_id: 0,
}


const tag: Tag = {
    color: 'blue',
    name: 'web',
    tag_id: 0,
}


describe('Page Dashboard', () => {
    test('view card', async () => {
        const stream = renderToReadableStream(<Dashboard
            linkViewState='card'
            tags={[]}
            user={user} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })

    test('view table', async () => {
        const stream = renderToReadableStream(<Dashboard
            linkViewState='table'
            tags={[]}
            user={user} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })


    test('view table with tags', async () => {
        const stream = renderToReadableStream(<Dashboard
            linkViewState='table'
            tags={[tag]}
            user={user} />)
        expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
    })
})
