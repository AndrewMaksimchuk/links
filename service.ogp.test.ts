import { test, expect, describe } from "bun:test"
import { ServiceOGP } from "./service.ogp"



describe('Service ServiceOGP', () => {
    test("Get correct meta data", async () => {
        const URL = 'https://en.wikipedia.org/wiki/URL'
        const responseData = {
            success: true,
            ogTitle: "URL - Wikipedia",
            ogType: "website",
            ogLocale: "en",
            ogUrl: "https://en.wikipedia.org/wiki/URL",
        }
        const metadata = await ServiceOGP.getMeta(URL)
        expect(metadata).toMatchObject(responseData)
    });


    test("Get null if bad url or throw error", async () => {
        const URL = ''
        const metadata = await ServiceOGP.getMeta(URL)
        expect(metadata).toBeNull()
    });
})
