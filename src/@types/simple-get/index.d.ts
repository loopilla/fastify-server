/// <reference types="node" />
/// <reference types="fastify" />
import { IncomingMessage, Server, ServerResponse } from 'http';
// declare type Iopts = {
//     name: string;
//     scope: string[];
//     credentials: object;
//     callbackUri: string;
//     generateStateFunction?: any;
//     checkStateFunction?: any;
//     startRedirectPath?: string;
// };
declare module 'simple-get' {
    export function simpleGet(opts: any, cb: any): any;
    export function concat(opts: any, cb: any): any;
}
