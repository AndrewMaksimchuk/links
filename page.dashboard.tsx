import type { User } from "./service.user"
import type { Link } from "./service.link"
import { Fragment, type FC } from 'hono/jsx'
import { routes } from "./service.router"


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

const Nav = () => {
    return (
        <nav style="display: grid; grid-template-columns: 1fr;">
            <Add></Add>
            <Search></Search>
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

const Link: FC<{ link: Partial<Link> }> = (props) => {
    return (
        <article>
            <header>{props.link.title}</header>
            <p></p>
            Body
            <footer>
                <p style='text-align: right;'>{(new Date(props.link.created_at || Date.now())).toDateString()}</p>
                <p>/* list of tags here*/</p>
                <p style='display: flex; align-items: center; justify-content: right; gap: 1rem;'>
                    <a href={props.link.url} target='_blank'>Open</a>
                    <button type="button" style='margin: 0;' className='outline'>Edit</button>
                    <button type="button" style='margin: 0;' className='outline'>Delete</button>
                </p>
            </footer>
        </article>
    );
}

export const Dashboard: FC<{ user?: Pick<User, 'name'> }> = (props) => {
    return (
        <Fragment>
            <Header name={props.user?.name}></Header>
            <main>
                <section class="grid" style="grid-template-columns: repeat(4, 1fr);">
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                    <Link link={{ title: 'Header', created_at: 1, url: 'http://localhost:6969' }} />
                </section>
            </main>
        </Fragment>
    )
}
