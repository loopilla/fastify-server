import * as fastify from 'fastify';
import * as fp from "fastify-plugin";
import * as fastifyAuth from 'fastify-auth';
import * as sget from 'simple-get';

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
        handler: async (request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, reply: any) => {
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
        handler: async (request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, reply: any) => {
            server.getAccessTokenFromAuthorizationCodeFlow(request, (err: any, result: any) => {
                if (err) {
                    reply.send(err)
                    return
                  }
              
                  sget.concat({
                    url: 'https://www.googleapis.com/plus/v1/people/me',
                    method: 'GET',
                    headers: {
                      Authorization: 'Bearer ' + result.access_token
                    },
                    json: true
                  }, function (err: any, res: any, data: any) {
                    if (err) {
                      reply.send(err)
                      return
                    }
                    reply.send(data)
                  })                
            });
            console.log(request.req.url);
            reply.send({message: 'OK'});
            // this.getAccessTokenFromAuthorizationCodeFlow();
        }
    });
    next();
});