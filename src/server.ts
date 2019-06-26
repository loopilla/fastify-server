import * as fastify from 'fastify';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import fastifyBlipp from 'fastify-blipp-log';
import * as fastifySwagger from 'fastify-swagger';
import usersRoutes from './routes/users';
import statusRoutes from './routes/test';
import authRoutes from './routes/auth';
import * as fastifyJwt from 'fastify-jwt';
import * as fastifyAuth from 'fastify-auth';
import * as config from 'config';
import { JwtUtils } from './jwt.utils';
import db from './db';
// import oauth from './plugins/base';
import basePlugin from './plugins/base';

export const PORT = 3000;

export class Server {
    private _server: fastify.FastifyInstance<HttpServer, IncomingMessage, ServerResponse>;

    constructor() {
        this.init();
        this.start();
    }

    init = () => {
        const server = fastify({ logger: true });
        // console.log(`Oauth: ${typeof oauth}`);
        console.log(`Oauth: ${typeof basePlugin}`);
        server
            .register(fastifySwagger, {
                routePrefix: '/documentation',
                exposeRoute: true,
                swagger: {
                    info: {
                        title: 'Fastify API',
                        description: 'Building a blazing fast REST API with Node.js, MongoDB, Fastify and Swagger',
                        version: '1.0.0'
                    },
                    externalDocs: {
                        url: 'https://swagger.io',
                        description: 'Find more info here'
                    },
                    host: 'localhost',
                    schemes: ['http'],
                    consumes: ['application/json'],
                    produces: ['application/json']
                }
            })
            // .register(basePlugin)
            .register(fastifyBlipp)
            .register(db, {
                url: `mongodb://${config.get('db.host')}:${config.get('db.port')}/${config.get('db.coll')}`,
            })
            .register(fastifyJwt, {
                secret: config.get('auth.jwt.secret')
            })
            .register(basePlugin, {
                name: 'googleOAuth2',
                scope: [
                    // 'gmail.readonly',
                    // 'userinfo.email',
                    'profile'
                ],
                // scope: [
                //     'gmail.readonly',
                //     'userinfo.email',
                //     'userinfo.profile'
                // ],
                credentials: {
                    client: {
                        id: config.get('auth.google.clientId'),
                        secret: config.get('auth.google.clientSecret')
                    },
                    auth: {
                        authorizeHost: 'https://accounts.google.com',
                        authorizePath: '/o/oauth2/v2/auth',
                        tokenHost: 'https://www.googleapis.com',
                        tokenPath: '/oauth2/v4/token'
                    }
                },
                startRedirectPath: '/login/google',
                callbackUri: 'http://localhost:3000/auth/google/callback'
            })
            .register(fastifyAuth)
            .register(authRoutes)
            .register(usersRoutes)
            .register(statusRoutes)
            ;

        server.decorate('verifyJwt', JwtUtils.verifyJwt);
        this._server = server;
    }

    initErrorHandling = () => {
        process.on("uncaughtException", error => {
            console.error(error);
        });
        process.on("unhandledRejection", error => {
            console.error(error);
        });
    }

    start = async () => {
        try {
            await this._server.listen(PORT, "0.0.0.0");
            this._server.swagger();
            this._server.prettyPrintRoutes();
        } catch (error) {
            console.log(error);
            this._server.log.error(error);
            process.exit(1);
        }
    }
}