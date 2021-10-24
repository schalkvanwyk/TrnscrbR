import RxsComponentBase from '/js/components/rxscomponentbase.mjs';

export class SamplePage extends RxsComponentBase {
    static get elementName() { return `${SamplePage.componentPrefix}-page-samplepage`; }
    static get defaultTemplatePath() { return './sample.htm'; }

    constructor() {
        super();
    }
}

export const renderInto = async (container) => {
    // let page = container.querySelector(SamplePage.elementName);
    // if(!page) page = container.appendChild(document.createElement(SamplePage.elementName));
    // else page = container.replaceChild(document.createElement(SamplePage.elementName), page);
    // page.setAttribute(`${SamplePage.componentPrefix}-template-path`, SamplePage.defaultTemplatePath);
    // page.setAttribute('shadowMode', 'open');

    SamplePage.define(SamplePage);

    let page = new SamplePage();
    page.setAttribute(`${SamplePage.componentPrefix}-template-path`, SamplePage.defaultTemplatePath);
    page.setAttribute('shadowMode', 'open');
    container.appendChild(page);
    await page.loadTemplate();
    page.renderInto(container);
}