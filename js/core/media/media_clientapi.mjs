export class MediaItemBuilder {
    static async createUsing(
        source, 
        settings = {
            targetPlayerLoader: s => {},
            mediaProvider: (source, targetLoader) => {},
            metadataProvider: async () => {}
        }) {
        if(!source) throw new Error('Argument Required! The argument "source" is required.');

        return await new MediaItem(settings.mediaProvider, settings.metadataProvider)
            .loadMedia(source, settings.targetPlayerLoader)
            .loadMetaData();
    }
}

class MediaItem {
    #mediaProvider;
    #metadataProvider;

    constructor(mediaProvider, metadataProvider) {
        this.#mediaProvider = mediaProvider;
        this.#metadataProvider = metadataProvider;
    }


    mediaMetadata = {};
    info = {};
    get metadata() { return this.mediaMetadata?.metadata ?? {}; };
    get participants() { return this.mediaMetadata?.participants ?? []; };
    get tags() { return this.mediaMetadata?.tags ?? []; };

    loadMedia(source, target) {
        this.info = this.#mediaProvider(source, target, 
            mediaInfo => new MediaInfo(mediaInfo.blobName, mediaInfo.blobSize, mediaInfo.lastModifiedDate, mediaInfo.mimeType));
        return this;
    }

    async loadMetaData() {
        let data = await this.#metadataProvider();
        this.mediaMetadata = MediaMetaData.createFrom(data);
        this.#readMediaInfo(this.mediaMetadata.data);
        return this;
    }
    
    #readMediaInfo(metadata) {
        this.info = MediaInfo.createFrom(metadata, this.info);
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

    get metadata() { return this.data.metadata; }

    get participants() { return this.data.participants; }

    get tags() { return this.data.tags; }

    add(name, value) {

    }
    remove(name) {

    }
}