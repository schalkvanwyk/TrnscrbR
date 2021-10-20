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

        let path = Router.getPathFrom(location.hash);

        //ErrorComponent
        const { resource = 'error.html' } = Router.findResourceByPath(path, this.#routes) || {};

        let response = await fetch(resource);
        let text = await response.text();
        let html = text.trim();
        element.innerHTML = html;
        //https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
        // let domDoc = new DOMParser().parseFromString(html, 'text/html');
        // const errorNode = domDoc.querySelector('parsererror');
        // if (errorNode) {
        //   // parsing failed
        // } else {
        //   // parsing succeeded
        // }
        // html = domDoc.innerHTML;
        // // const serializer = new XMLSerializer();
        // // html = serializer.serializeToString(domDoc);
        // html = domDoc.getElementById('page')?.innerHTML?.trim();
        // element.innerHtml = html;
    }

    static getPathFrom = (locationHash) => locationHash.slice(1).toLowerCase() || '/';

    static findResourceByPath = (path, routes) => routes.find(r => r.path.match(new RegExp(`^\\${path}$`, 'gm'))) || undefined;
}