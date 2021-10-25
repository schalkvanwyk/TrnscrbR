import { SamplePage } from './pages/samplepage.mjs';

let templateLoader = () => {}; // return '<template>testing</template>'; };// return '<div>testing</div>'; };

export const defineSamplePage = (template) => {
    class Sample extends SamplePage {
        constructor() {
            super();
            if(template) this.loadTemplate(template);
        }

        // connectedCallback() {
        //     this.render();
        // }

        // render() {
        //     // Not needed when template is a declarative shadow root
        //     // this.renderTemplate(this.shadowRoot);
        // }
    }

    return () => Sample.define(Sample);
}

let samplePage = SamplePage.defineWithTemplate(defineSamplePage, templateLoader);

export const renderSamplePage = () => {
    samplePage();

    //return customElements.get(Sample);
}

export default renderSamplePage();