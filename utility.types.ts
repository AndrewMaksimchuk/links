import type { Properties, PropertiesHyphen } from 'csstype'


declare module 'csstype' {
    interface Properties {
        [index: `--${string}`]: string
        "--pico-color"?: string
        "--pico-background-color"?: string
        "--pico-border-color"?: string
        "--pico-box-shadow"?: string
        "--pico-form-element-spacing-vertical"?: string
        "--pico-form-element-spacing-horizontal"?: string
    }
}


export interface Style extends Properties, PropertiesHyphen { }


export type JSONstring = string


export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
}


export type Stringify<T> = {
    [P in keyof T]: string
}


export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};


declare module 'bun' {
    interface Env {
        DATABASE: string
    }
}
