export class MediaItem {
    #mediaProvider;
    #metaDataProvider;

    constructor(mediaProvider, metaDataProvider) {
        this.#mediaProvider = mediaProvider;
        this.#metaDataProvider = metaDataProvider;
    }

    static createUsing(source, targetPlayerLoader, mediaProvider, metaDataProvider) {
        if(!source) throw new Error('Argument Required! The argument "source" is required.');

        return new MediaItem(mediaProvider, metaDataProvider)
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
    #loadMetaData() {
        let data = this.#metaDataProvider();
        this.metaData = MediaMetaData.createFrom(data);
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
            result = result;//.Merge(source);
        }
        return result;
    }
}

class MediaMetaData {
    constructor(existing){
        this.data = existing || [];
    }

    static createFrom(existing)
    {
        return new MediaMetaData(existing);
    }

    add(name, value) {

    }
    remove(name) {

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