export * from '../utils/query.mjs';
import { $, $$, $Id } from '../utils/query.mjs';
import { HtmlElementWrapper } from '../utils/htmlelementwrapper.mjs';

export default class RxsComponentBase extends HTMLElement {
    static get componentPrefix() { return 'rxs'; }
    static get defaultTemplateId() { return 'pageContentTemplate'; }
    static get defaultTemplatePath() { return; }
    static get defaultContentId() { return 'pageContent'; }

    constructor() {
        super();

        this.loadTemplate();
    }

    get templateId() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-template-id`) ?? RxsComponentBase.defaultTemplateId; }

    get templatePath() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-template-path`) ?? RxsComponentBase.defaultTemplatePath; }

    get contentId() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-content-id`) ?? RxsComponentBase.defaultContentId; }

    get contentContainerElementName() { return this.getAttribute(`${RxsComponentBase.componentPrefix}-content-container`) ?? 'span'; }

    get templateConent() { return document.importNode(RxsComponentBase.getTemplateContainer(this).content, true); }

    createChild = (elementName, text, display, parent) => HtmlElementWrapper.generate(elementName, text, display, parent);

    loadTemplate(template) {
        let templateContainer = RxsComponentBase.getTemplateContainer(this);

        if(template) {
            if(templateContainer) this.removeChild(templateContainer);
            this.innerHTML = template;
            return;
        }

        if(!templateContainer) {
            const templatePath = this.templatePath;
            if(!templatePath) throw new Error('No Template! Could not find a template.');

            templateContainer = fetch(templatePath)
                .then(stream => stream.text())
                .then(text => {
                    let df = document.createDocumentFragment();
                    df.createChild('template-container').innerHtml = text;
                    return df.querySelector(`template#${scope.templateId}`);
                });
            
            if(!templateContainer) throw new Error('No Template! Could not find a template.');

            this.shadowRoot.appendChild(templateContainer);
        }
    }

    renderTemplate = (parent) => this
        .createChild(this.contentContainerElementName, null, true, parent)
        .setAttribute('id')(this.contentId)
        .element
        .appendChild(this.templateConent);

    //TODO: get component name from caller
    static define(component) {
        customElements.define(component.elementName, component);
    }

    static defineWithTemplate(componentDefiner, templateLoader) {
        let template = templateLoader();
        return componentDefiner(template);
    }

    static getTemplateContainer = (scope) => $(`template#${scope.templateId}`, scope) ?? $('template', scope) ?? $('template');

    // static get observedAttributes() {
    //     return ['value', 'max'];
    // }

    // attributeChangedCallback(name, oldValue, newValue) {
    //     switch (name) {
    //         case 'value':
    //             console.log(`Value changed from ${oldValue} to ${newValue}`);
    //             break;
    //         case 'max':
    //             console.log(`You won't max-out any time soon, with ${newValue}!`);
    //             break;
    //     }
    // }
}