import { theApp } from '/js/app.mjs'
import RxsComponentBase from '/js/components/rxscomponentbase.mjs';

export class MediaListingPage extends RxsComponentBase {
    static get elementName() { return `${MediaListingPage.componentPrefix}-page-medialistingpage`; }
    static get defaultTemplatePath() { return '/medialisting.htm'; }

    constructor() {
        super();

        this.addEventListener(MediaListingPage.componentReadyEventName, this.onComponentReady);
    }

    async onComponentReady(e) {
        const NaN = '[-Unknown-]';

        let values = await theApp
            .mediaMetaDataRestClient
            .listAll()
            .then(result => result
                .map(o => {
                    return {
                        id: o.id ?? null,
                        key: o.key ?? NaN,
                        createdOn: o.createdOn ?? null,
                        blob_name: o.blob?.name ?? null,
                        link: o.id ? `#/media/${o.id}` : null
                    };
                }));

        const options = {
            valueNames: [
                'key',
                'blob_name',
                'createdOn',
                { data: ['id'] },
                { attr: 'href', name: 'link' },
            ],
            item: 'mediaListingItem'
        };

        const mediaList = new List('mediaListingContainer', options, values);
    }
}

export const renderInto = async (container) => {
    // await fetch('/medialisting.htm')
    //     .then(stream => stream.text())
    //     .then(template => {
    //         let fragment = new DOMParser().parseFromString(template, 'text/html'); //, { includeShadowRoot: true }
    //         let elementNode = fragment.querySelector('rxs-page-medialistingpage');
    //         let element = document.importNode(elementNode, true);
    //         container.appendChild(element);
    //     });

    MediaListingPage.define(MediaListingPage);

    let page = new MediaListingPage();
    page.setAttribute(`${MediaListingPage.componentPrefix}-template-path`, MediaListingPage.defaultTemplatePath);
    page.setAttribute('shadowMode', 'open');
    await page.loadTemplate();
    container.appendChild(page);
}