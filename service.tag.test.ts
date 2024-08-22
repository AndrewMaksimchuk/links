import { test, expect, describe, beforeAll } from "bun:test"
import { ServiceDatabase } from "./service.database";
import { ServiceTag } from "./service.tag";


let service: ServiceTag
const tag = {
    name: 'javascript',
    color: 'yellow',
}


beforeAll(() => {
    service = new ServiceTag(ServiceDatabase.instance)
})


describe('Service Tag', () => {
    test("should create new tag", async () => {
        const createdTag = service.createTag(tag, 1)
        expect(createdTag).toMatchObject(tag)
    })


    test("should return null as tag for not existing user", async () => {
        const createdTag = service.createTag(tag, NaN)
        expect(createdTag).toBeNull()
    })


    test("should return tags", async () => {
        const tags = service.getTags(1)
        expect(tags.length).toBeGreaterThan(0)
    })


    test("should delete tag", async () => {
        const createdTag = service.createTag(tag, 1)!
        const deletedTagId = service.deleteTag(createdTag?.tag_id)
        expect(createdTag.tag_id).toBe(deletedTagId)
    })
})
