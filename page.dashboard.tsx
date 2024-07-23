import { Fragment, createContext, useContext, type FC, type PropsWithChildren } from 'hono/jsx'
import type { User } from "./service.user"
import type { Tag } from './service.tag'
import { routes } from "./service.router"
import { TagNotification } from './component.tag-notification'


const ViewContext = createContext('')
export const TagsContext = createContext<Tag[]>([])
export const UserContext = createContext<User | null>(null)


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
            hx-target="main"
            hx-swap="innerHTML"
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
            <form
                hx-post={routes.search}
                hx-target="#searchResult"
                hx-swap="innerHTML"
                hx-on--before-request="searchClearButton?.remove()"
                hx-on--after-request="this.reset()"
                role="search"
            >
                <input
                    type="search"
                    name="search"
                    id="search"
                    placeholder='picocss'
                    minlength={2}
                    required
                    autofocus />
                <button type="submit">Search</button>
            </form>
            <section id="searchResult"></section>
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


export const SettingsUser = () => {
    const user = useContext(UserContext)
    return (
        <Fragment>
            <form
                hx-post={routes.userUpdateName}
                hx-target="this"
                hx-swap="outerHTML"
                hx-on--after-request="this.reset()"
            >
                <label htmlFor="userName">Write your name</label>
                <input
                    type="text"
                    id="userName"
                    name="userName"
                    inputmode="text"
                    minlength={1}
                    required
                    value={user?.name ?? ""}
                    placeholder={user?.name ?? "Taras"} />
                <input type="submit" value="Update name" />
            </form>
        </Fragment>
    );
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
                    <input type="submit" value="Create tag" />
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
                <SettingsUser />
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


export const Greeting: FC<{ name: string | undefined }> = (props) => {
    const name = props.name ?? "my friend"
    return <h1 id="userGreeting">Hello, {name}!</h1>;
}


const Header = () => {
    const user = useContext(UserContext)
    return (
        <header>
            <div style="display: flex; justify-content: space-between;">
                <Greeting name={user?.name} />
                {/* {user?.name ? <h1>Hello, {user.name}!</h1> : <h1>Hello, my friend!</h1>} */}
                <div style="display: flex; gap: 1rem;">
                    <Settings></Settings>
                    <Logout></Logout>
                </div>
            </div>
            <Nav></Nav>
        </header>
    );
}

export const Dashboard = (props: PropsWithChildren<{ user: User, linkViewState: string, tags: Tag[] }>) => {
    return (
        <Fragment>
            <UserContext.Provider value={props.user}>
                <ViewContext.Provider value={props.linkViewState}>
                    <TagsContext.Provider value={props.tags}>
                        <Header />
                        <SettingsModal />
                    </TagsContext.Provider>
                </ViewContext.Provider>
            </UserContext.Provider>
            <main>
                {props.children}
            </main>
        </Fragment>
    )
}
