import { describe, test, beforeAll, expect } from 'bun:test'
import { ServiceDatabase } from './service.database'
import { ServiceUser } from './service.user'
import { testUser } from './test.fixture'


const USER_PASS_HASH = '$argon2id$v=19$m=65536,t=2,p=1$k6ZN7foOSTU8x5clwJTo92+rZF2k0YHSBO7+b63dOuw$ixP+D7Et9YerORczXHofVOvx6TxltDHAQ/WrG87/XB8'
let service: ServiceUser


beforeAll(() => {
    service = new ServiceUser(ServiceDatabase.instance)
})


describe('Service User', () => {
    test('should be not new user', () => {
        const isNewUser = service.isNewUser(testUser.telephone)
        expect(isNewUser).toBeFalse()
    })


    test('should be as new user', () => {
        const isNewUser = service.isNewUser(testUser.telephone + 0)
        expect(isNewUser).toBeTrue()
    })


    test('should create a new user', async () => {
        const user = {
            name: 'Bun',
            password: 'runtime',
            telephone: '+38044453213333',
        }
        const newUser = await service.setNewUser(user)
        expect(newUser).not.toBeNull()
    })


    test('should can`t create user with empty password', async () => {
        const user = {
            name: 'Bun',
            password: '',
            telephone: '+38044453213333',
        }
        const newUser = await service.setNewUser(user)
        expect(newUser).toBeNull()
    })


    test('should get user by phone number', () => {
        const user = service.getUser(testUser.telephone)
        expect(user).not.toBeNull()
    })


    test('should return null as user not exist', () => {
        const user = service.getUser(testUser.telephone + 0)
        expect(user).toBeNull()
    })


    test('should verify user success', async () => {
        const user = await service.verifyUser(testUser)
        expect(user).not.toBeNull()
    })


    test('should verify user, bad password', async () => {
        const user = await service.verifyUser({ ...testUser, password: 'abra-cadabra' })
        expect(user).toBeNull()
    })


    test('should verify user, bad telephone', async () => {
        const user = await service.verifyUser({ ...testUser, telephone: '+38044456767' })
        expect(user).toBeNull()
    })


    test('should get user use password hash', () => {
        const user = service.findByPasswordHash(USER_PASS_HASH)
        expect(user).not.toBeNull()
    })


    test('should not get user as use bad password hash', () => {
        const user = service.findByPasswordHash('asjbdfki$asnfio32h_o487y218o34')
        expect(user).toBeNull()
    })


    test('should one field of user data', () => {
        const field = service.getUserData(USER_PASS_HASH, 'telephone')
        expect(field).toBe(testUser.telephone)
    })


    test('should change name', () => {
        const newName = 'Andrew'
        const userUpdated = service.updateName(newName, { ...testUser, user_id: 1 })
        expect(userUpdated?.name).toBe(newName)
    })


    test('should not change name', () => {
        const userUpdated = service.updateName('', { ...testUser, user_id: 1 })
        expect(userUpdated).toBeNull()
    })
})
