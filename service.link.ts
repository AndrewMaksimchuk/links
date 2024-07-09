import type { LinkDatabase, ServiceDatabase } from "./service.database"
import type { Prettify, Stringify } from "./utility.types"
import { Logger } from "./service.logger"

export type Link = Prettify<Omit<LinkDatabase, "user_id">>

export class ServiceLink {
    private database: ServiceDatabase

    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceLink', __filename)
        this.database = database
    }

    public setNewLink(link: Prettify<Stringify<Pick<Link, "url" | "created_at">>>, userId: number) {
        Logger.log('Function: setNewLink', __filename)
        return this.database.createLink({user_id: userId, url: link.url, created_at: Number(link.created_at) || 0});
    }
}
