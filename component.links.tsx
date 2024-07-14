import type { FC, PropsWithChildren } from 'hono/jsx'
import type { Link } from "./service.link"
import { Fragment } from "hono/jsx"
import { routes } from './service.router'


type LinkItemProps = Partial<Link>


const TagStyle = {
    "--pico-color": "var(--pico-switch-color)",
    border: 'var(--pico-border-width) solid var(--pico-border-color)',
    borderRadius: '1.25em',
    backgroundColor: 'var(--pico-background-color)',
    lineHeight: '1.25em',
    padding: "0.125rem 0.5rem",
}


const Tag: FC<{ name: string }> = (props) => {
    return (
        <span style={TagStyle}>{props.name}</span>
    );
}


const TagsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.125rem',
}


const Tags: FC<{ names: string[] }> = (props) => {
    return (
        <p style={TagsStyle}>
            {props.names.map((name) => <Tag name={name}></Tag>)}
        </p>
    );
}


const ButtonEdit = () => {
    return (
        <button type="button" style='margin: 0; padding: 0.125rem 0.25rem;' className='outline'>Edit</button>
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
            name="link_id"
            value={props.link_id}
            onclick={props.onclick}
        >
            Delete
        </button>
    );
}


const LinkItemCard: FC<{ link: LinkItemProps }> = (props) => {
    const LinkItemStyleButtonGroup = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'right',
        gap: '1rem',
    }

    const LinkUrlStyle = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }

    return (
        <article>
            {props.link.title ? <header>{props.link.title}</header> : null}
            <p style={LinkUrlStyle}>
                <a href={props.link.url} target='_blank' title={props.link.url}>
                    {props.link.url}
                </a>
            </p>
            <footer>
                <p style='text-align: right;'>{(new Date(props.link.created_at || Date.now())).toDateString()}</p>
                {'string' === typeof props.link.tags ? <Tags names={props.link.tags}></Tags> : null}
                <p style={LinkItemStyleButtonGroup}>
                    <ButtonEdit />
                    <ButtonDelete link_id={props.link.link_id || 0} onclick="setTimeout(() => this.parentElement.parentElement.parentElement.remove(), 1000)"/>
                </p>
            </footer>
        </article>
    );
}

const LinkItemCardContainer = (props: PropsWithChildren) => {
    const style = { gridTemplateColumns: 'repeat(4, 1fr)' }
    return (
        <section class="grid" style={style}>
            {props.children}
        </section>
    );
}

const LinkItemTableItem: FC<{ link: LinkItemProps }> = (props) => {
    return (
        <tr>
            <th scope="row">{props.link.title || "-"}</th>
            <td style="text-wrap: nowrap; max-width: 30ch; overflow: hidden; text-overflow: ellipsis;">
                <a href={props.link.url} target='_blank' title={props.link.url}>
                    {props.link.url}
                </a>
            </td>
            <td style="text-wrap: nowrap;">{(new Date(props.link.created_at || Date.now())).toDateString()}</td>
            <td>
                {'string' === typeof props.link.tags ? <Tags names={props.link.tags}></Tags> : null}
            </td>

            <td style="display: flex; gap: 1rem;">
                <ButtonEdit />
                <ButtonDelete link_id={props.link.link_id || 0} onclick="setTimeout(() => this.parentElement.parentElement.remove(), 1000)"/>
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
                    {/* <th scope="col"></th> */}
                    <th scope="col">Control</th>
                </tr>
            </thead>
            <tbody>
                {props.children}
            </tbody>
        </table>
    );
}

export const Links: FC<{ links: LinkItemProps[], view?: "table" }> = (props) => {
    const ViewOfLinkItem = props.view ? LinkItemTableItem : LinkItemCard
    const RenderedLinkItem = props.links.map((linkData) => <ViewOfLinkItem link={linkData}></ViewOfLinkItem>)
    const View = props.view ? <LinkItemTable>{RenderedLinkItem}</LinkItemTable> : <LinkItemCardContainer>{RenderedLinkItem}</LinkItemCardContainer>
    return (
        <Fragment>
            {View}
        </Fragment>
    );
}
