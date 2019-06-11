import * as fastify from 'fastify';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import fastifyBlipp from 'fastify-blipp-log';
import statusRoutes from './routes/test';

export const PORT = 3000;

export class Server {
    private _server: fastify.FastifyInstance<HttpServer, IncomingMessage, ServerResponse>;

    constructor() {
        this.init();
        this.start();
    }

    init = () => {
        const server = fastify({ logger: true });
        server.register(fastifyBlipp);
        server.register(statusRoutes);
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
            
            this._server.prettyPrintRoutes();
        } catch (error) {
            console.log(error);
            this._server.log.error(error);
            process.exit(1);
        }
    }
}