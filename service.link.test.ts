import type { OGPGetMeta } from './service.link'
import type { ServiceDatabase, VLinkDatabase } from './service.database'
import type { Stringify } from './utility.types'
import { describe, test, expect } from 'bun:test'
import { ServiceLink } from './service.link'
import { testUserLinks } from './test.fixture'


const USER_ID = 1


type ServiceDatabaseTest = Partial<Pick<ServiceDatabase, "createLink" | "getLinksUser" | "getLinkByIdWithTag" | "deleteLink" | "updateLink">>
type ServiceOptions = Partial<{ database: ServiceDatabaseTest, ogpGetMeta: OGPGetMeta }>
const setService = (serviceOptions: ServiceOptions = {}) => {
    const ogpGetMeta = () => Promise.resolve(null)
    const database = {
        createLink: (link: string) => link,
        getLinksUser: () => [],
        getLinkByIdWithTag: () => null,
        deleteLink: () => false,
        updateLink: () => null,
        ...serviceOptions.database,
    } as ServiceDatabase
    return new ServiceLink(database, serviceOptions.ogpGetMeta ?? ogpGetMeta);
}


type LinkFields = Partial<{
    url: string;
    created_at: string;
    tags: string;
}>
const setLinkDefault = (linkFields?: LinkFields) => ({
    url: 'https://en.wikipedia.org/wiki/Binary-to-text_encoding',
    created_at: Date.now().toString(),
    tags: '1',
    ...linkFields,
})


describe('Service ServiceLink', () => {
    test('should create link with not valid tags value', async () => {
        const service = setService()
        const link = setLinkDefault({ tags: '0' })
        const createdLink = await service.setNewLink(link, USER_ID)
        expect(createdLink?.tags).toBeNull()
    })


    test('should create link with corect tags value', async () => {
        const service = setService()
        const link = setLinkDefault()
        const createdLink = await service.setNewLink(link, USER_ID)
        expect(createdLink?.tags).toBe(link.tags)
    })


    test('should create link without ogp data', async () => {
        const service = setService()
        const link = setLinkDefault()
        const createdLink = await service.setNewLink(link, USER_ID)
        expect(createdLink?.title).toBeEmpty()
        expect(createdLink?.description).toBeEmpty()
        expect(createdLink?.locale).toBeEmpty()
        expect(createdLink?.site_name).toBeEmpty()
    })


    test('should create link with ogp data', async () => {
        const ogpMetaData = {
            ogTitle: 'WIKI',
            ogDescription: 'World library',
            ogLocale: 'en',
            ogSiteName: 'wikipedia.org',
        }
        const service = setService({ ogpGetMeta: () => Promise.resolve(ogpMetaData) })
        const link = setLinkDefault()
        const createdLink = await service.setNewLink(link, USER_ID)
        expect(createdLink).toContainAnyValues(Object.values(ogpMetaData))
    })


    test('should return all user links, reverse order', () => {
        const service = setService({
            database: {
                getLinksUser: () => testUserLinks,
            }
        })
        const links = service.getLinks(USER_ID)
        expect(links).toEqual(testUserLinks.reverse())
    })


    test('should return empty array as user not have links', () => {
        const service = setService()
        const links = service.getLinks(USER_ID)
        expect(links).toBeEmpty()
    })


    test('should return link', () => {
        const userLink = testUserLinks[0]
        const service = setService({
            database: {
                getLinkByIdWithTag: () => userLink,
            }
        })
        const link = service.getLink(userLink.link_id)
        expect(link).toEqual(userLink)
    })


    test('should return null as link not exist', () => {
        const service = setService()
        const link = service.getLink(1)
        expect(link).toBeNull()
    })


    test('should delete link', () => {
        const userLink = testUserLinks[0]
        const service = setService({
            database: {
                deleteLink: () => true,
            }
        })
        const isDelete = service.deleteLink(userLink.link_id)
        expect(isDelete).toBeTrue()
    })


    test('should not delete link', () => {
        const userLink = testUserLinks[0]
        const service = setService()
        const isDelete = service.deleteLink(userLink.link_id)
        expect(isDelete).toBeFalse()
    })


    test('should return updated link', () => {
        const userLink = testUserLinks[0]
        const userLinkToUpdate: Stringify<VLinkDatabase> = {
            link_id: userLink.link_id.toString(),
            user_id: userLink.user_id.toString(),
            url: userLink.url,
            description: '',
            site_name: '',
            tags: '',
            title: 'WIKI',
        }

        const service = setService({
            database: {
                updateLink: () => userLinkToUpdate
            },
        })
        const updatedLink = service.updateLink(userLinkToUpdate)
        expect(updatedLink).toEqual(userLinkToUpdate)
    })


    test('should return null as not updated link, link not exist', () => {
        const userLink = testUserLinks[0]
        const userLinkToUpdate: Stringify<VLinkDatabase> = {
            link_id: userLink.link_id.toString(),
            user_id: userLink.user_id.toString(),
            url: userLink.url,
            description: '',
            site_name: '',
            tags: '',
            title: '',
        }
        const service = setService()
        const updatedLink = service.updateLink(userLinkToUpdate)
        expect(updatedLink).toBeNull()
    })
})
