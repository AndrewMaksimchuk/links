import type { FC } from "hono/jsx"
import type { Style } from "./utility.types"


type Status = "success" | "error" | "warn" | "info"


export interface NotificationProps { 
    status: Status
    body: string
    header?: string
    notificationid?: number
}


const NotificationStyle: Style = {
    padding: "var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal)",
}

const statusStyle: Record<Status, string> = {
    error: 'red',
    info: 'gray',
    success: 'green',
    warn: 'orange',
}

const setStatusStyle = (status: Status) => {
    return {
        borderBottom: "solid " + statusStyle[status],
    };
}

export const Notification: FC<NotificationProps> = (props) => {
    return (
        <div id="notification" hx-swap-oob="afterbegin" >
            <div style={NotificationStyle} data-notificationId={props.notificationid}>
                <h2 style={setStatusStyle(props.status)}>{props.header}</h2>
                <p>{props.body}</p>
                <button onclick="this.parentElement.remove()">Close</button>
            </div>
        </div>
    );
}
