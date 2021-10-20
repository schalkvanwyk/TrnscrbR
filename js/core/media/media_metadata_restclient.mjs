export class MediaMetaDataRestClient {
    #baseUri;

    constructor(baseUri) {
        //TODO: validate URI...
        this.#baseUri = baseUri;
    }

    async getById(id) {
        let uri = this.#buildUri(id);

        return await fetch(uri)
            .then(response => response.json());
    }

    async listAll() {
        let uri = this.#buildUri();

        return await fetch(uri)
            .then(response => response.json());
    }

    #buildUri(resourcePath) {
        return `${this.#baseUri}/medias/${resourcePath}`;
    }
}