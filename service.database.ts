import type { Nullable, JSONstring, Prettify } from "./utility.types"
import { Database } from "bun:sqlite"
import { Logger } from "./service.logger"
import type { Link } from "./service.link"


type LinkOGP = Nullable<{ // Open graph protocol
    title: string
    image: string
    audio: string
    description: string
    locale: string
    site_name: string
    video: string
}>


export type LinkDatabase = {
    link_id: number
    user_id: number
    url: string
    created_at: number
    tags: JSONstring | null
} & LinkOGP


export type UserDatabase = {
    user_id: number
    telephone: string
    password: string
    name: string
}


export interface TagDatabase {
    tag_id: number
    user_id: number
    name: string
    color: string
}


export class ServiceDatabase {
    static #instance: ServiceDatabase
    private database: Database

    private tables = {
        users: 'users',
        links: 'links',
        vlinks: 'vlinks',
        tags: 'tags',
    }

    private constructor() {
        Logger.log('Function: constructor, class ServiceDatabase', __filename)
        this.database = new Database("database.sqlite")
        this.createTableUsers()
        this.createTableLinks()
        this.createTableLinksVirtual()
        this.createTableTag()
    }

    private createTableUsers() {
        Logger.log('Function: createTableUsers', __filename)
        const sqlQuery = `
            CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            telephone TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL UNIQUE,
            name TEXT
        );`
        this.database.query(sqlQuery).run()
    }

    private createTableLinks() {
        Logger.log('Function: createTableLinks', __filename)
        const sqlQuery = `
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
        this.database.query(sqlQuery).run()
    }


    private createTableLinksVirtual() {
        Logger.log('Function: createTableLinksVirtual', __filename)
        const sqlQuery = `CREATE VIRTUAL TABLE IF NOT EXISTS ${this.tables.vlinks} USING fts5(user_id, url, title, description, site_name, tags);`
        this.database.query(sqlQuery).run()
    }


    private insertIntoLinksVirtual({ user_id, url, title, description, site_name, tags }: LinkDatabase) {
        Logger.log('Function: insertIntoLinksVirtual', __filename)
        const sqlQuery = `INSERT INTO ${this.tables.vlinks} VALUES (?, ?, ?, ?, ?, ?);`
        this.database.query(sqlQuery).run(user_id, url, title, description, site_name, tags)
    }


    private createTableTag() {
        Logger.log('Function: createTableTag', __filename)
        const sqlQuery = `
            CREATE TABLE IF NOT EXISTS ${this.tables.tags} (
            tag_id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            FOREIGN KEY (user_id)
                REFERENCES users (user_id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
        );`
        this.database.query(sqlQuery).run()
    }


    public static get instance(): ServiceDatabase {
        Logger.log('Function: instance', __filename)
        if (false === Boolean(ServiceDatabase.#instance)) {
            ServiceDatabase.#instance = new ServiceDatabase()
        }
        return ServiceDatabase.#instance;
    }


    public getUser(telephone: string) {
        Logger.log('Function: getUser', __filename)
        const sqlQuery = `SELECT * FROM users WHERE telephone = $telephone;`
        const query = this.database.query<UserDatabase, { $telephone: string }>(sqlQuery)
        return query.get({
            $telephone: telephone,
        });
    }


    public createUser(data: Omit<UserDatabase, "user_id">) {
        Logger.log('Function: createUser', __filename)
        const sqlQuery = `INSERT INTO users (telephone, password) VALUES (?, ?);`
        this.database.run<string[]>(sqlQuery, [data.telephone, data.password])
        return this.getUser(data.telephone);
    }


    public getUserByPasswordHash(passwordHash: string) {
        Logger.log('Function: getUserByPasswordHash', __filename)
        const sqlQuery = "SELECT * FROM users WHERE password = ?"
        const query = this.database.query<UserDatabase, string>(sqlQuery)
        return query.get(passwordHash);
    }


    public isUserExist(telephone: string) {
        Logger.log('Function: isUserExist', __filename)
        return null !== this.getUser(telephone);
    }


    public getLink(url: string) {
        Logger.log('Function: getLink', __filename)
        const sqlQuery = `SELECT * FROM ${this.tables.links} WHERE url = $url;`
        const query = this.database.query<LinkDatabase, { $url: string }>(sqlQuery)
        return query.get({
            $url: url,
        });
    }


    private getLinkById(link_id: number) {
        Logger.log('Function: getLinkById', __filename)
        const sqlQuery = `SELECT * FROM ${this.tables.links} WHERE link_id = ?;`
        const query = this.database.query<LinkDatabase, number>(sqlQuery)
        return query.get(link_id);
    }


    public getLinksUser(userId: number) {
        Logger.log('Function: getLinksUser', __filename)
        const sqlQuery = `SELECT * FROM ${this.tables.links} INNER JOIN ${this.tables.tags} ON ${this.tables.tags}.tag_id = ${this.tables.links}.tags WHERE ${this.tables.links}.user_id = $userId;`
        const query = this.database.query<Prettify<LinkDatabase & TagDatabase>, { $userId: number }>(sqlQuery)
        return query.all({ $userId: userId });
    }


    public createLink(link: LinkDatabase) {
        Logger.log('Function: createLink', __filename)
        const sqlQuery = `INSERT INTO ${this.tables.links} (user_id, url, created_at, tags) 
                          VALUES (?, ?, ?, ?);`
        this.database.run(sqlQuery, [link.user_id, link.url, link.created_at, link.tags])
        this.insertIntoLinksVirtual(link)
        return this.getLink(link.url);
    }


    private deleteVLink(url: string, userId: number) {
        Logger.log('Function: deleteVLink', __filename)
        const sqlQuery = `DELETE FROM ${this.tables.vlinks} WHERE url = ? AND user_id = ?;`
        this.database.run(sqlQuery, [url, userId])
    }

    public deleteLink(linkId: number) {
        Logger.log('Function: deleteLink', __filename)
        const linkToDelete = this.getLinkById(linkId)

        if(null === linkToDelete) {
            return true;
        }

        const sqlQuery = `DELETE FROM ${this.tables.links} WHERE link_id = ?;`
        this.database.run(sqlQuery, [linkId])
        this.deleteVLink(linkToDelete.url, linkToDelete.user_id)
        return !Boolean(this.getLinkById(linkId));
    }


    public getLinksByUrls(urls: { url: string }[], userId: number) {
        Logger.log('Function: getLinksByUrls', __filename)
        const sqlQuery = `SELECT * FROM ${this.tables.links} 
            INNER JOIN ${this.tables.tags} 
            ON ${this.tables.tags}.tag_id = ${this.tables.links}.tags 
            WHERE ${this.tables.links}.url = ? 
            AND ${this.tables.links}.user_id = ?;`
        return urls.map((item) => this.database.prepare<LinkDatabase & TagDatabase, [string, number]>(sqlQuery).get(item.url, userId));
    }


    public createTag(tag: Omit<TagDatabase, "tag_id" | "user_id">, userId: number) {
        Logger.log('Function: createTag', __filename)
        const sqlQuery = `INSERT INTO ${this.tables.tags} (user_id, name, color) VALUES (?, ?, ?);`
        this.database.run(sqlQuery, [userId, tag.name, tag.color])
    }


    public getTags(userId: number) {
        Logger.log('Function: getTags', __filename)
        const sqlQuery = `SELECT * FROM ${this.tables.tags} WHERE user_id = ?;`
        return this.database.query<TagDatabase, number>(sqlQuery).all(userId);
    }


    public deleteTag(tag_id: number) {
        Logger.log('Function: deleteTag', __filename)
        const sqlQuery = `DELETE FROM ${this.tables.tags} WHERE tag_id = ?;`
        this.database.run(sqlQuery, [tag_id])
        return tag_id;
    }


    public updateUserColumn<T extends keyof Omit<UserDatabase, "user_id">>(column: T, data: UserDatabase[T], user: UserDatabase) {
        Logger.log('Function: updateUserColumn', __filename)
        const sqlQuery = `UPDATE ${this.tables.users} SET ${column} = ? WHERE user_id = ?;`
        this.database.run(sqlQuery, [data, user.user_id])
        return this.getUser(user.telephone)
    }


    public searchTextLinks(text: string, userId: number) {
        Logger.log('Function: searchTextLinks', __filename)
        const sqlQuery = `SELECT url FROM ${this.tables.vlinks} WHERE ${this.tables.vlinks} = ? AND user_id = ?;`
        return this.database.query<{ url: string }, [string, number]>(sqlQuery).all(text + "*", userId);
    }
}
