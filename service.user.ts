import type { ServiceDatabase, UserDatabase } from "./service.database"
import { Logger } from "./service.logger"


export interface User extends UserDatabase { }


export class ServiceUser {
    private database: ServiceDatabase


    constructor(database: ServiceDatabase) {
        Logger.log('Function: constructor, class ServiceUser', __filename)
        this.database = database
    }


    private createPasswordHash(password: string) {
        Logger.log('Function: createPasswordHash', __filename)
        return Bun.password.hash(password);
    }


    private verifyPassword(password: string, hash: string) {
        Logger.log('Function: verifyPassword', __filename)
        return Bun.password.verify(password, hash);
    }


    public isNewUser(telephone: string) {
        Logger.log('Function: isNewUser', __filename)
        return false === this.database.isUserExist(telephone);
    }


    public async setNewUser(data: Omit<User, "user_id">) {
        try {
            Logger.log('Function: setNewUser', __filename)

            if (0 === data.password.length) {
                return null;
            }

            const password = await this.createPasswordHash(data.password)
            return await this.database.createUser({ ...data, password });
        } catch (error) {
            console.log('ERROR')
            if (error instanceof Error) {
                Logger.error('Function: setNewUser', __filename, error.message)
            }
            return null;
        }
    }


    public getUser(telephone: string) {
        Logger.log('Function: getUser', __filename)
        return this.database.getUser(telephone);
    }


    public async verifyUser(data: Omit<User, "user_id">) {
        Logger.log('Function: verifyUser', __filename)
        const userDatabase = this.getUser(data.telephone)

        if (null === userDatabase) {
            return null;
        }

        const correctPassword = await this.verifyPassword(data.password, userDatabase.password)
        return correctPassword ? userDatabase : null;
    }


    public findByPasswordHash(passwordHash: string) {
        Logger.log('Function: findByPasswordHash', __filename)
        return this.database.getUserByPasswordHash(passwordHash);
    }


    public getUserData<T extends keyof UserDatabase>(token: string, field: T): UserDatabase[T] | null {
        Logger.log('Function: getUserData', __filename)
        const user = this.database.getUserByPasswordHash(token)
        return null === user ? user : user[field];
    }


    public updateName(newName: string, user: User) {
        Logger.log('Function: updateName', __filename)

        if (0 === newName.length) {
            return null;
        }

        return this.database.updateUserColumn("name", newName, user);
    }
}
