type Status = "LOG" | "ERROR" | "WARNING"

export class Logger {
    private static setDateTime() {
        const length = 23
        const moment = new Date(Date.now())
        return `[ ${moment.toLocaleString().padEnd(length)} ]`;
    }

    private static setStatus(status: Status) {
        const length = 8
        return `[ ${status}` + ' '.repeat(length - status.length) + ']';
    }

    private static metadata(status: Status) {
        return `${this.setStatus(status)} ${this.setDateTime()}`;
    }

    private static setMessage(status: Status, messages: string[]) {
        return `${this.metadata(status)} ` + messages.join('; ');
    }

    public static log(...messages: string[]) {
        if ('test' === process.env.NODE_ENV) return;
        const log = this.setMessage("LOG", messages)
        console.log(log)
        return log;
    }

    public static error(...messages: string[]) {
        if ('test' === process.env.NODE_ENV) return;
        const log = this.setMessage("ERROR", messages)
        console.log(log)
        return log;
    }

    public static warning(...messages: string[]) {
        if ('test' === process.env.NODE_ENV) return;
        const log = this.setMessage("WARNING", messages)
        console.log(log)
        return log;
    }
}
