import { Database } from "bun:sqlite"


export const tables = {
    users: 'users',
    links: 'links',
    vlinks: 'vlinks',
    tags: 'tags',
}


export function createTables() {
    const database = new Database(process.env.DATABASE)


    // users
    const usersSqlQuery = `
            CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            telephone TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL UNIQUE,
            name TEXT
        );`
    database.query(usersSqlQuery).run()


    // links
    const linksSqlQuery = `
            CREATE TABLE IF NOT EXISTS links (
            link_id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            url TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            title TEXT,
            image TEXT,
            audio TEXT,
            description TEXT,
            locale TEXT,
            site_name TEXT,
            video TEXT,
            tags TEXT,
            FOREIGN KEY (user_id)
                REFERENCES users (user_id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
        );`
    database.query(linksSqlQuery).run()


    // vlinks
    const vlinksSqlQuery = `CREATE VIRTUAL TABLE IF NOT EXISTS ${tables.vlinks} USING fts5(link_id, user_id, url, title, description, site_name, tags);`
    database.query(vlinksSqlQuery).run()


    // tags
    const tagsSqlQuery = `
            CREATE TABLE IF NOT EXISTS ${tables.tags} (
            tag_id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            FOREIGN KEY (user_id)
                REFERENCES users (user_id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
        );`
    database.query(tagsSqlQuery).run()


    database.close()
}