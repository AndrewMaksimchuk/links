import { Fragment, createContext, useContext, type FC, type PropsWithChildren } from 'hono/jsx'
import type { User } from "./service.user"
import { routes } from "./service.router"

const ViewContext = createContext('')

const Add = () => {
    return (
        <form hx-post={routes.linkAdd} hx-target="#notification" hx-swap="afterbegin">
            <label for='link-add'>New link</label>
            <input
                type="text"
                name="url"
                id="link-add"
                placeholder='https://picocss.com/docs/forms'
                aria-describedby='link-add-aria-description'
                required
                minlength={12}
            />
            <small
                id='link-add-aria-description'>
                Write ot paste link with https protocol
            </small>
            <input
                type="number"
                name="created_at"
                id="linkAddCreatedAt"
                value="0"
                hidden
            />
            <button type="submit" onmouseenter="linkAddCreatedAt.value = Date.now()">Add new link</button>
        </form>
    );
}

const Search = () => {
    return (
        <Fragment>
            <form action={routes.search} method="get" role="search">
                <input
                    type="search"
                    name="search"
                    id="search"
                    placeholder='picocss'
                    autofocus />
                <button type="submit">Search</button>
            </form>
            <section id="search-result"></section>
        </Fragment>
    );
}

const Views = () => {
    const isChecked = Boolean(useContext(ViewContext))
    return (
        <fieldset>
            <legend>Select view</legend>
            <label>
                <span>Card </span>
                <input
                    name="viewState"
                    type="checkbox"
                    role="switch"
                    style="margin-inline: .5em;"
                    checked={isChecked}
                    hx-post={routes.linkChangeView} hx-target="main" hx-swap="innerHTML"
                />
                <span>Table</span>
            </label>
        </fieldset>
    );
}

const Nav = () => {
    return (
        <nav style="display: grid; grid-template-columns: 1fr;">
            <Add></Add>
            <Search></Search>
            <Views></Views>
        </nav>
    );
}

const Logout = () => {
    return (
        <form action={routes.logout} method="post">
            <button type="submit" className="outline">Logout</button>
        </form>
    );
}

const Header: FC<{ name: string | undefined }> = (props) => {
    return (
        <header>
            <div style="display: flex; justify-content: space-between;">
                {props.name ? <h1>Hello, {props.name}!</h1> : <h1>Hello, my friend!</h1>}
                <Logout></Logout>
            </div>
            <Nav></Nav>
        </header>
    );
}

export const Dashboard = (props: PropsWithChildren<{ user?: Pick<User, 'name'>, linkViewState: string }>) => {
    return (
        <Fragment>
            <ViewContext.Provider value={props.linkViewState}>
                <Header name={props.user?.name}></Header>
            </ViewContext.Provider>
            <main>
                {props.children}
            </main>
        </Fragment>
    )
}
