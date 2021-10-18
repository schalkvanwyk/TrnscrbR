import {
    ArrayObserver
} from './../../utils/utils.mjs'
import {
    MediaItem,
    MediaFileBlobProvider
} from './media.mjs';

customElements.define('transcript-media-player',
    class TranscriptMediaPlayer extends HTMLElement {
        static #templateName = 'transcript-media-player-template';
        #template = {};
        #fileProvider = new MediaFileBlobProvider().loadBlobTo;
        #metaDataProvider = () => ({});
        #mediaItems = [];
        #mediaItemsObserver = new ArrayObserver(this.#mediaItems);

        constructor() {
            super();
        }

        static get templateName() { return TranscriptMediaPlayer.#templateName; }

        get mediaFileSelector() { 
            Object.defineProperty(this, "mediaFileSelector", { value: this.shadowRoot.getElementById('mediaFileName'), writable: false});
            return this.mediaFileSelector; 
        }

        get mediaPlayer() { 
            Object.defineProperty(this, "mediaPlayer", { value: this.shadowRoot.getElementById('mediaPlayer'), writable: false});
            return this.mediaPlayer; 
        }

        get currentTime() { return this.mediaPlayer.currentTime; }

        seek(currenttime) {
            this.mediaPlayer.currentTime = currenttime;
        }

        connectedCallback() {
            let shadowRoot = this.attachShadow({ mode: 'open' });

            this.template = document
                .getElementById(TranscriptMediaPlayer.#templateName)
                .content;
            if(!this.template) this.template = this.#template;

            shadowRoot.appendChild(this.template.cloneNode(true));

            //TODO: Improve with bindings...
            this.#mediaItemsObserver.Observe((t, a) => {
                if (a === 'push') this.mediaFileSelector.innerText = t.info.blobName;
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
);