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
