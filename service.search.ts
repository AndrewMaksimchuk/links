import type { ServiceDatabase } from "./service.database"
import { Logger } from './service.logger';


export class ServiceSearch {
    private database: ServiceDatabase


    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceSearch', __filename)
        this.database = database
    }


    public search(text: string, userId: number) {
        Logger.log('Function: search', __filename)
        const searchUrls = this.database.searchTextLinks(text, userId)
        return this.database.getLinksById(searchUrls);
    }
}
