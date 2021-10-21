//See https://www.npmjs.com/package/core-decorators & https://javascript.info/call-apply-decorators
function readonly(target, name, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

function log(name) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            descriptor.value = function (...args) {
                console.log(`Arguments for ${name}: ${args}`);
                try {
                    const result = original.apply(this, args);
                    console.log(`Result from ${name}: ${result}`);
                    return result;
                } catch (e) {
                    console.log(`Error from ${name}: ${e}`);
                    throw e;
                }
            }
        }
        return descriptor;
    };
}

//decorator log on class
function log(Class) {
    return (...args) => {
        console.log(args);
        return new Class(...args);
    };
}

//https://javascript.plainenglish.io/create-your-first-web-component-using-vanilla-javascript-82a50cc742b0
//https://javascript.plainenglish.io/the-javascript-ecosystem-blog-1-vanilla-web-components-7d6960f34ff9
// @log
class MyComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.addEventListener('click',
            () => {
                this.style.color === 'red'
                    ? this.style.color = 'blue' :
                    this.style.color = 'red';
            });
    }

    // @log
    connectedCallback() {
        console.log('My Component is connected');

        this.style.color = 'blue';
        const template =
            document.
                querySelector('template');

        const clone =
            document.
                importNode(template.content,
                    true);

        // this.appendChild(clone);
        this.shadowRoot.appendChild(clone);
    }


    // @readonly
    a() { }
}

customElements.define('my-component', MyComponent)