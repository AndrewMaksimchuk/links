import { test, expect, describe } from "bun:test"
import { ServiceSearch } from "./service.search"
import { ServiceDatabase } from "./service.database";

describe('Service Search', () => {
    test("should return links that contain search text", async () => {
        const service = new ServiceSearch(ServiceDatabase.instance)
        const links = service.search('mozilla', 1)
        expect(links.length).toBeGreaterThan(0)
    });


    test("should not find the links", async () => {
        const service = new ServiceSearch(ServiceDatabase.instance)
        const links = service.search('this_text_not_exist_in_links', 1)
        expect(links).toBeArrayOfSize(0)
    });
})
