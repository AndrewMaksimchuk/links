import type { FC } from 'hono/jsx'
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


const ButtonDelete: FC<{ link_id: number }> = (props) => {
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
            onclick="setTimeout(() => this.parentElement.parentElement.parentElement.remove(), 1000)"
        >
            Delete
        </button>
    );
}


const LinkItemStyleButtonGroup = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'right',
    gap: '1rem',
}


const LinkItem: FC<{ link: LinkItemProps }> = (props) => {
    return (
        <article>
            <header>{props.link.title}</header>
            <p>{props.link.url}</p>
            <footer>
                <p style='text-align: right;'>{(new Date(props.link.created_at || Date.now())).toDateString()}</p>
                {'string' === typeof props.link.tags ? <Tags names={props.link.tags}></Tags> : null}
                <p style={LinkItemStyleButtonGroup}>
                    <a href={props.link.url} target='_blank'>Open</a>
                    <ButtonEdit />
                    {null != props.link.link_id ? <ButtonDelete link_id={props.link.link_id} /> : null}
                </p>
            </footer>
        </article>
    );
}


export const Links: FC<{ links: LinkItemProps[] }> = (props) => {
    return (
        <Fragment>
            {props.links.map((linkData) => <LinkItem link={linkData}></LinkItem>)}
        </Fragment>
    );
}
