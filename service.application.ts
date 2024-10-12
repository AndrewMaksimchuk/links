import { join } from "node:path"
import { mkdirSync, existsSync, writeFileSync } from "node:fs"

export const LOG_FILE = 'links.log'

export function getApplicationDirectory() {
    return join(process.env["HOME"], '.config', 'links')
}

export function applicationClose() {
    process.exit(0)
}

function createApplicationDirectory() {
    const appDir = getApplicationDirectory()
    if (existsSync(appDir)) return;
    mkdirSync(appDir)
    writeFileSync(join(appDir, LOG_FILE), '')
}

createApplicationDirectory()
