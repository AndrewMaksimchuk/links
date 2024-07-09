import type { FC } from 'hono/jsx'

const notificationStyle = {
    "--pico-background-color": "var(--pico-form-element-background-color)",
    "--pico-border-color": "var(--pico-form-element-border-color)",
    "--pico-color": "var(--pico-form-element-color)",
    "--pico-box-shadow": "none",
    position: "absolute",
    maxWidth: "300px",
    outline: "0",
    top: "var(--pico-form-element-spacing-vertical)",
    right: "var(--pico-form-element-spacing-horizontal)",
    border: "var(--pico-border-width) solid var(--pico-border-color)",
    borderRadius: "var(--pico-border-radius)",
    backgroundColor: "var(--pico-background-color)",
    boxShadow: "var(--pico-box-shadow)",
    color: "var(--pico-color)",
    fontWeight: "var(--pico-font-weight)",
    transition: "background-color var(--pico-transition), border-color var(--pico-transition), color var(--pico-transition), box-shadow var(--pico-transition)",
}

export const Layout: FC = ({children}) => {
    return (
        <html lang="en">

            <head>
                <meta charset="UTF-8"></meta>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
                <link rel="icon" type="image/svg" href="favicon.svg"></link>
                <link rel="stylesheet" href="pico.yellow.min.css"></link>
                <script src="htmx.min.js" defer></script>
                <title>Links</title>
            </head>

            <body class="container">
                { children }
                <footer></footer>
            </body>
            <section id='notification' style={notificationStyle}></section>
        </html>
    );
}
