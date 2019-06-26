import * as fp from 'fastify-plugin';
import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { google } from 'googleapis';
import * as config from 'config';
import { OAuth2Client } from 'googleapis-common';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { Credentials } from 'google-auth-library';

function basePlugin(fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>, options: fastify.RegisterOptions<Server, IncomingMessage, ServerResponse>, next?: fp.nextCallback) {
    const oauth2Client: OAuth2Client = new google.auth.OAuth2(
        config.get('auth.google.clientId'),
        config.get('auth.google.clientSecret'),
        config.get('auth.google.redirectUrl')
    );

    const scopes = config.get('auth.google.scopes');

    const url = oauth2Client.generateAuthUrl();

    function getAccessTokenFromAuthorizationCodeFlow(request: fastify.FastifyRequest<IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, callback: (err: Error, result: any) => any ) {
        const code = request.body.code;
        console.log(`url: ${url}`);
        getToken(code)
            .then(credentials => (oauth2Client.setCredentials(credentials)));
    }


    async function getToken(code: string): Promise<Credentials> {
        const result = await oauth2Client.getToken(code);
        return result.tokens;
    }

    console.log(`url: ${url}`);
    next();

}

export default fp(basePlugin, {
    fastify: '2.x',
    name: 'basePlugin'
});
