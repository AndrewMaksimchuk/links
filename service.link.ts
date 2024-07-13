import type { LinkDatabase, ServiceDatabase } from "./service.database"
import type { Prettify, Stringify } from "./utility.types"
import { Logger } from "./service.logger"


export interface Link extends Prettify<Omit<LinkDatabase, "user_id" | "tags">> {
    tags: string[] | null
}


export class ServiceLink {
    private database: ServiceDatabase


    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceLink', __filename)
        this.database = database
    }


    private convertionLinkDatabaseToLink(link: LinkDatabase): Link {
        const tags = 'string' === typeof link.tags ? JSON.parse(link.tags) as string[] : null
        return { ...link, tags };
    }


    public setNewLink(link: Prettify<Stringify<Pick<Link, "url" | "created_at">>>, userId: number) {
        Logger.log('Function: setNewLink', __filename)
        return this.database.createLink({ user_id: userId, url: link.url, created_at: Number(link.created_at) || 0 });
    }


    public getLinks(userId: number) {
        Logger.log('Function: getLinks', __filename)
        return this.database.getLinksUser(userId).map(this.convertionLinkDatabaseToLink);
    }


    public deleteLink(linkId: number) {
        Logger.log('Function: deleteLink', __filename)
        return this.database.deleteLink(linkId);
    }
}
