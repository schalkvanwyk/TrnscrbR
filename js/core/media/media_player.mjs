//Remove:not working
// import html from './media_player.html'
import {
    $,
    $Id,
    Binding,
    ArrayObserver,
    HtmlElementWrapper as heWrapper
} from './../../utils/utils.mjs'

//https://stackoverflow.com/a/55081177/26700
//https://www.html5rocks.com/en/tutorials/webcomponents/imports/
//https://www.webcomponents.org/community/articles/introduction-to-html-imports

export const mpLoaderSettings = {
    elementName: undefined,
    templateLocation: './js/core/media/media_player.html',
    mediaItemBuilder: (source, settings) => {},
    mediaBlobProvider: (source, targetLoader, mediaInfoBuilder) => {},
    metadataProvider: async () => {}
}

export var transcriptMediaPlayerLoader = (settings = mpLoaderSettings) => {
    fetch(settings.templateLocation)
        .then(stream => stream.text())
        .then(text => define(text, settings));
}

function define(template, settings) {
    class TranscriptMediaPlayer extends HTMLElement {
        static #elementName = 'transcript-media-player';
        static #templateName = 'transcript-media-player-template';
        #template = {};
        #mediaBlobProvider = settings.mediaBlobProvider || ({});
        #metadataProvider = settings.metadataProvider || ({});
        #mediaItemBuilder = settings.mediaItemBuilder || ({});
        #mediaItems = [];
        #mediaItemsObserver = new ArrayObserver(this.#mediaItems);
        #mediaParticipantsContainerObserver = new MutationObserver(this.#mediaParticipantsContainerMutated);

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.#template = template;
        }

        connectedCallback() {
            if(!this.#template) throw new Error('No Template! No template specified and could not load default template.');

            this.render();

            this.#addPlayerEventHandlers();

            //TODO: Improve with bindings...
            this.#mediaItemsObserver.Observe((t, a) => this.#mediaItemsObserved(t, a, this));

            $Id('mediaFileSource', this.shadowRoot)?.addEventListener('input', e => {
                var files = Array.from(e.target.files);
                files.forEach(file => {
                    // Only process audio files.
                    if (!file.type.match('audio.*')) {
                        alert('Must be an audio file');
                        return;
                    };

                    this.#mediaItemBuilder(
                        file, 
                        {
                            targetPlayerLoader: stream => this.mediaPlayer.src = stream,
                            mediaProvider: this.#mediaBlobProvider,
                            metadataProvider: this.#metadataProvider
                        })
                        //TODO: add to play list...?
                        .then(mediaItem => { this.#mediaItems.push(mediaItem); });
                    // this.#participantsObserver = new ArrayObserver(mediaItem.participants);
                });
            });
            
            $Id('mediaParticipantsContainer', this.shadowRoot).addEventListener('input', this.#mediaParticipantsChanged);
            this.#mediaParticipantsContainerObserver.observe(
                $Id('mediaParticipantsContainer', this.shadowRoot), 
                {
                    attributes: true, 
                    childList: true, 
                    characterData: true
                });
        }

        // disconnectedCallback() {
        //     // removeDisplayErrorMessageListener(this._display.bind(this));
        // }

        static get elementName() { return TranscriptMediaPlayer.#elementName; }
        static get templateName() { return TranscriptMediaPlayer.#templateName; }

        get mediaItems() { return this.#mediaItems; }

        get mediaFileSelector() {
            Object.defineProperty(this, "mediaFileSelector", { value: $Id('mediaFileName', this.shadowRoot), writable: false });
            return this.mediaFileSelector;
        }

        get mediaPlayer() {
            Object.defineProperty(this, "mediaPlayer", { value: this.shadowRoot.getElementById('mediaPlayer'), writable: false });
            return this.mediaPlayer;
        }

        get currentTime() { return this.mediaPlayer.currentTime; }

        seek(currenttime) {
            this.mediaPlayer.currentTime = currenttime;
        }

        render() {
            //Remove:Not working...
            // let {cssContent, htmlContent} = this.#htmlToElement(html);
            // this.shadowRoot.innerHTML = '';
            // shadowRoot.appendChild(htmlContent);

            let template = $Id(TranscriptMediaPlayer.templateName)?.content;
            if (template) {
                this.shadowRoot.appendChild(template.cloneNode(true));
            } else {
                this.shadowRoot.innerHTML = this.#template?.trim();
            }

            let mediaInfos = heWrapper.generate('ul');
            $Id('mediaInfoContainer', this.shadowRoot)?.appendChild(mediaInfos.element);
        }

        #mediaItemsObserved(target, action, $this) {
            if (action === 'push') {
                let info = target.info;
                if(!info) return;

                $this.mediaFileSelector.innerText = info.blobName;

                let infoContainer = $('#mediaInfoContainer>ul', $this.shadowRoot);

                infoContainer.innerHTML = '';

                this.#bindListItem(info, 'blobName', 'Name: ', infoContainer);
                // heWrapper.generate('li', `Name: ${info.blobName ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'blobSize', 'Size: ', infoContainer);
                // heWrapper.generate('li', `Size: ${info.blobSize ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'lastModifiedOn', 'Last Modified On: ', infoContainer);
                // heWrapper.generate('li', `Last Modified On: ${info.lastModifiedOn}`, true, infoContainer);
                this.#bindListItem(info, 'mimeType', 'Mime Type: ', infoContainer);
                // heWrapper.generate('li', `Mime Type: ${info.mimeType ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'effectiveFrom', 'Effective From: ', infoContainer);
                // heWrapper.generate('li', `Effective From: ${info.effectiveFrom ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'createdOn', 'Created On: ', infoContainer);
                // heWrapper.generate('li', `Created On: ${info.createdOn ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'createdBy', 'Created By: ', infoContainer);
                // heWrapper.generate('li', `Created By: ${info.createdBy ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'sourceUri', 'Source Uri: ', infoContainer);
                // heWrapper.generate('li', `Source Uri: ${info.sourceUri ?? ''}`, true, infoContainer);
                this.#bindListItem(info, 'id', 'Metadata Id: ', infoContainer);
                // heWrapper.generate('li', `Metadata Id: ${info.id ?? ''}`, true, infoContainer);

                let participantsContainer = $('#mediaParticipantsContainer>ol', $this.shadowRoot);
                target.participants.forEach(participant => {
                    heWrapper.generate('li', participant, true, participantsContainer);
                });

                let metadataContainer = $('#mediaMetadataContainer>ul', $this.shadowRoot);
                let metadata = target.metadata;
                Object.entries(metadata).map(([k, v]) => {
                    this.#bindListItem(metadata, k, `${k}: `, metadataContainer);
                });

                let tagsContainer = $('#mediaTagsContainer>ul', $this.shadowRoot);
                target.tags.forEach(tag => {
                    heWrapper.generate('li', tag, true, tagsContainer);
                });
            }
        }

        #bindListItem(target, propertyName, value, parent) {
            let boundItem = $(`li>span[data-binding="${propertyName}]`, parent);
            if(!boundItem) {
                boundItem = heWrapper
                    .generate('li', value, true, parent)
                    .createChildAndUse('span', target[propertyName] ?? '')
                    .element;
                
                boundItem.dataset.binding = propertyName;
                
                let binding = new Binding({object: target, property: propertyName});
                binding.addBinding(boundItem, 'innerHtml');

                if(!target.bindings) target.bindings = [];
                target.bindings.push(binding);
            }
        }

        #mediaParticipantsChanged(event) {
            switch (event.inputType) {
                case 'insertParagraph':
                    
                    break;
            
                default:
                    console.log(event);
                    break;
            }
        }

        #mediaParticipantsContainerMutated(mutations) {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    const listValues = Array.from(targetNode.children)
                        .map(node => node.innerHTML)
                        .filter(html => html !== '<br>');

                    console.log(listValues);
                }
            });
        }

        #addPlayerEventHandlers() {
            let mediaPlayer = this.mediaPlayer;

            mediaPlayer.addEventListener('timeupdate', e => {
                let target = e.target;

                if (target.paused) return;

                this.dispatchEvent(new CustomEvent('speaking', {
                    bubbles: true,
                    composed: true,
                    detail: target.currentTime
                }));
            });

            mediaPlayer.addEventListener('play', e => {
                this.dispatchEvent(new CustomEvent('playing', {
                    bubbles: true,
                    composed: true,
                    detail: e
                }));
            });

            mediaPlayer.addEventListener('ended', e => {
                this.dispatchEvent(new CustomEvent('ended', {
                    bubbles: true,
                    composed: true,
                    detail: e
                }));
            });

            mediaPlayer.addEventListener('seeked', e => {
                this.dispatchEvent(new CustomEvent('seeked', {
                    bubbles: true,
                    composed: true,
                    detail: e
                }));
            });
        }

        //Remove:Not working...
        //https://roshan-khandelwal.medium.com/web-components-c7aef23fe478
        // #htmlToElement(html) {
        //     let template = this.shadowRoot.createElement('template');
        //     template.innerHTML = html.trim(); // Never return a text node of whitespace as the result

        //     return { cssContent : template.querySelector('head>style'), htmlContent: template.querySelector('body') };
        // }
    }

    customElements.define(settings.elementName ?? TranscriptMediaPlayer.elementName, TranscriptMediaPlayer);
}