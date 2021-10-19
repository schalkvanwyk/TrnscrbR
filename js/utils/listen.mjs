//https://sebastiandedeyne.com/javascript-framework-diet/event-delegation/
export function listen(type, selector, callback) {
    document.addEventListener(type, event => {
      const target = event.target.closest(selector);
  
      if (target) {
        callback(event, target);
      }
    });
  }