import type { LinkDatabase, TagDatabase } from "./service.database"


export const testUser = {
    telephone: "0996543318",
    password: "PL2jit>i*yGz'QP",
    name: "Admin",
}


export const testUserLinks: (LinkDatabase & TagDatabase)[] = [
    {
        link_id: 1,
        user_id: 1,
        url: 'web.dev',
        created_at: 0,
        tags: null,
        title: null,
        image: null,
        audio: null,
        description: null,
        locale: null,
        site_name: null,
        video: null,
        tag_id: 1,
        name: 'web',
        color: 'blue',
    },
    {
        link_id: 3,
        user_id: 1,
        url: 'html.dev',
        created_at: 0,
        tags: null,
        title: null,
        image: null,
        audio: null,
        description: null,
        locale: null,
        site_name: null,
        video: null,
        tag_id: 2,
        name: 'html',
        color: 'blue',
    },
    {
        link_id: 3,
        user_id: 1,
        url: 'css.dev',
        created_at: 0,
        tags: null,
        title: null,
        image: null,
        audio: null,
        description: null,
        locale: null,
        site_name: null,
        video: null,
        tag_id: 3,
        name: 'css',
        color: 'red',
    }
]


export const testTags = [
    {
        tag_id: 1,
        name: 'html',
        color: 'blue',
    },
    {
        tag_id: 2,
        name: 'css',
        color: 'red',
    },
    {
        tag_id: 3,
        name: 'javascript',
        color: 'yellow',
    },
]
