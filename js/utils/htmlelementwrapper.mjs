export class HtmlElementWrapper {
    constructor(element, text, display = true) {
        this.element = document.createElement(element);
        if(text) this.element.innerHTML = text;
        this.display = !display;
        this.toggleDisplay();
    }
    
    click(handler) {
        this.element.addEventListener('click', handler);
        return this;
    }
    
    showSelectable() {
        this.element.style.cursor = 'pointer';
        return this;
    }
    
    addClass(className) {
        this.element.classList.add(className);
        return this;
    }
    
    toggleDisplay() {
        this.display = !this.display;
        this.element.style.display = this.display ? '' : 'none';
        return this;
    }

    setAttribute = (attributeName) => (value) => {
        this.element.setAttribute(attributeName, value)
        return this;
    };
    
    appendChild(child) {
        this.element.appendChild(child.element);
        return this;
    }
    
    createChild(element, text, display = true) {
        this.createChildAndUse(element, text, display);
        return this;
    }

    createChildAndUse(element, text, display = true) {
        var wrapper = new HtmlElementWrapper(element, text, display);
        this.appendChild(wrapper);
        return wrapper;
    }
    
    static generate(element, text, display = true, parentNode) {
        let result = new HtmlElementWrapper(element, text, display);

        if(parentNode) parentNode.appendChild(result.element);
        
        return result;
    }
}