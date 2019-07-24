import * as fp from 'fastify-plugin';
import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { google } from 'googleapis';
import * as config from 'config';
import { OAuth2Client } from 'googleapis-common';
import { GetTokenResponse, GenerateAuthUrlOpts, GetAccessTokenCallback } from 'google-auth-library/build/src/auth/oauth2client';
import { Credentials } from 'google-auth-library';

function basePlugin(fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>, options: fastify.RegisterOptions<Server, IncomingMessage, ServerResponse>, next?: fp.nextCallback) {
    const oauth2Client: OAuth2Client = new google.auth.OAuth2(
        config.get('auth.google.clientId'),
        config.get('auth.google.clientSecret'),
        config.get('auth.google.redirectUrl')
    );

    const scope: string[] = config.get<string[]>('auth.google.scopes');

    const opts: GenerateAuthUrlOpts = {
        scope: scope,
        redirect_uri: config.get('auth.google.redirectUrl')
    };

    const url = oauth2Client.generateAuthUrl(opts);

    function getAccessTokenFromAuthorizationCodeFlow(request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, callback: (err: Error, result: any) => any ) {
        const code = request.query.code;
        console.log(`url: ${url}`);
        getToken(code)
            .then((tokenResponse: GetTokenResponse) => {
                console.log(tokenResponse.tokens);
                oauth2Client.setCredentials(tokenResponse.tokens);
                console.log('Done');
                callback.bind(this, tokenResponse.tokens.access_token, )
            });
    }

    function startRedirectHandler(
        request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>,
        reply:  fastify.FastifyReply<ServerResponse>
    ) {
        // const state = generateStateFunction();
        oauth2Client.setCredentials(request.body);
        // const state = 'satte';

        const authorizationUri = url;
        // const authorizationUri = this[options.name].authorizationCode.authorizeURL({
        //     redirect_uri: options.callbackUri,
        //     scope: options.scope,
        //     state: state
        // });

        reply.redirect(authorizationUri);
    }

    // async function getToken(code: string): Promise<Credentials> {
    //     const result = await oauth2Client.getToken(code);
    //     return result.tokens;
    // }

    function getToken(code: string): Promise<GetTokenResponse> {
        return oauth2Client.getToken(code);
    }

    //     return new Promise((resolve, reject) => {
    //         const result = oauth2Client.getToken(code);
    //         if (result) {
    //             return resolve(result);
    //         }
    //         return reject(result);
    //     });
    //     const result = await oauth2Client.getToken(code);
    //     return result.tokens;
    // }

    if (options.startRedirectPath) {
        fastify.get(options.startRedirectPath, startRedirectHandler);
        fastify.decorate('getAccessTokenFromAuthorizationCodeFlow', getAccessTokenFromAuthorizationCodeFlow);
    }

    try {
        fastify.decorate(options.name, oauth2Client);
    } catch (e) {
        next(e);
        return;
    }

    console.log(`url: ${url}`);
    next();

}

export default fp(basePlugin, {
    fastify: '2.x',
    name: 'basePlugin'
});
