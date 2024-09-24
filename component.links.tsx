import type { FC, PropsWithChildren } from 'hono/jsx'
import type { Link } from "./service.link"
import type { View } from './service.link-view'
import type { Style } from './utility.types'
import { Fragment, useContext } from "hono/jsx"
import { routes } from './service.router'
import { LinksContext, SelectTags } from './page.dashboard'

type LinkItemProps = Partial<Link>


const Tag: FC<{ name: string, color?: string }> = (props) => {
    const TagStyle: Style = {
        "--pico-color": "var(--pico-switch-color)",
        color: props.color ? props.color : 'initial',
        border: 'solid 1px ' + (props.color ? props.color : 'var(--pico-border-color)'),
        borderRadius: '1.25em',
        backgroundColor: props.color ? `${props.color}30` : 'var(--pico-background-color)',
        lineHeight: '1.25em',
        padding: "0.25rem 0.75rem",
    }
    return (
        <span style={TagStyle}>{props.name}</span>
    );
}


export const ButtonEdit: FC<{ linkId: number }> = (props) => {
    const query = `{"linkId": "${props.linkId}"}`
    return (
        <button
            type="button"
            style='margin: 0; padding: 0.125rem 0.25rem;'
            className='outline'
            hx-get={routes.linkEdit}
            hx-vals={query}
            hx-target={"#l" + props.linkId}
            hx-swap="outerHTML"
        >
            Edit
        </button>
    );
}

type stringifiedFunction = string
const ButtonDelete: FC<{ link_id: number, onclick: stringifiedFunction }> = (props) => {
    return (
        <button
            type="button"
            style='margin: 0; padding: 0.125rem 0.25rem;'
            className='outline'
            hx-delete={routes.linkDelete}
            hx-target="#notification"
            hx-swap="afterbegin"
            hx-on--after-request={props.onclick}
            hx-indicator="#indicator"
            hx-disabled-elt="this"
            name="link_id"
            value={props.link_id}
        >
            Delete
        </button>
    );
}


const LinkItemCard: FC<{ link: LinkItemProps }> = (props) => {
    const LinkItemStyleButtonGroup: Style = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'right',
        gap: '1rem',
    }

    const LinkUrlStyle: Style = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        // whiteSpace: 'nowrap',
    }

    const articleStyle: Style = {
        display: 'grid',
        gridTemplateRows: '115px 1fr auto',
    }

    const HeaderStyle: Style = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '3',
        '-webkit-box-orient': 'vertical',
    }

    const title = props.link.title ? props.link.title : '-'

    return (
        <article
            id={'l' + String(props.link.link_id)}
            style={articleStyle}
        >
            <header
                style={HeaderStyle}
                title={title}
            >
                {title}
            </header>
            <p style={LinkUrlStyle}>
                <a
                    href={props.link.url}
                    target='_blank'
                    title={props.link.url}
                >
                    {props.link.url}
                </a>
            </p>
            <footer>
                <p style='text-align: right;'>{(new Date(props.link.created_at ?? Date.now())).toDateString()}</p>
                <p style="text-align: right;">
                    {'string' === typeof props.link.name ? <Tag name={props.link.name} color={props.link.color}></Tag> : null}
                </p>
                <p style={LinkItemStyleButtonGroup}>
                    {props.link.link_id ? <ButtonEdit linkId={props.link.link_id} /> : null}
                    <ButtonDelete link_id={props.link.link_id || 0} onclick="this.parentElement.parentElement.parentElement.remove()" />
                </p>
            </footer>
        </article>
    );
}

const LinkItemCardContainer = (props: PropsWithChildren) => {
    const style: Style = { gridTemplateColumns: 'repeat(4, 1fr)' }
    return (
        <section class="grid" style={style}>
            {props.children}
        </section>
    );
}

const LinkItemTableItem: FC<{ link: LinkItemProps }> = (props) => {
    return (
        <tr id={'l' + String(props.link.link_id)}>
            <th scope="row" style="max-width: 30ch;">{props.link.title || "-"}</th>
            <td style="text-wrap: nowrap; max-width: 30ch; overflow: hidden; text-overflow: ellipsis;">
                <a href={props.link.url} target='_blank' title={props.link.url}>
                    {props.link.url}
                </a>
            </td>
            <td style="text-wrap: nowrap;">{(new Date(props.link.created_at ?? Date.now())).toDateString()}</td>
            <td>
                {'string' === typeof props.link.name ? <Tag name={props.link.name} color={props.link.color}></Tag> : null}
            </td>

            <td style="display: flex; gap: 1rem;">
                {props.link.link_id ? <ButtonEdit linkId={props.link.link_id} /> : null}
                <ButtonDelete link_id={props.link.link_id || 0} onclick="this.parentElement.parentElement.remove()" />
            </td>
        </tr>
    );
}

const LinkItemTable = (props: PropsWithChildren) => {
    return (
        <table class="striped">
            <thead>
                <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Url</th>
                    <th scope="col">Date</th>
                    <th scope="col">Tags</th>
                    <th scope="col">Control</th>
                </tr>
            </thead>
            <tbody>
                {props.children}
            </tbody>
        </table>
    );
}

export const Links: FC<{ view: View }> = (props) => {
    const links = useContext(LinksContext)
    const ViewOfLinkItem = props.view === 'table' ? LinkItemTableItem : LinkItemCard
    const RenderedLinkItem = links.map((linkData) => <ViewOfLinkItem link={linkData}></ViewOfLinkItem>)
    const View = props.view === "table" ? <LinkItemTable>{RenderedLinkItem}</LinkItemTable> : <LinkItemCardContainer>{RenderedLinkItem}</LinkItemCardContainer>
    return (
        <Fragment>
            {View}
        </Fragment>
    );
}


export const LinkOne: FC<{ link: Link, view: View }> = (props) => {
    const ViewOfLinkItem = props.view === 'table' ? LinkItemTableItem : LinkItemCard
    return <ViewOfLinkItem link={props.link} />;
}


const LinkFormEditButtonStyle: Style = {
    margin: '0',
    padding: '0.125rem 0.25rem',
}


const LinkFormEditButtonUpdate: FC<{ style?: Record<string, string> }> = (props) => {
    return (
        <button
            type="submit"
            className='outline'
            style={{ ...LinkFormEditButtonStyle, ...props.style }}
        >
            Update
        </button>
    );
}


const LinkFormEditButtonCancel: FC<{
    linkId?: number,
    htmlTarget: string,
    style?: Record<string, string>
}> = (props) => {
    return (
        <button
            type="button"
            className='outline'
            style={{ ...LinkFormEditButtonStyle, ...props.style }}
            name="linkId"
            value={props.linkId}
            hx-post={routes.linkGet}
            hx-swap="outerHTML"
            hx-target={"closest " + props.htmlTarget}
        >
            Cancel
        </button>
    );
}


const LinkFormEditCard: FC<{ link: LinkItemProps }> = (props) => {
    const LinkItemStyleButtonGroup: Style = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'right',
        gap: '1rem',
    }

    const LinkUrlStyle: Style = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }

    const include = JSON.stringify({ link_id: props.link.link_id })

    return (
        <article>
            <form
                hx-patch={routes.linkUpdate}
                hx-swap="outerHTML"
                hx-target="closest article"
                hx-vals={include}
            >
                <header>
                    <input required type="text" name="title" id="updateLinkTitle" value={props.link.title ?? ""} />
                </header>
                <p style={LinkUrlStyle}>
                    <input required type="text" name="url" id="updateLinkUrl" value={props.link.url} />
                </p>
                <footer>
                    <p style='text-align: right;'>{(new Date(props.link.created_at ?? Date.now())).toDateString()}</p>
                    <p style="text-align: right;">
                        <SelectTags styleLabel={{ display: 'none' }} styleSelect={{ margin: '0' }} selectedTag={props.link.tag_id} />
                    </p>
                    <p style={LinkItemStyleButtonGroup}>
                        <LinkFormEditButtonUpdate />
                        <LinkFormEditButtonCancel
                            linkId={props.link.link_id}
                            htmlTarget='article'
                            style={{ width: '100%' }}
                        />
                    </p>
                </footer>
            </form>
        </article>
    );
}


const LinkFormEditTable: FC<{ link: Link }> = (props) => {
    const styleInput: Style = {
        margin: '0',
    }

    const include = JSON.stringify({ link_id: props.link.link_id })

    return (
        <tr style="height: 100%;">
            <form
                hx-patch={routes.linkUpdate}
                hx-swap="outerHTML"
                hx-target="closest tr"
                hx-vals={include}
            >
                <th scope="row">
                    <input required style={styleInput} type="text" name="title" id="updateLinkTitle" value={props.link.title ?? ""} />
                </th>
                <td style="text-wrap: nowrap; max-width: 30ch; overflow: hidden; text-overflow: ellipsis;">
                    <input required style={styleInput} type="text" name="url" id="updateLinkUrl" value={props.link.url} />
                </td>
                <td style="text-wrap: nowrap;">
                    {(new Date(props.link.created_at)).toDateString()}
                </td>
                <td>
                    <SelectTags styleLabel={{ display: 'none' }} styleSelect={{ margin: '0' }} selectedTag={props.link.tag_id} />
                </td>
                <td style="display: flex; gap: 1rem; height: 100%;">
                    <LinkFormEditButtonUpdate />
                    <LinkFormEditButtonCancel
                        linkId={props.link.link_id}
                        htmlTarget='tr'
                    />
                </td>
            </form>
        </tr>
    );
}


export const LinkFormEdit: FC<{ view: View, link: Link }> = (props) => {
    const View = props.view === 'table' ? LinkFormEditTable : LinkFormEditCard
    return (
        <View link={props.link} />
    );
}