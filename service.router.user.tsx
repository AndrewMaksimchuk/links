import type { FC } from 'hono/jsx'
import type { Context } from "hono"
import type { ServiceAuth } from "./service.auth"
import type { ServiceUser, User } from "./service.user"
import type { Stringify } from "./utility.types"
import type { UserDatabase } from "./service.database"
import { $ } from "bun"
import { Fragment } from "hono/jsx"
import { Logger } from "./service.logger"
import { Greeting, SettingsUser, UserContext } from './page.dashboard'
import { Notification, type NotificationProps } from "./component.notification"


const UserUpdateNameUI: FC<{ userNewName: string, notification: NotificationProps }> = (props) => {
    return <Fragment>
        <SettingsUser />
        <div id="userGreeting" hx-swap-oob="outerHTML">
            <Greeting name={props.userNewName} />
        </div>
        <Notification status={props.notification.status} body={props.notification.body}></Notification>
    </Fragment>;
}


export class RouterUser {
    private serviceAuth: ServiceAuth
    private serviceUser: ServiceUser
    routes: {
        main: string,
        dashboard: string
    }
    private getUser: (ctx: Context) => Promise<UserDatabase | null>
    private getUserId: (ctx: Context) => Promise<number | null>


    constructor(
        ServiceUser: ServiceUser,
        ServiceAuth: ServiceAuth,
        routes: {
            main: string,
            dashboard: string
        },
        getUser: (ctx: Context) => Promise<UserDatabase | null>,
        getUserId: (ctx: Context) => Promise<number | null>,

    ) {
        this.serviceUser = ServiceUser
        this.serviceAuth = ServiceAuth
        this.routes = routes
        this.getUser = getUser
        this.getUserId = getUserId
    }


    public login = async (ctx: Context) => {
        Logger.log('Function: login', __filename)
        let user: User | null
        const formBody = await ctx.req.parseBody<Stringify<Omit<User, "user_id">>>()

        if (this.serviceUser.isNewUser(formBody.telephone)) {
            user = await this.serviceUser.setNewUser(formBody)
        } else {
            user = await this.serviceUser.verifyUser(formBody)
        }

        if (null === user) {
            Logger.error('Function: login', __filename, 'user is null')
            return ctx.redirect(this.routes.main);
        }

        await this.serviceAuth.login(ctx, user.password)
        return ctx.redirect(this.routes.dashboard);
    }


    public logout = (ctx: Context) => {
        Logger.log('Function: logout', __filename)
        this.serviceAuth.logout(ctx)
        return ctx.redirect(this.routes.main);
    }


    public userUpdateName = async (ctx: Context) => {
        Logger.log('Function: userUpdateName', __filename)
        const notification: NotificationProps = {
            status: "warn",
            body: "Can`t update your name!",
        }

        const body = await ctx.req.parseBody<{ userName: string }>()

        if (0 === body.userName.length) {
            return ctx.html(<Notification status={notification.status} body={notification.body}></Notification>);
        }

        const currentUser = await this.getUser(ctx)

        if (null === currentUser) {
            notification.status = "error"
            notification.body = "You bad!"
            return ctx.html(<Notification status={notification.status} body={notification.body}></Notification>);
        }

        const updatedCurrentUser = this.serviceUser.updateName(body.userName, currentUser)

        if (null === updatedCurrentUser) {
            notification.status = "warn"
            notification.body = "Can`t update your name!"
            return ctx.html(<Notification status={notification.status} body={notification.body}></Notification>);
        }

        if (currentUser.name === updatedCurrentUser.name) {
            notification.status = "info"
            notification.body = "Your name the same, nothing to change"
            return ctx.html(<Notification status={notification.status} body={notification.body}></Notification>);
        }

        UserContext.values = [updatedCurrentUser]
        notification.status = "success"
        notification.body = "Name is updated"
        return ctx.html(<UserUpdateNameUI userNewName={updatedCurrentUser.name} notification={notification} />);
    }


    public userDataDownload = async (ctx: Context) => {
        const userId = await this.getUserId(ctx)

        if (null === userId) {
            return ctx.html(<Notification status="error" body="Can`t get you!" />);
        }

        const tables = ['users', 'tags', 'links', 'vlinks']
        const processingCsv = tables.map((table) => $`sqlite3 -csv -header ./database.sqlite "select * from ${table}  where user_id = ${userId};" > /tmp/${table}.csv`)
        const execResult = await Promise.all(processingCsv)
        const isExportFail = execResult.filter((shellOutput) => 0 !== shellOutput.exitCode).length

        if (isExportFail) {
            return ctx.html(<Notification status="error" body="Can`t get your data!" />);
        }

        $.cwd("/tmp")
        const processingArchive = await $`tar -czf user-data.tar.gz users.csv tags.csv links.csv vlinks.csv`

        if (0 !== processingArchive.exitCode) {
            return ctx.html(<Notification status="error" body="Can`t create archive!" />);
        }

        const archive = Bun.file('/tmp/user-data.tar.gz')

        if (! await archive.exists()) {
            return ctx.html(<Notification status="error" body="Can`t get archive!" />);
        }

        const response = new Response(archive)
        response.headers.set('Content-Disposition', 'attachment; filename="user-data.tar.gz"')
        return response;
    }
}