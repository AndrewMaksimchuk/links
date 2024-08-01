import ogs from 'open-graph-scraper'


export class ServiceOGP {
    static getMeta = async (url: string) => {
        const { error, result } = await ogs({ url })

        if (error) {
            return null;
        }
        return result;
    }
}
