export class HtmlElementWrapper {
    constructor(element, text, display = true) {
        this.element = document.createElement(element);
        if(text) this.element.innerHTML = text;
        this.display = !display;
        this.toggleDisplay();
    }
    
    click(val) {
        this.element.addEventListener('click', () => val());
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
    
    appendChild(child) {
        this.element.appendChild(child.element);
        return this;
    }
    
    createChild(element, text, display = true) {
        var wrapper = new HtmlElementWrapper(element, text, display);
        this.appendChild(wrapper);
        return this;
    }
    
    static generate(element, text, display = true) {
        return new HtmlElementWrapper(element, text, display);
    }
}