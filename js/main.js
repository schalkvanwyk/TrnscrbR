//https://javascript.plainenglish.io/create-your-first-web-component-using-vanilla-javascript-82a50cc742b0
//https://javascript.plainenglish.io/the-javascript-ecosystem-blog-1-vanilla-web-components-7d6960f34ff9
class MyComponent extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click',
        () => {
            this.style.color === 'red'
            ? this.style.color = 'blue':
            this.style.color = 'red';
        });
    }

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
        this.attachShadow({ mode: 'open' });         
        this.shadowRoot.appendChild(clone); 
    }
}

customElements.define('my-component', MyComponent)

