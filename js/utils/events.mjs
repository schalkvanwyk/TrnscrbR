const EVENT_DISPLAY_ERROR_MESSAGE = "display-errormessage";
// const EVENT_DELETE_TODO = "delete-todo";

export function dispatchDisplayErrorMessage(message) {
    window.dispatchEvent(
        new CustomEvent(EVENT_DISPLAY_ERROR_MESSAGE, {
            detail: message,
        })
    );
}

export function listenForDisplayErrorMessage(fn) {
    window.addEventListener(EVENT_DISPLAY_ERROR_MESSAGE, fn);
}

export function removeDisplayErrorMessageListener(fn) {
    window.removeEventListener(EVENT_DISPLAY_ERROR_MESSAGE, fn);
}

/*
export function dispatchDeleteTodo(id) {
    window.dispatchEvent(
        new CustomEvent(EVENT_DELETE_TODO, {
            detail: id,
        })
    );
}

export function listenForDeleteTodo(fn) {
    window.addEventListener(EVENT_DELETE_TODO, fn);
}

export function removeDeleteTodoListener(fn) {
    window.removeEventListener(EVENT_DELETE_TODO, fn);
}
*/