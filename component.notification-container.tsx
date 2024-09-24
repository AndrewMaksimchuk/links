import type { Style } from "./utility.types";

const notificationStyle: Style = {
    "--pico-background-color": "var(--pico-form-element-background-color)",
    "--pico-border-color": "var(--pico-form-element-border-color)",
    "--pico-color": "var(--pico-form-element-color)",
    "--pico-box-shadow": "none",
    position: "fixed",
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

export const NotificationContainer = () => {
    const script = {
        __html:
            `<script>
                const onNotify = new CustomEvent('notifyClose', { bubbles: true })
                document.body.addEventListener("notifyClose", function(event){
                    const selector = '[data-notificationid="' + event.detail.notificationid + '"]'
                    setTimeout(() => document.querySelectorAll(selector)[0]?.remove(), 3000)
                })
            </script>`
    }
    return (
        <section
            id='notification'
            style={notificationStyle}
            dangerouslySetInnerHTML={script}
        >
        </section>
    );
}
