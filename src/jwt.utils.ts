import * as fastify from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

export class JwtUtils {
    public static verifyJwt = function (
        // instance: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>,
        request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>,
        reply: fastify.FastifyReply<ServerResponse>) {
        const jwt = this.jwt;
        console.log(`jwt`);
        if (request.body) {
            // console.log(`${request.body}`);
            reply.code(401).send({ error: 'Unauthorized' })
            return Promise.reject(new Error())
        }

        if (!request.req.headers['authorization']) {
            return Promise.reject(new Error('Missing token header'))
        }

        return new Promise((resolve, reject) => {
            jwt.verify(request.req.headers['authorization'].substring(7), ((err: any, decode: any) => {
                if (err) {
                    return reject(err);
                }
            }));
            // console.log('OK');
            // // resolve('OK');

            // reject('Faszt');
        // }).then(decoded => {

        }).catch(error => {
            request.log.error(error);
            throw new Error('invalid token');
        });
    }
}