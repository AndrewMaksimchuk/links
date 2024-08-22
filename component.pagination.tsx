import type { FC } from 'hono/jsx'
import { Fragment, useContext } from "hono/jsx"
import { LinksContext } from './page.dashboard'
import { routes } from './service.router'


const styleButton = {
    "--pico-form-element-spacing-vertical": "0.125rem",
    "--pico-form-element-spacing-horizontal": "0.5rem",
}


const NumberButton: FC<{ value: number }> = (props) => {
    return (<button
        style={styleButton}
        name="page"
        value={props.value}
        hx-post={routes.paginationViewUpdate}
        hx-push-url={`/dashboard?page=${props.value}`}
        hx-target="main"
        hx-swap="innerHTML"
    >
        {props.value}
    </button>);
}


export const Pagination: FC<{ activePage: number }> = (props) => {
    const style = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: 'var(--pico-typography-spacing-vertical)',
    }

    const links = useContext(LinksContext)
    const linksLength = links.length
    const LINKSONPAGE = 30
    const numberPagesButtons = Math.ceil(linksLength / LINKSONPAGE)

    if (2 > numberPagesButtons) {
        return <Fragment />;
    }

    const pagesButtons = Array(numberPagesButtons).fill(0).map((_, index) => <NumberButton value={index + 1} />)
    const startView = props.activePage === 1 ? 0 : (props.activePage - 1) * LINKSONPAGE
    const endView = startView + LINKSONPAGE
    const paginationView = links.slice(startView, endView)
    LinksContext.values = [paginationView]

    return (
        <div id="paginationSectionButtons" style={style} hx-swap-oob="outerHTML">
            {pagesButtons}
        </div>
    );
}
