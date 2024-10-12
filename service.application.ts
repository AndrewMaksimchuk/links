import { Logger } from "./service.logger"


export function applicationClose() {
    Logger.log('Function: applicationClose', __filename)
    process.exit(0)
}
