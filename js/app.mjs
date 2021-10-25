export * from './utils.mjs';
export * as Core from './core.mjs';
import {
    Router
} from './utils.mjs';
import {
    Media
} from './core.mjs';

export class theApp {
    static #routingTable = [
        { path: '/', resource: '/pages/dashboardpage.mjs' },
        { path: 'dashboard', resource: '/pages/dashboardpage.mjs' },
        { path: 'media', resource: '/pages/medialistingpage.mjs' },
        { path: 'mediatranscriptionviewer', resource: '/pages/mediatranscriptionviewer.mjs' },
        { path: 'transcribe', resource: '/transcribe.mjs' },
        { path: 'sample', resource: '/pages/samplepage.mjs' },
        { path: 'sampletemplate', resource: '/pageloader?page=sampletemplate.htm' }
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
            value: new Media.MediaMetaDataRestClient({
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