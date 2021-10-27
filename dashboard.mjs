import { DashboardPage } from './pages/dashboardpage.mjs';

export const defineDashboardPage = (template) => {
    class Dashboard extends DashboardPage {
        // static get elementName() { return `${Dashboard.componentPrefix}-page-dashboardpage`; }
        // static get defaultTemplateId() { return `${Dashboard.componentPrefix}-page-dashboardpagetemplate`; }

        constructor() {
            super();
            if(template) this.loadTemplate(template);
        }
    }

    return () => Dashboard.define(Dashboard);
}

let dashboardPage = DashboardPage.defineWithTemplate(defineDashboardPage);

export const renderDashboardPage = () => {
    dashboardPage();
}

export default renderDashboardPage();