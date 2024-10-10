import { test, expect } from "bun:test"
import { renderToReadableStream } from "hono/jsx/streaming"
import { ButtonEdit, LinkFormEdit, LinkOne, Links } from "./component.links"
import type { Link } from "./service.link";


test("Component Links view is card", async () => {
    const stream = renderToReadableStream(<Links view="card" />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});


test("Component Links view is table", async () => {
    const stream = renderToReadableStream(<Links view="table" />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});


export const link: Link = {
    /* LinkDatabase */
    link_id: 0,
    user_id: 0,
    url: 'test.com',
    created_at: 0,
    tags: null,
    /* LinkOGP */
    title: 'Test link',
    image: 'https://www.w3schools.com/images/w3schools_logo_436_2.png',
    audio: '',
    description: 'Use in test cases',
    locale: 'en',
    site_name: '',
    video: '',
    /* TagDatabase */
    tag_id: 0,
    name: '',
    color: '',
}


test("Component LinkOne view is card", async () => {
    const stream = renderToReadableStream(<LinkOne link={link} view="card" />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});


test("Component LinkOne view is table", async () => {
    const stream = renderToReadableStream(<LinkOne link={link} view="table" />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});


test("Component LinkFormEdit view is card", async () => {
    const stream = renderToReadableStream(<LinkFormEdit link={link} view="card" />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});


test("Component LinkFormEdit view is table", async () => {
    const stream = renderToReadableStream(<LinkFormEdit link={link} view="table" />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});


test("Component ButtonEdit", async () => {
    const stream = renderToReadableStream(<ButtonEdit linkId={link.link_id} />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});
