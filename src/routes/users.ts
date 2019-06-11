import * as fastify from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';

module.exports = (instance: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>, opts: fastify.ServerOptions, next: any) => {
    instance.get('/', (req: fastify.FastifyRequest<IncomingMessage>, res: fastify.FastifyReply<ServerResponse>) => {
        console.log(req.req);
    });
}
