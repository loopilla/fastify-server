import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import * as fp from 'fastify-plugin';
import { userModel, user } from '../models/user';

export interface Models {
    user: Model<userModel>;
}

export interface Db {
    models: Models;
}

export default fp(async (fastify, opts: {url: string}, next) => {
    mongoose.connection.on('connected', () => {
        console.log('Mongo connected');
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongo disconnected');
    });

    await mongoose.connect(
        opts.url,
        {
            useNewUrlParser: true,
            keepAlive: true
        }
    );

    const models: Models = {
        user: user
    };

    fastify.decorate('db', {models});
    next();
});