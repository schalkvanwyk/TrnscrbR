import { DashboardPage } from './pages/dashboardpage.mjs';

let templateLoader = () => {}; // return '<template>testing</template>'; };// return '<div>testing</div>'; };

export const defineDashboardPage = (template) => {
    class Dashboard extends DashboardPage {
        // static get elementName() { return `${Dashboard.componentPrefix}-page-dashboardpage`; }
        static get defaultTemplateId() { return `${Dashboard.componentPrefix}-page-dashboardpagetemplate`; }

        constructor() {
            super();
            if(template) this.loadTemplate(template);
        }

        // connectedCallback() {
        //     this.render();
        // }

        // render() {
        //     // Not needed when template is a declarative shadow root
        //     // this.renderInto(this.shadowRoot);
        // }
    }

    return () => Dashboard.define(Dashboard);
}

let dashboardPage = DashboardPage.defineWithTemplate(defineDashboardPage, templateLoader);

export const renderDashboardPage = () => {
    dashboardPage();

    //return customElements.get(Dashboard);
}

export default renderDashboardPage();