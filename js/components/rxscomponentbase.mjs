//See: https://alligator.io/web-components/attributes-properties/

export * from '../utils/query.mjs';
import { $, $$, $Id } from '../utils/query.mjs';
import { HtmlElementWrapper } from '../utils/htmlelementwrapper.mjs';

export default class RxsComponentBase extends HTMLElement {
    static get componentPrefix() { return 'rxs'; }
    static get componentReadyEventName() { return `${RxsComponentBase.componentPrefix}_componentready`; }
    static get templateLoadedEventName() { return `${RxsComponentBase.componentPrefix}_templateloaded`; }
    //TODO:Remove
    //static get elementName() { return `${RxsComponentBase.componentPrefix}-page`; }
    static get defaultTemplateId() { return 'pageContentTemplate'; }
    static get defaultTemplatePath() { return; }
    static get defaultContentId() { return 'pageContent'; }
    static get observedAttributes() { return ['templateId', 'templatePath', 'contentId', 'contentContainerElementName', 'shadowMode']; }

    preLoadTemplate = (template) => {};
    postLoadTemplate = (template) => {};

    #isDeclarativeShadowRoot = false;

    constructor() {
        super();

        let shadow = this.internals.shadowRoot;
        this.#isDeclarativeShadowRoot = !(shadow === undefined || shadow === null);

        // Only load shadowroot if the template is not a Declarative Shadow Root
        // See: https://web.dev/declarative-shadow-dom/
        // check for a Declarative Shadow Root:
        if (!this.#isDeclarativeShadowRoot)
            if (this.hasAttribute('shadowMode')) this.attachShadow({ mode: this.shadowMode });
    }

    get templateId() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-template-id`) ?? RxsComponentBase.defaultTemplateId; }

    get templatePath() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-template-path`) ?? RxsComponentBase.defaultTemplatePath; }

    get contentId() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-content-id`) ?? RxsComponentBase.defaultContentId; }

    get contentContainerElementName() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-content-container`) ?? 'span'; }

    get shadowMode() { return this.getAttribute('shadowMode') ?? 'open'; }

    get internals() {
        Object.defineProperty(this, 'internals', { value: this.attachInternals(), writable: false });
        return this.internals;
    }

    async connectedCallback() {
        if (!this.#isDeclarativeShadowRoot && this.shadowRoot) {
            await this.loadTemplate();
            this.renderInto(this.shadowRoot.host);
        }

        this.dispatchEvent(new CustomEvent(RxsComponentBase.componentReadyEventName, { detail: this }));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //'templateId', 'templatePath', 'contentId', 'contentContainerElementName', 'shadowMode'
        switch (name) {
            // case 'templateId':
            //     console.log(`Value changed from ${oldValue} to ${newValue}`);
            //     break;
            // case 'templatePath':
            //     console.log(`You won't max-out any time soon, with ${newValue}!`);
            //     break;
            default:
                console.log(`"${name}" value changed from ${oldValue} to ${newValue}`);
                break;
        }
    }

    createChild = (elementName, text, display, parent) => HtmlElementWrapper.generate(elementName, text, display, parent);

    async loadTemplate(template) {
        await this.preLoadTemplate(template);

        let templateHasLoaded = false;
        let templateContainer = RxsComponentBase.getTemplateContainer(this);

        if (!templateHasLoaded) templateHasLoaded = this.#handleTextTemplate(template);

        if (!templateHasLoaded) templateHasLoaded = await this.#handleLoadTemplateFromFile(templateContainer);

        await this.postLoadTemplate(template);

        this.dispatchEvent(new CustomEvent(RxsComponentBase.templateLoadedEventName, { detail: this }));
    }

    importTemplateContent(parent) {
        let template = RxsComponentBase.getTemplateContainer(this);

        if (!template) throw new Error('No Template! Could not find a "<template>" container to import the content from.' +
            `${this.#isDeclarativeShadowRoot ? 'The template was defined as a declarative shadow root.' : ''}`);

        let content = document.importNode(template.content, true);

        if (parent.hasChildNodes()) parent.innerHTML = null;

        return parent.appendChild(content);
    }

    renderInto = (container) => {
        let shadowRoot = container.shadowRoot;
        if (!shadowRoot) {
            shadowRoot = container.attachShadow({ mode: 'open' });
        } else {
            container.shadowRoot.innerHTML = '';
        }

        let templateContainer = $(`${this.contentContainerElementName}#${this.contentId}`, shadowRoot);

        if (!templateContainer) templateContainer = this
            .createChild(this.contentContainerElementName, null, true, shadowRoot)
            .setAttribute('id')(this.contentId)
            .element;

        this.importTemplateContent(templateContainer);
    }

    #handleTextTemplate(template) {
        if (!template) return false;

        if (templateContainer) this.removeChild(templateContainer);

        //https://web.dev/declarative-shadow-dom/#parser-only
        let fragment = new DOMParser().parseFromString(template, 'text/html', { includeShadowRoot: true });
        template = fragment.querySelector('template');
        if (template) template = document.importNode(template, true);
        else {
            template = document.createElement('template');
            template.innerHtml = document.importNode(fragment.body, true).innerHTML;
        }

        this.appendChild(template);

        return true;
    }

    async #handleLoadTemplateFromFile(templateContainer) {
        if (templateContainer) return false;

        const templatePath = this.templatePath;
        if (!templatePath) throw new Error('No Template! Could not find a template.');

        await fetch(templatePath)
            .then(stream => stream.text())
            .then(template => {
                const fragment = new DOMParser().parseFromString(template, 'text/html', { includeShadowRoot: true });
                const elementNode = fragment.querySelector(this.localName);
                const element = document.importNode(elementNode, true);
                return element.querySelector(`template#${this.templateId}`)
                    ?? element.querySelector(`#${this.contentId}`)
                    ?? element.children;
            })
            .then(templateContainer => {
                if (!templateContainer) throw new Error('No Template! Could not find a template.');

                if (templateContainer instanceof HTMLCollection)
                    this.append(...templateContainer);
                else
                    this.appendChild(templateContainer);
            });

        return true;
    }

    //TODO: get component name from caller
    static define(component) {
        let element = customElements.get(component.elementName);
        if (!element) {
            customElements.define(component.elementName, component);
            element = customElements.get(component.elementName);
        } //else {
        //     element.renderInto(container);
        // }

        return element;
    }

    static defineWithTemplate(componentDefiner, templateLoader = () => { }) {
        let template = templateLoader();

        return componentDefiner(template);
    }

    static getTemplateContainer = (scope) => $(`template#${scope.templateId}`, scope) ?? $('template', scope) ?? $(`template#${scope.templateId}`) ?? $('template');
}