export class Logger {
    public static log(...messages: string[]) {
        if ('test' === process.env.NODE_ENV) return;
        console.log('%c [ LOG     ] ', 'background-color: white; color: black;', ...messages)
    }

    public static error(...messages: string[]) {
        if ('test' === process.env.NODE_ENV) return;
        console.error('%c [ ERROR   ] ', 'background-color: red; color: black;', ...messages)
    }

    public static warning(...messages: string[]) {
        if ('test' === process.env.NODE_ENV) return;
        console.warn('%c [ WARNING ] ', 'background-color: yellow; color: black;', ...messages)
    }
}
