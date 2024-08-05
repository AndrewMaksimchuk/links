export class Logger {
    public static log(...messages: string[]) {
        console.log('%c [ LOG     ] ', 'background-color: white; color: black;', ...messages)
    }

    public static error(...messages: string[]) {
        console.error('%c [ ERROR   ] ', 'background-color: red; color: black;', ...messages)
    }

    public static warning(...messages: string[]) {
        console.warn('%c [ WARNING ] ', 'background-color: yellow; color: black;', ...messages)
    }
}
