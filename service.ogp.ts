import ogs from 'open-graph-scraper'
import { Logger } from './service.logger'


export class ServiceOGP {
    static getMeta = async (url: string) => {
        try {
            Logger.log('Function: getMeta', '[ START ]', __filename)
            const { error, result } = await ogs({ url })

            if (error) {
                Logger.error('Function: getMeta', '[ ERROR ]', __filename)
                return null;
            }

            return result;
        } catch {
            Logger.error('Function: getMeta', '[ ERROR ]', __filename)
            return null;
        } finally {
            Logger.log('Function: getMeta', '[ END ]', __filename)
        }
    }
}
