class MediaProvider {
    loadBlobTo(source, target){}
}

//TODO: To load blob look at https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await#rewriting_promise_code_with_asyncawait
export class MediaFileBlobProvider extends MediaProvider {
    loadBlobTo(source, targetLoader, mediaInfoBuilder) {
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

        return mediaInfoBuilder({ 
            blobName: source.name, 
            blobSize: source.size, 
            lastModifiedDate: source.lastModifiedDate, 
            mimeType: source.type
        } ); 
    }
}