//https://dev.to/pixari/build-a-very-basic-spa-javascript-router-2k4p
export class Router {
    #settings;
    #routes;
    #$Id;

    constructor(getElementById = id => { }, settings = { environment: {}, routes: [] }) {
        this.#settings = settings;
        this.#routes = settings.routes;
        this.#$Id = getElementById;
    }

    async applyTo(location, element) {
        if (!element) element = this.#$Id('app');
        if (!element) throw new Error('No target element! The element to target does not exists.');

        const path = Router.getPathFrom(location.hash);

        // Only returns string result matching patern, so no arrow functions
        const { resource = 'error.htm' } = Router.findResourceByPath(path, this.#routes) || {};

        await Router.render(resource, element);
    }

    static getPathFrom = (locationHash) => locationHash.slice(1).toLowerCase() || '/';

    static findResourceByPath = (path, routes) => routes.find(r => r.path.match(new RegExp(`^${path}$`, 'gm'))) || undefined;

    static async render(resource, parent) {
        const method = Router.GetRenderMethodResource(resource);
        switch (method.renderMethod) {
            case 'pageloader':
                await Router.handlerRenderWithPageloader(method.resource, parent);
                break;
            default:
                await Router.handleModuleImporter(method.resource, parent);
                break;
        }
    }

    static GetRenderMethodResource(resource) {
        if (resource.startsWith('/pageloader?page=')) return { renderMethod: 'pageloader', resource: resource.substring('/pageloader?page='.length) };
        else return { renderMethod: 'moduleimporter', resource: resource };
    }

    static async handleModuleImporter(resource, parent) {
        const module = await import(resource);
        parent.innerHTML = null;
        await module.renderInto(parent);
    }

    static async handlerRenderWithPageloader(resource, parent) {
        await fetch(resource)
            .then(response => response.text())
            .then(text => {
                const html = text.trim();

                //https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
                const domDoc = new DOMParser().parseFromString(html, 'text/html', { includeShadowRoot: true });
                // parsing failed?
                const errorNode = domDoc.querySelector('parsererror');
                if (errorNode) {
                  throw new Error('Load Failed! Unable to load the resource.' + errorNode);
                } else {
                  // parsing succeeded
                  const content = domDoc.querySelector('main#page_content');

                    if(content){
                        const contentNode = document.importNode(content, true);

                        if(contentNode) {
                            parent.innerHTML = '';
                            let shadowRoot = parent.shadowRoot;
                            if(!shadowRoot) shadowRoot = parent.attachShadow( {mode:'open'} );
                            shadowRoot.append(...(document.importNode(contentNode, true)).childNodes);
                            const template = shadowRoot.querySelector('template');
                            shadowRoot.appendChild(document.importNode(template.content, true));
                        }

                        // customElements.define('page-content', class extends HTMLElement {
                        //     constructor(){
                        //         super();
                        //         this.attachShadow({mode: 'open'}).innerHTML = contentNode.innerHTML;
                        //     }
                        // });

                        // parent.appendChild(document.createElement('page-content'));
                    }
                }
            });
    }
}