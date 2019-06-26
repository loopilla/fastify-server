import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { Db } from '../db';

declare module 'fastify' {
    export interface FastifyInstance<
        HttpServer = Server,
        HttpRequest = IncomingMessage,
        HttpResponse = ServerResponse
        > {
        // auth(): void;
        verifyJwt(
            request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>,
            response: fastify.FastifyReply<HttpResponse>
        ): fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;
        db: Db;
        getAccessTokenFromAuthorizationCodeFlow(
            request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>,
            callback: (error: Error, result: any) => void
        ): any;
        googleOAuth2(args: any): any;
    }
}
