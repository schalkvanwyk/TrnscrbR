export function $Id(idSelector, scope = document) {
    return scope.getElementById(idSelector);
}

//https://sebastiandedeyne.com/javascript-framework-diet/selecting-elements-part-1/
export function $(selector, scope = document) {
    return scope.querySelector(selector);
}

export function $$(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

//https://sebastiandedeyne.com/javascript-framework-diet/selecting-elements-part-2/
//Element.closest() and Element.matches()