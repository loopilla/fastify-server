import { Server } from './server';

export class ServerApplication {
    private _server: Server;

    constructor () {
        this.init();
    }

    init = () => {
        this._server = new Server();
        this._server.start();
    }
}

const app = new ServerApplication();
module.exports = app;
