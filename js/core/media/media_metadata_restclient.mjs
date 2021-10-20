export class MediaMetaDataRestClient {
    #baseUri;

    constructor(baseUri) {
        //TODO: validate URI...
        this.#baseUri = baseUri;
    }

    async getById(id) {
        let uri = this.#buildUri(`medias/${id}`);

        return await fetch(uri)
            .then(response => response.json());
    }

    #buildUri(resourcePath) {
        return `${this.#baseUri}/${resourcePath}`;
    }
}