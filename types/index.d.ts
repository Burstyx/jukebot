export type WSMessage = ErrorWSMessage | InitWSMessage

export interface ErrorWSMessage extends BaseWSMessage {
    type: "error",
    payload: {
        message: string
    }
}

export interface InitWSMessage extends BaseWSMessage {
    type: "init"
    payload: {

    }
}

export interface BaseWSMessage {
    type: string,
    payload?: any
}