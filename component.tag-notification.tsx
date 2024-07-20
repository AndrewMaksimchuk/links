import type { FC } from "hono/jsx";
import { routes } from "./service.router"


const setStyleButtonDelete = (colorValue?: string) => {
    const color = colorValue ? colorValue : "initial"
    return {
        color,
        borderColor: color,
        padding: "0;",
        borderRadius: "100%;",
        width: "3ch;",
        aspectRatio: "1;",
        fontSize: "0.75rem;",
        margin: "0;",
        marginLeft: "0.5rem;",
    };
}


const ButtonDelete: FC<{ id: number, color?: string }> = (props) => {
    return (
        <button 
            type="button" 
            class="outline" 
            style={setStyleButtonDelete(props.color)} 
            name="tagId"
            value={props.id}
            hx-post={routes.tagDelete} 
            hx-swap="delete" 
            hx-target="closest span">
                X
        </button>
    );
}


const setStyle = (colorProperty?: string) => {
    const color = colorProperty ? colorProperty : "initial"
    const backgroundColor = color ? `${color}30;` : "initial"
    return {
        color,
        backgroundColor,
        border: `solid 1px ${color};`,
        borderRadius: '1rem;',
        padding: '0.125rem 0.5rem 0.25rem;',
        display: "flex;",
        alignItems: "center;",
    };
}


export const TagNotification: FC<{ tagId?: number, name?: string, color?: string, text?: string }> = (props) => {
    return (
        <span style={setStyle(props.color)}>
            {props.name} {props.text}
            { props.text ? null : <ButtonDelete color={props.color} id={props.tagId ?? NaN}/> }
        </span>
    );
}
