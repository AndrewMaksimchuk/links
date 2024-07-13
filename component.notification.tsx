import type { FC } from "hono/jsx"

type Status = "success" | "error" | "warn" | "info"

const NotificationStyle = {
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

export const Notification: FC<{ status: Status, body: string, header?: string, notificationid?: number }> = (props) => {
    return (
        <div style={NotificationStyle} data-notificationId={props.notificationid}>
            <h2 style={setStatusStyle(props.status)}>{ props.header }</h2>
            <p>{ props.body }</p>
            <button onclick="this.parentElement.remove()">Close</button>
        </div>
    );
}
