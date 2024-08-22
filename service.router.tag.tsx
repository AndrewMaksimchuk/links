import type { Context } from "hono"
import type { ServiceTag, Tag } from "./service.tag"
import { Logger } from "./service.logger"
import { TagNotification } from "./component.tag-notification"


export class RouterTag {
    private serviceTag: ServiceTag
    private getUserId: (ctx: Context) => Promise<number | null>


    constructor(service: ServiceTag, getUserId: (ctx: Context) => Promise<number | null>) {
        this.serviceTag = service
        this.getUserId = getUserId
    }


    public tagCreate = async (ctx: Context) => {
        Logger.log('Function: tagCreate', __filename)
        const body = await ctx.req.parseBody<Omit<Tag, "tag_id">>()
        const userId = await this.getUserId(ctx)

        if (null == userId) {
            return ctx.html(<TagNotification text="Can`t create tag!" />);
        }

        this.serviceTag.createTag(body, userId)
        const tag = this.serviceTag.getTags(userId).at(-1)
        return tag ? ctx.html(<TagNotification tagId={tag.tag_id} name={tag?.name} color={tag?.color} />) : ctx.html(<TagNotification text="Can`t create tag!" />);
    }


    public tagDelete = async (ctx: Context) => {
        Logger.log('Function: tagDelete', __filename)
        const body = await ctx.req.parseBody<{ tagId: string }>()
        this.serviceTag.deleteTag(Number(body.tagId))
        return ctx.html(<TagNotification text="Tag deleted!" />);
    }
}
