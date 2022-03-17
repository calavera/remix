export type Json = <Data>(data: Data, init?: number | ResponseInit) => Response
export type Redirect = (url: string, init?: number | ResponseInit) => Response