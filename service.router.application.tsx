import type { Context } from "hono"
import { Logger } from "./service.logger"
import { applicationClose } from "./service.application"
import { Notification } from "./component.notification"


export class RouterApplication {
    public static close(ctx: Context) {
        Logger.log('Function: close', __filename)
        const notificationid = Date.now()
        ctx.header('HX-Trigger', JSON.stringify({ notifyClose: { notificationid } }))
        setTimeout(applicationClose, 1000)
        return ctx.html(<Notification status="warn" body="You close the application!" notificationid={notificationid}></Notification>);
    }
}
