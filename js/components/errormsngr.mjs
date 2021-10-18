import {
    listenForDisplayErrorMessage,
    removeDisplayErrorMessageListener,
} from "./events.mjs";

export class ErrorMsngR extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // this.classList.add("Trnscrbr-ErrorContainer");
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

        let div = document.createElement("div");
        div.innerText = message;
        div.classList.add("Trnscrbr-ErrorContainer");

        this.insertAdjacentElement("beforeend", div);

        setTimeout(() => {
            this.removeChild(div);
        }, 3000);
    }
}

customElements.define("error-msngr", ErrorMsngR);