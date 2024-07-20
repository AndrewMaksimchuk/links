import type { ServiceDatabase, TagDatabase } from "./service.database"
import { Logger } from "./service.logger"


export type Tag = Omit<TagDatabase, "user_id">


export class ServiceTag {
    private database: ServiceDatabase


    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceLink', __filename)
        this.database = database
    }


    public createTag(tag: Omit<TagDatabase, "tag_id" | "user_id">, userId: number) {
        Logger.log('Function: createTag', __filename)
        return this.database.createTag(tag, userId);
    }

    
    public getTags(userId: number) {
        return this.database.getTags(userId).map<Tag>(({ color, name, tag_id }) => {
            return { color, name, tag_id };
        });
    }


    public deleteTag(id: number) {
        return this.database.deleteTag(id);
    }
}
