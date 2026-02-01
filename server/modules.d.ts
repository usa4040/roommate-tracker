// Type definitions for modules without @types packages

declare module 'bcrypt' {
    export function hash(data: string, saltOrRounds: number | string): Promise<string>;
    export function compare(data: string, encrypted: string): Promise<boolean>;
    export function genSalt(rounds?: number): Promise<string>;
}

declare module 'jsonwebtoken' {
    export interface JwtPayload {
        [key: string]: any;
    }
    export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: any): string;
    export function verify(token: string, secretOrPublicKey: string, options?: any): JwtPayload | string;
}

declare module 'pg' {
    export interface QueryResult<T = any> {
        rows: T[];
        rowCount: number;
    }
    export class Pool {
        constructor(config?: any);
        query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    }
}

declare module 'express' {
    import * as http from 'http';
    export interface Request extends http.IncomingMessage {
        body?: any;
        params?: any;
        query?: any;
        headers?: any;
        user?: any;
    }
    export interface Response {
        status(code: number): Response;
        json(data: any): Response;
        send(data: any): Response;
    }
    export interface NextFunction {
        (err?: any): void;
    }
    export function express(): any;
    export function Router(): any;
    export function json(): any;
    export function urlencoded(options?: any): any;
    export function static(root: string, options?: any): any;
    export function cors(options?: any): any;
    namespace express {
        export interface Request {}
        export interface Response {}
    }
}

declare module 'body-parser' {
    export function json(): any;
    export function urlencoded(options?: any): any;
}

declare module 'cookie-parser' {
    function cookieParser(secret?: string | string[], options?: any): any;
    export = cookieParser;
}
