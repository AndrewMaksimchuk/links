import { test, expect } from "bun:test"
import { renderToReadableStream } from "hono/jsx/streaming"
import { Indicator } from "./component.indicator"


test("Component Indicator", async () => {
    const stream = renderToReadableStream(<Indicator />)
    expect(await Bun.readableStreamToText(stream)).toMatchSnapshot()
});
