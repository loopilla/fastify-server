import * as fastify from 'fastify';
import * as fp from "fastify-plugin";
import * as fastifyAuth from 'fastify-auth';
import * as sget from 'simple-get';
import { ServerResponse as HttpResponse } from 'http';

import { IncomingMessage, ServerResponse } from 'http';
import { JwtUtils } from '../jwt.utils';

export default fp(async (server, opts, next) => {
    server.route({
        url: "/auth/register",
        logLevel: "warn",
        method: ["POST", "HEAD"],
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    username: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string' },
                    lastLogin: { type: 'string' },
                    loginType: { type: 'string' },
                    googleToken: { type: 'string' },
                    facebookToken: { type: 'string' },
                    modDate: { type: 'object' }
                },
                required: ['email', 'username']
            }
        },
        handler: async (request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, reply: fastify.FastifyReply<HttpResponse>) => {
            const user = await server.db.models.user.create(request.body);

            console.log('Bela');
            const token = 'ezazbiz';
            reply.send({ token });
            // server.level.put(req.body.user, req.body.password, onPut)

            // function onPut(err) {
            //     if (err) return reply.send(err)
            //     fastify.jwt.sign(req.body, onToken)
            // }

            // function onToken(err, token) {
            //     if (err) return reply.send(err)
            //     req.log.info('User created')
            //     reply.send({ token })
            // }

        }
    });
    server.route({
        method: 'GET',
        url: '/auth',
        preHandler: server.auth([server.verifyJwt]),
        handler: (req, reply) => {
            req.log.info('Auth route')
            reply.send({ hello: 'world' })
        }
    });

    server.route({
        method: 'GET',
        url: '/auth/google/callback',
        handler: async (request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, reply: fastify.FastifyReply<HttpResponse>) => {
            server.getAccessTokenFromAuthorizationCodeFlow(request, (err: Error, result: any) => {
                if (err) {
                    reply.send(err);
                    return;
                  }
              
                  sget.concat({
                    // url: 'https://www.googleapis.com/plus/v1/people/me',
                    url: 'https://people.googleapis.com/v1/people/me',
                    method: 'GET',
                    headers: {
                      Authorization: 'Bearer ' + result.access_token
                    },
                    json: true
                  }, function (err: Error, res: fastify.FastifyReply<HttpResponse>, data: any) {
                    if (err) {
                      reply.send(err);
                      return;
                    }
                    // Here we have the tokens
                    reply.send(data);
                  })                
            });
        }
    });
    next();
});
