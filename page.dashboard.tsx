import type { FC, PropsWithChildren } from 'hono/jsx'
import type { User } from "./service.user"
import type { Tag } from './service.tag'
import type { Link } from "./service.link"
import { Fragment, createContext, useContext } from 'hono/jsx'
import { routes } from "./service.router"
import { TagNotification } from './component.tag-notification'
import { Pagination } from './component.pagination'


const ViewContext = createContext('')
export const TagsContext = createContext<Tag[]>([])
export const UserContext = createContext<User | null>(null)
export const LinksContext = createContext<Link[] | null>(null)


export const SelectTags: FC<{
        styleLabel?: Record<string, string>, 
        styleSelect?: Record<string, string>, 
        selectedTag?: number 
    }> = (props) => {
    const tags = useContext(TagsContext)
    const View = tags.length ? (
        <Fragment>
            <label for="tags" style={props.styleLabel}>Select tags</label>
            <select id="tags" name="tags" required aria-label="Select" style={props.styleSelect}>
                {undefined === props.selectedTag ? <option disabled selected value={NaN}>Select one:</option> : null}
                {tags.map((tag) => <option value={tag.tag_id} selected={tag.tag_id === props.selectedTag}>{tag.name}</option>)}
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
            hx-on--after-request="this.reset()"
            hx-indicator="#indicator"
            hx-disabled-elt="#linkAddSubmitButton"
            hx-vals="js:{created_at: Date.now()}"
        >
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
            <button
                id="linkAddSubmitButton"
                type="submit"
            >
                Add new link
            </button>
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
                hx-indicator="#indicator"
                hx-disabled-elt="#searchFormSubmitButton"
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
                <button
                    id="searchFormSubmitButton"
                    type="submit"
                >
                    Search
                </button>
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


export const LinksCounter = () => {
    const links = useContext(LinksContext)
    return (
        <span id="linksCounter" hx-swap-oob="outerHTML" style="width: 10ch; text-align: right;">
            {links?.length ?? 0} pcs
        </span>
    );
}


const Nav = () => {
    return (
        <nav style="display: grid; grid-template-columns: 1fr;">
            <Add></Add>
            <Search></Search>
            <div style="display: flex; align-items: center;">
                <Views></Views>
                <LinksCounter />
            </div>
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


const onClickToggleSettingsView = "settingsView.toggleAttribute('open'); document.body.classList.toggle('modal-is-open');"
const historyGoToSettings = "history.pushState({}, '', '/settings');"
const historyBackFromSettings = "history.back();"


const Settings = () => {
    return (
        <button 
            class="outline secondary" 
            onclick={onClickToggleSettingsView + historyGoToSettings} 
        >
            Settings
        </button>
    );
}


export const SettingsUser = () => {
    const user = useContext(UserContext)
    return (
        <div>
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
            <a 
                href={routes.userDataDownload}
            >
                Download your data
            </a>
        </div>
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
                <header style="display: flex; align-items: center;">
                    <h2>Settings</h2>
                    <button
                        class="outline"
                        style="margin-left: auto;"
                        onclick={onClickToggleSettingsView + historyBackFromSettings}
                        hx-post={routes.linkAddFormUpdate}
                        hx-target="#linkAddForm"
                        hx-swap="outerHTML"
                        >
                        Close
                    </button>
                </header>
                <SettingsUser />
                <SettingsTags />
                    <footer>
                </footer>
            </article>
        </dialog>
    );
}


export const Greeting: FC<{ name: string | undefined }> = (props) => {
    const name = props.name ?? "my friend"
    return <h1 id="userGreeting" style="margin: 0;">
        <a href={routes.dashboard}>Hello, {name}!</a>
    </h1>;
}


const Theme = () => {
    const data = `{
        dataTheme: undefined, 
        dataThemeValues: ['dark', 'light'],
        get dataThemeInputValue() {
            return 'dark' === this.dataTheme ? false : true; 
        },
        setThemeCookie() {
            document.cookie = 'theme=' + this.dataTheme + ';SameSite=Strict;';
        },
        getThemeCookie() {
            const theme = document.cookie?.includes('theme') ? document.cookie.split('=').at(1) : undefined;
            return this.dataThemeValues.includes(theme) ? theme : undefined;
        },
        setTheme() {
            this.setThemeCookie();
            document.documentElement.setAttribute('data-theme', this.dataTheme);
        },
        toggleTheme() {
            this.dataTheme = 'dark' === this.dataTheme ? 'light' : 'dark';
            this.setTheme();
        },
            init() {
                const cookieTheme = this.getThemeCookie();
                if(cookieTheme) {
                    this.dataTheme = cookieTheme;
                    this.setTheme();
                    return;
                }
                this.dataTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            },
    }`

    return (
        <label>
            <span>Dark</span>
            <input
                type="checkbox"
                role="switch"
                style="margin-inline: .5em;"
                x-data={data}
                x-on:click="toggleTheme"
                x-model="dataThemeInputValue"
                />
            <span>Light</span>
        </label>
    );
}


const Header = () => {
    const style = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--pico-typography-spacing-vertical)',
    }
    const user = useContext(UserContext)
    return (
        <header>
            <div style={style}>
                <Greeting name={user?.name} />
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <Theme />
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
            <Pagination activePage={1} />
            <main>
                {props.children}
            </main>
        </Fragment>
    )
}
