import type { ServiceDatabase } from "./service.database"
import { Logger } from './service.logger';


export class ServiceSearch {
    private database: ServiceDatabase


    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceSearch', __filename)
        this.database = database
    }


    public search(text: string) {
        Logger.log('Function: search', __filename)
        const searchUrls = this.database.searchTextLinks(text)
        return this.database.getLinksByUrls(searchUrls);
    }
}