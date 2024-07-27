import type { FC } from 'hono/jsx'
import { NotificationContainer } from './component.notification-container';
import { Indicator } from './component.indicator';


export const Layout: FC = ({ children }) => {
    return (
        <html lang="en">

            <head>
                <meta charset="UTF-8"></meta>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
                <link rel="icon" type="image/svg" href="favicon.svg"></link>
                <link rel="stylesheet" href="pico.yellow.min.css"></link>
                <script src="htmx.min.js" defer></script>
                <script src="alpine.min.js" defer></script>
                <title>Links</title>
            </head>

            <body class="container">
                <Indicator />
                {children}
                <footer></footer>
                <NotificationContainer />
            </body>
        </html>
    );
}
