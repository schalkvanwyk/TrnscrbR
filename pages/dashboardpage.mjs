import RxsComponentBase from '/js/components/rxscomponentbase.mjs';

export class DashboardPage extends RxsComponentBase {
    static get elementName() { return `${DashboardPage.componentPrefix}-page-dashboardpage`; }
    static get defaultTemplatePath() { return './dashboard.htm'; }

    constructor() {
        super();
    }
}

export const renderInto = async (container) => {
    // let page = container.querySelector(DashboardPage.elementName);
    // if(!page) page = container.appendChild(document.createElement(DashboardPage.elementName));
    // else page = container.replaceChild(document.createElement(DashboardPage.elementName), page);
    // page.setAttribute(`${DashboardPage.componentPrefix}-template-path`, DashboardPage.defaultTemplatePath);
    // page.setAttribute('shadowMode', 'open');

    DashboardPage.define(DashboardPage);

    let page = new DashboardPage();
    page.setAttribute(`${DashboardPage.componentPrefix}-template-path`, DashboardPage.defaultTemplatePath);
    page.setAttribute('shadowMode', 'open');
    container.appendChild(page);
    await page.loadTemplate();
    page.renderInto(container);
}