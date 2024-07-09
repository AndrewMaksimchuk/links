import { describe, expect, it } from 'bun:test'
import app from './server.index'

describe('My first test', () => {
  it('Should return 200 Response', async () => {
    const req = new Request('http://localhost:6969/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})