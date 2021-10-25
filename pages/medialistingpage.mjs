export const renderInto = async (container) => {
    await fetch('/medialisting.htm')
        .then(stream => stream.text())
        .then(template => {
            let fragment = new DOMParser().parseFromString(template, 'text/html'); //, { includeShadowRoot: true }
            let elementNode = fragment.querySelector('rxs-page-medialistingpage');
            let element = document.importNode(elementNode, true);
            container.appendChild(element);
        });
}