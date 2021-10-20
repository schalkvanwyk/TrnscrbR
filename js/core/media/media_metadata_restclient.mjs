export class MediaMetaDataRestClient {
    #settings;
    #baseUri;

    constructor(settings = { environment, baseUri }) {
        this.#settings = settings;
        //TODO: validate URI...
        this.#baseUri = settings.baseUri;
    }

    async getById(id) {
        let uri = this.#buildUri(id);

        return await fetch(uri)
            .then(response => response.json());
    }

    async listAll() {
        //TODO: remove & create mock proxy class...
        if(this.#settings.mockEnabled) {
            return Promise.resolve(JSON.parse('[{"blob": { "name":"Joe_Soap_104-+001234567890_20211019134020.wav" },"id":1,"key":"Joe_Soap_104-+001234567890_20211019134020","createdOn": "2021-10-19T13:40:20Z"},{"id":2,"key":null},{"blob": {"name":"Jane_Soap_105-+001234567890_20211020132500.wav"},"id":3,"key":"Jane_Soap_105-+001234567890_20211020132500","createdOn": "2021-10-19T13:40:20Z"}]'));
        }
        
        let uri = this.#buildUri();

        return await fetch(uri)
            .then(response => response.json());
    }

    #buildUri(resourcePath) {
        return `${this.#baseUri}/medias/${resourcePath ?? ''}`;
    }
}