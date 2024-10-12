const APP_LINK = "http://localhost:6969"

export function browserRun() {
    const process = Bun.spawnSync({
        cmd: ["xdg-open", APP_LINK],
    })

    if (0 != process.exitCode) {
        Bun.spawnSync({
            cmd: ["notify-send", "-i face-sad", "WARN", `I can't open the browser! Please open page manual on ${APP_LINK}`]
        })
    }
}
