import * as fp from 'fastify-plugin';
import * as fastify from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

export default fp(async (server, opts, next) => {
    server.route({
        url: '/users',
        logLevel: 'warn',
        method: ['GET', 'HEAD'],
        handler: async (request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, reply: any) => {
            return reply.send({ url: '/users', date: new Date(), works: true });
        }
    });

    // Need auth
    server.route({
        url: '/user',
        logLevel: 'warn',
        method: ['POST'],
        handler: async (request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, reply: any) => {
            const user = await server.db.models.user.create(request.body);
            return reply.send({ user: user });
        }
    });

    server.route({
        url: '/users/me',
        logLevel: 'warn',
        method: ['GET', 'HEAD'],
        handler: async (request, reply) => {
            return reply.send({ url: '/users/me', date: new Date(), works: true });
        }
    });
    next();
});