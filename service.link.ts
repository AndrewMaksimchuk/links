import type { OgObject } from "open-graph-scraper/types/lib/types"
import type { LinkDatabase, ServiceDatabase, TagDatabase, VLinkDatabase, } from "./service.database"
import type { Prettify, Stringify } from "./utility.types"
import { Logger } from "./service.logger"


export type OGPGetMeta = (url: string) => Promise<OgObject | null>
export type Link = Prettify<LinkDatabase & TagDatabase>


export class ServiceLink {
    private database: ServiceDatabase
    private openGraphProtocolGetMeta: OGPGetMeta


    constructor(database: ServiceDatabase, openGraphProtocolGetMeta: OGPGetMeta) {
        Logger.log('Function: constructor, class ServiceLink', __filename)
        this.database = database
        this.openGraphProtocolGetMeta = openGraphProtocolGetMeta
    }


    public setNewLink = async (link: Prettify<Stringify<Pick<Link, "url" | "created_at"> & { tags: string }>>, userId: number) => {
        Logger.log('Function: setNewLink', __filename)
        const tagValue = parseInt(link.tags, 10)
        const isTagNotValid = Number.isNaN(tagValue) || tagValue < 1
        const tags = isTagNotValid ? null : link.tags
        const metaData = await this.openGraphProtocolGetMeta(link.url)
        const newLink = {
            user_id: userId,
            url: link.url,
            created_at: Number(link.created_at) || 0,
            tags,
            title: metaData?.ogTitle ?? '',
            description: metaData?.ogDescription ?? '',
            locale: metaData?.ogLocale ?? '',
            site_name: metaData?.ogSiteName ?? '',
        }
        return this.database.createLink(newLink);
    }


    public getLinks(userId: number) {
        Logger.log('Function: getLinks', __filename)
        return this.database.getLinksUser(userId).reverse();
    }


    public getLink(linkId: number) {
        Logger.log('Function: getLink', __filename)
        return this.database.getLinkByIdWithTag(linkId);
    }


    public deleteLink(linkId: number) {
        Logger.log('Function: deleteLink', __filename)
        return this.database.deleteLink(linkId);
    }


    public updateLink(link: Stringify<VLinkDatabase>) {
        Logger.log('Function: updateLink', __filename)
        return this.database.updateLink({ ...link, link_id: Number(link.link_id), user_id: Number(link.user_id) });
    }
}
