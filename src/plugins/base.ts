import * as fp from 'fastify-plugin';
import * as fastify from 'fastify';
import * as oauth2 from 'simple-oauth2';

import { Server, IncomingMessage, ServerResponse } from 'http';

const defaultState = require('crypto').randomBytes(10).toString('hex')

// const oauth2Module = require('simple-oauth2');

const promisify = require('util').promisify || require('es6-promisify').promisify;

function defaultGenerateStateFunction() {
    return defaultState;
}

function defaultCheckStateFunction(state: any, callback: any) {
    if (state === defaultState) {
        callback();
        return;
    }
    callback(new Error('Invalid state'));
}

function basePlugin(fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>, options: fastify.RegisterOptions<Server, IncomingMessage, ServerResponse>, next?: fp.nextCallback) {
    console.log('Stop here');
    if (typeof options.name !== 'string') {
        return next(new Error('options.name should be a string'));
    }
    if (typeof options.credentials !== 'object') {
        return next(new Error('options.credentials should be an object'));
    }
    if (typeof options.callbackUri !== 'string') {
        return next(new Error('options.callbackUri should be a string'));
    }
    if (options.generateStateFunction && typeof options.generateStateFunction !== 'function') {
        return next(new Error('options.generateStateFunction should be a function'));
    }
    if (options.checkStateFunction && typeof options.checkStateFunction !== 'function') {
        return next(new Error('options.checkStateFunction should be a function'));
    }
    if (options.startRedirectPath && typeof options.startRedirectPath !== 'string') {
        return next(new Error('options.startRedirectPath should be a string'));
    }
    options.generateStateFunction = options.generateStateFunction || defaultGenerateStateFunction;
    options.checkStateFunction = options.checkStateFunction || defaultCheckStateFunction;

    if (!options.generateStateFunction && !options.checkStateFunction) {
        return next(new Error('options.checkStateFunction and options.generateStateFunction have to be given'));
    }
    const name = options.name;
    const credentials = options.credentials;
    const callbackUri = options.callbackUri;
    const scope = options.scope;
    const generateStateFunction = options.generateStateFunction || defaultGenerateStateFunction;
    const checkStateFunction = options.checkStateFunction || defaultCheckStateFunction;
    const startRedirectPath = options.startRedirectPath;

    function startRedirectHandler(request: any, reply: any) {
        const state = generateStateFunction();

        const authorizationUri = this[name].authorizationCode.authorizeURL({
            redirect_uri: callbackUri,
            scope: scope,
            state: state
        });
        reply.redirect(authorizationUri);
    }

    const cbk = function (o: any, code: any, callback: any) {
        return o.authorizationCode.getToken({
            code: code,
            redirect_uri: callbackUri
        }, callback);
    }

    function getAccessTokenFromAuthorizationCodeFlowCallbacked(request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, callback: any) {
        const code = request.query.code;
        const state = request.query.state;

        checkStateFunction(state, function (err: any) {
            if (err) {
                callback(err);
                return;
            }
            // cbk(fastify[name], code, callback)
        })
    }
    const getAccessTokenFromAuthorizationCodeFlowPromiseified = promisify(getAccessTokenFromAuthorizationCodeFlowCallbacked);

    function getAccessTokenFromAuthorizationCodeFlow(request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, callback: any) {
        if (!callback) {
            return getAccessTokenFromAuthorizationCodeFlowPromiseified(request);
        }
        getAccessTokenFromAuthorizationCodeFlowCallbacked(request, callback);
    }

    const oauth2Obj = oauth2.create(credentials);

    if (startRedirectPath) {
        fastify.get(startRedirectPath, startRedirectHandler);
        fastify.decorate('getAccessTokenFromAuthorizationCodeFlow', getAccessTokenFromAuthorizationCodeFlow);
    }

    try {
        fastify.decorate(name, oauth2Obj);
    } catch (e) {
        next(e);
        return;
    }

    next();
}

export default fp(basePlugin, {
    fastify: '2.x',
    name: 'basePlugin'
});
