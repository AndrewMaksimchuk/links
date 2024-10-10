import { describe, test, expect, beforeAll } from 'bun:test'
import { testUser } from './test.fixture'
import { linkTest } from './test.seeds'
import { ServiceDatabase } from './service.database'


const NOT_EXISTING_USER = {
    user_id: 3141592653589793,
}


let database: ServiceDatabase


const user = {
    name: 'Youlia',
    telephone: '+380446544242',
    password: '1723105543867',
}


const tags = [
    {
        name: 'html',
        color: 'blue',
    },
    {
        name: 'css',
        color: 'red',
    },
    {
        name: 'javascript',
        color: 'yellow',
    },

]


beforeAll(() => {
    database = ServiceDatabase.instance
})


describe('Service Database', () => {
    test('should return user if telephone number exist', () => {
        expect(database.getUser(testUser.telephone)).toContainKeys(Object.keys(testUser))
    })


    test('should create user', () => {
        const createdUser = database.createUser(user)
        expect(createdUser?.name).toBeNull()
        expect(createdUser?.telephone).toBe(user.telephone)
        expect(createdUser?.password).toBe(user.password)
    })


    test('should delete user', () => {
        const user = {
            name: 'delete_user',
            telephone: '+380446541234',
            password: '172310554',
        }
        const createdUser = database.createUser(user)!
        const deletedUser = database.deleteUser(createdUser.user_id) as unknown as { lastInsertRowid: number }
        expect(createdUser.user_id).toEqual(deletedUser.lastInsertRowid)
    })


    test('should return user by password', () => {
        expect(database.getUserByPasswordHash(user.password)).toContainKeys(Object.keys(user))
    })


    test('shoul user exist', () => {
        expect(database.isUserExist(user.telephone)).toBeTrue()
    })


    test('shoul user not exist', () => {
        expect(database.isUserExist(user.telephone + 0)).toBeFalse()
    })


    test('should return link', () => {
        const link = database.getLink(linkTest.url)
        expect(link?.url).toBe(linkTest.url)
    })


    test('should return null as not existing link', () => {
        const link = database.getLink('it`s-not-a-link-that-exist')
        expect(link).toBeNull()
    })


    test('should return link with tag', () => {
        const linkId = 1
        const link = database.getLinkByIdWithTag(linkId)
        expect(link?.link_id).toBe(linkId)
    })


    test('should return null as not have link with tag', () => {
        const link = database.getLinkByIdWithTag(13)
        expect(link).toBeNull()
    })


    test('should return all links of user', () => {
        const links = database.getLinksUser(1)
        expect(links).toBeArray()
        expect(links.length).toBeGreaterThan(0)
    })


    test('should return empty array as user not have links', () => {
        const links = database.getLinksUser(NOT_EXISTING_USER.user_id)
        expect(links).toBeArray()
        expect(links).toBeEmpty()
    })


    test('should create link', () => {
        const createdLink = database.createLink(linkTest)
        expect(createdLink).toMatchObject(linkTest)
    })


    test('should delete link', () => {
        const createdLink = database.createLink(linkTest)!
        const isDeleted = database.deleteLink(createdLink.link_id)
        expect(isDeleted).toBeTrue()
    })


    test('should return true when link not exist on delete', () => {
        const isDeleted = database.deleteLink(NaN)
        expect(isDeleted).toBeTrue()
    })


    test('should return links of existing urls', () => {
        const links = database.getLinksByUrls([linkTest], 1)
        expect(links.length).toBeGreaterThan(0)
    })


    test('should return empty array as not have links with existing URLs for not existing user', () => {
        const links = database.getLinksByUrls([linkTest], NOT_EXISTING_USER.user_id)
        expect(links).toMatchObject([null])
    })


    test('should return empty array as not have links with not existing URLs', () => {
        const links = database.getLinksByUrls([{ url: 'localhost' }, { url: 'localhost:6969' }], 1)
        expect(links).toMatchObject([null, null])
    })


    test('should return empty array as not have links with not existing URLs for not existing user', () => {
        const links = database.getLinksByUrls([{ url: 'localhost' }, { url: 'localhost:6969' }], NOT_EXISTING_USER.user_id)
        expect(links).toMatchObject([null, null])
    })


    test('should return links by ids', () => {
        const links = database.getLinksById([{ link_id: 1 }])
        expect(links).toSatisfy((value) => value.every((link) => link?.link_id === 1))
    })


    test('should return array with null value as not have links by ids', () => {
        const links = database.getLinksById([{ link_id: NaN }])
        expect(links).toMatchObject([null])
    })


    test('should update link', () => {
        const createdLink = database.createLink({
            created_at: Date.now(),
            description: '',
            locale: '',
            site_name: '',
            tags: '1',
            title: '',
            url: 'https://en.wikipedia.org/wiki/URL',
            user_id: 1,
            image: 'https://www.w3schools.com/images/w3schools_logo_436_2.png',
        })!
        const linkToUpdate = { ...createdLink, title: 'URL - Wikipedia' }
        const updatedLink = database.updateLink(linkToUpdate)
        expect(updatedLink?.title).toBe(linkToUpdate.title)
    })


    test('should create tag', () => {
        const user = {
            name: 'create_tag',
            telephone: '+380446541235',
            password: '1723105545',
        }
        const tag = tags[0]
        const createdUser = database.createUser(user)!
        const createdTag = database.createTag(tag, createdUser.user_id)
        expect(createdTag).toContainAllKeys(['tag_id', 'user_id', 'name', 'color'])
        expect(createdTag?.user_id).toEqual(createdUser.user_id)
        expect(createdTag?.name).toEqual(tag.name)
        expect(createdTag?.color).toEqual(tag.color)
    })


    test('should return null as can`t create tag', () => {
        const createdTag = database.createTag(tags[0], NOT_EXISTING_USER.user_id)
        expect(createdTag).toBeNull()
    })


    test('should return tags', () => {
        const user = {
            name: 'get_user_tags',
            telephone: '+380446541236',
            password: '1723105546',
        }
        const createdUser = database.createUser(user)!
        database.createTag(tags[0], createdUser.user_id)
        database.createTag(tags[1], createdUser.user_id)
        database.createTag(tags[2], createdUser.user_id)
        const userTags = database.getTags(createdUser.user_id)
        expect(userTags).toBeArrayOfSize(tags.length)
        expect(userTags).toMatchObject(tags)
    })


    test('should return empty array as no tags', () => {
        const userTags = database.getTags(NOT_EXISTING_USER.user_id)
        expect(userTags).toBeArray()
        expect(userTags).toBeArrayOfSize(0)
    })


    test('should delete tag', () => {
        const user = {
            name: 'delete_tag',
            telephone: '+380446541237',
            password: '1723105547',
        }
        const tag = tags[0]
        const createdUser = database.createUser(user)!
        const createdTag = database.createTag(tag, createdUser.user_id)!
        const deletedTagId = database.deleteTag(createdTag.tag_id)
        expect(createdTag.tag_id).toBe(deletedTagId)
    })


    test('should update selected user field', () => {
        const user = {
            name: 'update_user_name',
            telephone: '+380446541238',
            password: '1723105548',
        }
        const newName = 'Root_user'
        const createdUser = database.createUser(user)!
        const updatedUser = database.updateUserColumn('name', newName, createdUser)
        expect(updatedUser?.name).toBe(newName)
    })


    test('should return links that contain search text on existing user', () => {
        const links = database.searchTextLinks('mozilla', 1)
        expect(links).toBeArray()
        expect(links.length).toBeGreaterThan(0)
    })


    test('should return empty array as not have links that contain search text on existing user', () => {
        const links = database.searchTextLinks('Ukrain', 1)
        expect(links).toBeArrayOfSize(0)
    })


    test('should return empty array as not have links that contain search text for not existing user', () => {
        const links = database.searchTextLinks('mozilla', NOT_EXISTING_USER.user_id)
        expect(links).toBeArrayOfSize(0)
    })


    test('should return empty array as not have links with contain search text for not existing user', () => {
        const links = database.searchTextLinks('Ukrain', NOT_EXISTING_USER.user_id)
        expect(links).toBeArrayOfSize(0)
    })
})
