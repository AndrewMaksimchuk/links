import { Fragment, createContext, useContext, type FC, type PropsWithChildren } from 'hono/jsx'
import type { User } from "./service.user"
import type { Tag } from './service.tag'
import { routes } from "./service.router"
import { TagNotification } from './component.tag-notification'


const ViewContext = createContext('')
export const TagsContext = createContext<Tag[]>([])


const SelectTags = () => {
    const tags = useContext(TagsContext)
    const View = tags.length ? (
        <Fragment>
            <label for="tags">Select tags</label>
            <select id="tags" name="tags" required aria-label="Select">
                <option disabled selected value={NaN}>Select one from list:</option>
                {tags.map((tag) => <option value={tag.tag_id}>{tag.name}</option>)}
            </select>
        </Fragment>
    ) : <Fragment></Fragment>
    return View;
}


export const Add = () => {
    return (
        <form
            id="linkAddForm"
            hx-post={routes.linkAdd}
            hx-target="#notification"
            hx-swap="afterbegin"
            hx-on--after-request="this.reset()">
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
            <SelectTags></SelectTags>
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
        <form action={routes.logout} method="post" style="margin: 0;">
            <button type="submit" className="outline" style="margin: 0;">Logout</button>
        </form>
    );
}


const onClickToggleSettingsView = "settingsView.toggleAttribute('open'); document.body.classList.toggle('modal-is-open')"


const Settings = () => {
    return (<button class="outline secondary" onclick={onClickToggleSettingsView}>Settings</button>);
}


const SettingsTags = () => {
    const tags = useContext(TagsContext)

    return (
        <div>
            <form hx-post={routes.tagCreate} hx-target="#createTagResponse" hx-swap="afterbegin" hx-on--after-request="this.reset()">
                <fieldset>
                    <legend style="text-align: center; width: 100%; font-weight: bold;">Create new tag</legend>
                    <label for="inputTagName">Write tag name</label>
                    <input type="text" name="name" id="inputTagName" placeholder="web" inputmode="text" minlength={3} required autofocus />
                    <label for="inputTagColor">Choose a color</label>
                    <input type="color" name="color" id="inputTagColor" required />
                    <input type="submit" value="Create" />
                </fieldset>
            </form>
            <p id="createTagResponse" style="display: flex; flex-wrap: wrap; gap: 1rem; min-height: 2rem;">
                {tags.map((tag) => <TagNotification name={tag.name} color={tag.color} tagId={tag.tag_id} />)}
            </p>
        </div>
    );
}


export const SettingsModal = () => {
    return (
        <dialog id="settingsView">
            <article>
                <header>
                    <h2>Settings</h2>
                </header>
                <SettingsTags />
                <footer>
                    <button
                        class="outline"
                        onclick={onClickToggleSettingsView}
                        hx-post={routes.linkAddFormUpdate}
                        hx-target="#linkAddForm"
                        hx-swap="outerHTML"
                    >
                        Close
                    </button>
                </footer>
            </article>
        </dialog>
    );
}


const Header: FC<{ name: string | undefined }> = (props) => {
    return (
        <header>
            <div style="display: flex; justify-content: space-between;">
                {props.name ? <h1>Hello, {props.name}!</h1> : <h1>Hello, my friend!</h1>}
                <div style="display: flex; gap: 1rem;">
                    <Settings></Settings>
                    <Logout></Logout>
                </div>
            </div>
            <Nav></Nav>
        </header>
    );
}

export const Dashboard = (props: PropsWithChildren<{ user?: Pick<User, 'name'>, linkViewState: string, tags: Tag[] }>) => {
    return (
        <Fragment>
            <ViewContext.Provider value={props.linkViewState}>
                <TagsContext.Provider value={props.tags}>
                    <Header name={props.user?.name}></Header>
                    <SettingsModal />
                </TagsContext.Provider>
            </ViewContext.Provider>
            <main>
                {props.children}
            </main>
        </Fragment>
    )
}
