import { unlinkSync } from 'node:fs'

export function deleteDatabase() {
    unlinkSync(process.env.DATABASE)
}
