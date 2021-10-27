import { MediaListingPage } from './pages/medialistingpage.mjs';

export const defineMediaListingPage = (template) => {
    class MediaListing extends MediaListingPage {
        constructor() {
            super();
        }
        async preLoadTemplate(t) {
            if(template) await this.loadTemplate(template);
        }
    }

    return () => MediaListing.define(MediaListing);
}

let mediaListingPage = MediaListingPage.defineWithTemplate(defineMediaListingPage);

export const renderMediaListingPage = () => {
    mediaListingPage();
}

export default renderMediaListingPage();