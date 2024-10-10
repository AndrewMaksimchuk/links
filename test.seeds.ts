import { Database } from "bun:sqlite"
import { tables } from "./test.migrations"
import { testUser } from "./test.fixture"


const user = {
    telephone: testUser.telephone,
    password: "$argon2id$v=19$m=65536,t=2,p=1$k6ZN7foOSTU8x5clwJTo92+rZF2k0YHSBO7+b63dOuw$ixP+D7Et9YerORczXHofVOvx6TxltDHAQ/WrG87/XB8",
    name: testUser.name,
}


const tag = {
    name: 'css',
    color: 'red',
}


export const linkTest = {
    created_at: Date.now(),
    description: '',
    locale: '',
    site_name: '',
    tags: '1',
    title: '',
    url: 'https://developer.mozilla.org',
    user_id: 1,
    image: 'https://www.w3schools.com/images/w3schools_logo_436_2.png',
}


export function putSeeds() {
    const database = new Database(process.env.DATABASE)


    // create user
    const userQuery = `INSERT INTO ${tables.users} (telephone, password, name) VALUES (?, ?, ?);`
    const userData = [user.telephone, user.password, user.name]
    database.run(userQuery, userData)


    // create tag
    const tagQuery = `INSERT INTO ${tables.tags} (user_id, name, color) VALUES (?, ?, ?);`
    const tagData = [1, tag.name, tag.color]
    database.run(tagQuery, tagData)


    // create link
    const linkQuery = `INSERT INTO ${tables.links} (user_id, url, created_at, tags, title, description, locale, site_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
    const linkData = [linkTest.user_id, linkTest.url, linkTest.created_at, linkTest.tags, linkTest.title, linkTest.description, linkTest.locale, linkTest.site_name]
    database.run(linkQuery, linkData)


    // create vlink
    const vlinkQuery = `INSERT INTO ${tables.vlinks} VALUES (?, ?, ?, ?, ?, ?, ?);`
    const vlinkData = [1, linkTest.user_id, linkTest.url, linkTest.title, linkTest.description, linkTest.site_name, linkTest.tags]
    database.run(vlinkQuery, vlinkData)


    database.close()
}
