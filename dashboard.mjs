import RxsComponentBase from './js/components/rxscomponentbase.mjs';

// document.getElementById('page').appendChild(document.createElement('div')).innerText = 'Dynamic script content.';

let templateLoader = () => { return '<template>testing</template>'; };

let dashboardPage = RxsComponentBase.defineWithTemplate(define, templateLoader);

export const render = () => {
    dashboardPage();
}

function define(template) {
    class DashboardPage extends RxsComponentBase {
        static get elementName() { return `${DashboardPage.componentPrefix}-page`; }

        constructor() {
            super();

            this.attachShadow({ mode: 'open' });

            if(template) this.loadTemplate(template);
        }

        connectedCallback() {
            this.render();
        }

        render() {
            this.renderTemplate(this.shadowRoot);
        }
    }

    return () => DashboardPage.define(DashboardPage);
}

//See: https://alligator.io/web-components/attributes-properties/