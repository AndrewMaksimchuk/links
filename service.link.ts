import type { LinkDatabase, ServiceDatabase, TagDatabase } from "./service.database"
import type { Prettify, Stringify } from "./utility.types"
import { Logger } from "./service.logger"


export type Link = Prettify<LinkDatabase & TagDatabase>


export class ServiceLink {
    private database: ServiceDatabase


    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceLink', __filename)
        this.database = database
    }


    public setNewLink(link: Prettify<Stringify<Pick<Link, "url" | "created_at"> & { tags: string }>>, userId: number) {
        Logger.log('Function: setNewLink', __filename)
        const tags = "NaN" === link.tags ? null : link.tags
        return this.database.createLink({ user_id: userId, url: link.url, created_at: Number(link.created_at) || 0, tags });
    }


    public getLinks(userId: number) {
        Logger.log('Function: getLinks', __filename)
        return this.database.getLinksUser(userId);
    }


    public deleteLink(linkId: number) {
        Logger.log('Function: deleteLink', __filename)
        return this.database.deleteLink(linkId);
    }
}
