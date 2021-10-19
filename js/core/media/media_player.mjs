//TODO: remove not working
// import html from './media_player.html'
import {
    $,
    $Id,
    ArrayObserver,
    HtmlElementWrapper as heWrapper
} from './../../utils/utils.mjs'
import {
    MediaItem,
    MediaMetaDataRestAPI,
    MediaFileBlobProvider
} from './media.mjs';

//https://stackoverflow.com/a/55081177/26700
//https://www.html5rocks.com/en/tutorials/webcomponents/imports/
//https://www.webcomponents.org/community/articles/introduction-to-html-imports

export var transcriptMediaPlayerLoader = (elementName) => {
    fetch('./js/core/media/media_player.html')
        .then(stream => stream.text())
        .then(text => define(text));
}

function define(template, elementName) {
    class TranscriptMediaPlayer extends HTMLElement {
        static #elementName = 'transcript-media-player';
        static #templateName = 'transcript-media-player-template';
        #template = {};
        #fileProvider = new MediaFileBlobProvider().loadBlobTo;
        #metaDataProvider = async () => {
            let apiClient = new MediaMetaDataRestAPI('https://my-json-server.typicode.com/schalkvanwyk/TrnscrbR');
            return await apiClient.getById(1);
        }; //({});
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

            $Id('mediaFileSource', this.shadowRoot)?.addEventListener('input', e => {
                var files = Array.from(e.target.files);
                files.forEach(file => {
                    // Only process audio files.
                    if (!file.type.match('audio.*')) {
                        alert('Must be an audio file');
                        return;
                    };

                    //TODO: add to play list...?
                    MediaItem
                        .createUsing(file, stream => this.mediaPlayer.src = stream, this.#fileProvider, this.#metaDataProvider)
                        .then(mediaItem => { this.#mediaItems.push(mediaItem); });
                    // this.#participantsObserver = new ArrayObserver(mediaItem.participants);
                });
            });

            //TODO: Improve with bindings...
            this.#mediaItemsObserver.Observe((t, a) => this.#mediaItemsObserved(t, a, this));
            
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
            //Not working...
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

                let container = $('#mediaInfoContainer>ul', $this.shadowRoot);

                heWrapper.generate('li', `Name: ${info.blobName}`, true, container);
                heWrapper.generate('li', `Size: ${info.blobSize}`, true, container);
                heWrapper.generate('li', `Last Modified On: ${info.lastModifiedOn}`, true, container);
                heWrapper.generate('li', `Mime Type: ${info.mimeType}`, true, container);
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

        //Not working...
        //https://roshan-khandelwal.medium.com/web-components-c7aef23fe478
        // #htmlToElement(html) {
        //     let template = this.shadowRoot.createElement('template');
        //     template.innerHTML = html.trim(); // Never return a text node of whitespace as the result

        //     return { cssContent : template.querySelector('head>style'), htmlContent: template.querySelector('body') };
        // }
    }

    customElements.define(elementName ?? TranscriptMediaPlayer.elementName, TranscriptMediaPlayer);
}