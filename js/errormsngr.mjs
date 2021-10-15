import {
    listenForDisplayErrorMessage,
    removeDisplayErrorMessageListener,
} from "./js/events.js";

export class ErrorMsngR extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add("Trnscrbr-ErrorContainer");
        listenForDisplayErrorMessage(this._display.bind(this));
    }

    disconnectedCallback() {
        removeDisplayErrorMessageListener(this._display.bind(this));
    }

    /******************************************************************************
     * Private methods
     *****************************************************************************/

    _display(e) {
        const message = e.detail;

        let p = document.createElement("p");
        p.innerText = message;

        this.insertAdjacentElement("beforeend", p);

        setTimeout(() => {
            this.removeChild(p);
        }, 3000);
    }
}

customElements.define("error-msngr", ErrorMsngR);