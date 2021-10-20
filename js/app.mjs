export * from './core/core.mjs';
import {
    MediaMetaDataRestClient
} from './core/media/media_metadata_restclient.mjs';
import {
    Router
} from './utils/router.mjs'

export class theApp {
    static #routingTable = [
        { path: '/', resource: './dashboard.htm' },
        { path: 'media', resource: './medialisting.htm' }
    ]
    
    static environment = (() => {
        const devHosts = [
            'localhost',
            '127.0.0.1'
        ];
    
        const instance = {
            get environmentName() {
                Object.defineProperty(instance, 'environmentName', {
                    value: devHosts.includes(window.location.hostname) ? 'Development' :  'Production', 
                    writable: false
                });
                return instance.environmentName;
            },
    
            isDevelopment: () => instance.environmentName === 'Development',
            isProduction: () => instance.environmentName !== 'Development'
        };
    
        return instance;
    })()

    static settings = ((environment) => {
        const instance = {
            get mediaMetadataRestAPIUri() {
                Object.defineProperty(instance, 'mediaMetadataRestAPIUri', {
                    value: environment.isDevelopment()
                        ? 'http://localhost:3000' 
                        : 'https://my-json-server.typicode.com/schalkvanwyk/TrnscrbR', 
                    writable: false
                });
                return instance.mediaMetadataRestAPIUri
            },
        };
    
        return instance;
    })(theApp.environment)

    static get mediaMetaDataRestClient() {
        Object.defineProperty(this, 'mediaMetaDataRestClient', {
            value: new MediaMetaDataRestClient({
                baseUri: appSettings.mediaMetadataRestAPIUri, 
                environment: appEnvironment,
                mockEnabled: appEnvironment.isDevelopment()
            }),
            writable: false
        });
        return this.mediaMetaDataRestClient;
    }

    static get router() {
        Object.defineProperty(this, 'router', {
            value: new Router(
                id => document.getElementById(id),
                {
                    environment: appEnvironment,
                    routes: this.#routingTable
                }),
            writable: false
        });
        return this.router;
    }
}

export const appEnvironment = theApp.environment;

export const appSettings = theApp.settings;