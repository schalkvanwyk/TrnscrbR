import { MediaListingPage } from './pages/medialistingpage.mjs';

class MediaListing extends MediaListingPage {
    constructor() {
        super();
    }
    async preLoadTemplate(t) {
        if(template) await this.loadTemplate(template);
    }
}

export const renderMediaListingPage = () => {
    MediaListing.define(MediaListing);
}

export default renderMediaListingPage();