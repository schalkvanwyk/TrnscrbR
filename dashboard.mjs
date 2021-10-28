import { DashboardPage } from './pages/dashboardpage.mjs';

class Dashboard extends DashboardPage {
    // static get elementName() { return `${Dashboard.componentPrefix}-page-dashboardpage`; }
    // static get defaultTemplateId() { return `${Dashboard.componentPrefix}-page-dashboardpagetemplate`; }

    constructor() {
        super();
    }
}

export const renderDashboardPage = () => {
    Dashboard.define(Dashboard);
}

export default renderDashboardPage();