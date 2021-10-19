import {
    Binding,
    ArrayObserver,
    HtmlElementWrapper as heWrapper
} from './../../utils/utils.mjs'
import {
    MediaItem,
    MediaFileBlobProvider
} from './media.mjs';

//https://www.html5rocks.com/en/tutorials/webcomponents/imports/
//https://www.webcomponents.org/community/articles/introduction-to-html-imports
fetch('./js/core/media/media_player.html')
    .then(stream => stream.text())
    .then(text => define(text));

function define(template) {
    class TranscriptMediaPlayer extends HTMLElement {
        static #templateName = 'transcript-media-player-template';
        #template = {};
        #fileProvider = new MediaFileBlobProvider().loadBlobTo;
        #metaDataProvider = () => ({});
        #mediaItems = [];
        #mediaItemsObserver = new ArrayObserver(this.#mediaItems);

        constructor() {
            super();
            this.#template = template;
        }

        static get templateName() { return TranscriptMediaPlayer.#templateName; }

        get mediaFileSelector() {
            Object.defineProperty(this, "mediaFileSelector", { value: this.shadowRoot.getElementById('mediaFileName'), writable: false });
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

        connectedCallback() {
            let shadowRoot = this.attachShadow({ mode: 'open' });

            let template = document
                .getElementById(TranscriptMediaPlayer.#templateName)
                ?.content;
            if (template) {
                shadowRoot.appendChild(template.cloneNode(true));
            } else {
                shadowRoot.innerHTML = this.#template;
            }

            let mediaInfos = heWrapper.generate('ul');

            //TODO: Improve with bindings...
            this.#mediaItemsObserver.Observe((t, a) => {
                if (a === 'push') {
                    this.mediaFileSelector.innerText = t.info.blobName;

                    mediaInfos.createChild('li', `Name: ${t.info.blobName}`);
                    mediaInfos.createChild('li', `Size: ${t.info.blobSize}`);
                    mediaInfos.createChild('li', `Last Modified On: ${t.info.lastModifiedOn}`);
                    mediaInfos.createChild('li', `Mime Type: ${t.info.mimeType}`);
                }
            });

            this.#addPlayerEventHandlers();

            shadowRoot.getElementById('mediaFileSource')
                .addEventListener('change', e => {
                    var files = Array.from(e.target.files);
                    files.forEach(file => {
                        // Only process audio files.
                        if (!file.type.match('audio.*')) {
                            alert('Must be an audio file');
                            return;
                        };

                        //TODO: add to play list...?
                        this.#mediaItems.push(MediaItem.createUsing(file, stream => this.mediaPlayer.src = stream, this.#fileProvider, this.#metaDataProvider));
                    });
                });
            
            shadowRoot.getElementById('mediaInfoContainer')?.appendChild(mediaInfos.element);
        }

        disconnectedCallback() {
            // removeDisplayErrorMessageListener(this._display.bind(this));
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
    }
    
    customElements.define('transcript-media-player', TranscriptMediaPlayer);
}