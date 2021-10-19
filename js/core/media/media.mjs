export class MediaItem {
    #mediaProvider;
    #metaDataProvider;

    constructor(mediaProvider, metaDataProvider) {
        this.#mediaProvider = mediaProvider;
        this.#metaDataProvider = metaDataProvider;
    }

    static async createUsing(
        source, 
        targetPlayerLoader = s => {}, 
        mediaProvider = MediaFileBlobProvider.loadBlobTo, 
        metaDataProvider = async () => {}) {
        if(!source) throw new Error('Argument Required! The argument "source" is required.');

        return await new MediaItem(mediaProvider, metaDataProvider)
            .#loadMedia(source, targetPlayerLoader)
            .#loadMetaData();
    }

    info = {};
    metaData = {};
    participants = [];
    tags = [];

    #loadMedia(source, target) {
        this.info = this.#mediaProvider(source, target);
        return this;
    }
    async #loadMetaData() {
        let data = await this.#metaDataProvider();
        this.mediaMetaData = MediaMetaData.createFrom(data);
        this.metaData = this.mediaMetaData.metaData;
        this.participants = this.mediaMetaData.participants;
        this.tags = this.mediaMetaData.tags;
        this.#readMediaInfo(this.metaData);
        return this;
    }
    #readMediaInfo(metaData) {
        this.info = MediaInfo.createFrom(metaData, this.info);
        return this;
    }
}

class MediaInfo {
    constructor(blobName = '', blobSize = 0.0, lastModifiedOn = {}, mimeType = '')
    {
        this.blobName = blobName;
        this.blobSize = blobSize;
        this.lastModifiedOn = lastModifiedOn;
        this.mimeType = mimeType;
    }

    static createFrom(source, existing)
    {
        let result = existing || source;
        if(result !== source) {
            //TODO: Merge source and existing
            result = result.merge(source);
        }
        return result;
    }

    merge(other) {
        this.id = other.id;
        this.effectiveFrom = other.effectiveFrom;
        this.createdOn = other.createdOn;
        this.createdBy = other.createdBy;
        this.sourceUri = other.sourceUri;

        return this;
    }
}

class MediaMetaData {
    constructor(existing){
        this.data = existing || {};
    }

    static createFrom(existing)
    {
        return new MediaMetaData(existing);
    }

    get metaData() { return this.data.metaData; }

    get participants() { return this.data.participants; }

    get tags() { return this.data.tags; }

    add(name, value) {

    }
    remove(name) {

    }
}

export class MediaMetaDataRestAPI {
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

class MediaProvider {
    loadBlobTo(source, target){}
}

export class MediaFileBlobProvider extends MediaProvider {
    loadBlobTo(source, targetLoader) {
        // Warn user if file size is larger than 50mb
        let blobSize = Math.round(source.size / 1000000)
        if (blobSize > 50.457280) {
            throw new Error(`This media file is ${blobSize} mb. There may be playback issues above 50mb. For ways to reduce file size see the docs: https://`);
        }

        var reader = new FileReader();

        // Closure to capture the blob information.
        reader.onload = (function (targetBlob) {
            return function (e) {
                targetLoader(e.target.result);
            };
        })(source);

        reader.readAsDataURL(source);

        return new MediaInfo(source.name, source.size, source.lastModifiedDate, source.type); 
    }
}