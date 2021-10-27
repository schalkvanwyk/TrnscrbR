import { SamplePage } from './pages/samplepage.mjs';

let templateLoader = () => {}; // return '<template>testing</template>'; };// return '<div>testing</div>'; };

export const defineSamplePage = (template) => {
    class Sample extends SamplePage {
        constructor() {
            super();
            this.addEventListener(MediaListingPage.componentReadyEventName, this.onComponentReady);
            // this.addEventListener(MediaListingPage.templateLoadedEventName, this.onTemplateLoaded);
        }
        async onComponentReady(e) {
            // render();
        }
        async preLoadTemplate(t) {
            if(template) await this.loadTemplate(template);
        }

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