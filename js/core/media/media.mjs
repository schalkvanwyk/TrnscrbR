class MediaItem {
    loadFromStream() {

        return this;
    }
    readMediaInfo() {
        this.mediaInfo = new MediaInfo();
        return this;
    }
}

class MediaInfo {

}

class MediaMetaData {
    constructor(existing){
        this._existing = existing;
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