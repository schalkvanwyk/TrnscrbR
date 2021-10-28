import RxsComponentBase from '/js/components/rxscomponentbase.mjs';

export class DashboardPage extends RxsComponentBase {
    static get elementName() { return `${DashboardPage.componentPrefix}-page-dashboardpage`; }
    static get defaultTemplatePath() { return './dashboard.htm'; }

    constructor() {
        super();
    }
}

export const renderInto = async (container) => {
    DashboardPage.define(DashboardPage);

    let page = new DashboardPage();
    page.setAttribute(`${DashboardPage.componentPrefix}-template-path`, DashboardPage.defaultTemplatePath);
    page.setAttribute('shadowMode', 'open');
    await page.loadTemplate();
    page.renderInto(container);
    container.appendChild(page);
}