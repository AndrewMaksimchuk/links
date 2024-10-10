import { describe, test, expect } from 'bun:test'
import { Logger } from './service.logger'


describe('Service Logger', () => {
    test.todo('should print message log with color white', () => {
        expect(Logger.log()).toBe()
    })

    test.todo('should print message error with color red', () => {
        expect(Logger.error()).toBe()
    })

    test.todo('should print message warning with color yellow', () => {
        expect(Logger.warning()).toBe()
    })
})
