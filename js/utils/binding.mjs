//https://blog.jeremylikness.com/blog/client-side-javascript-databinding-without-a-framework/

//https://www.wintellect.com/data-binding-pure-javascript/
//http://www.binaryintellect.net/articles/e86f1949-dad7-434f-b086-387b9f0c4f7b.aspx
export function Binding(b) {
    this.elementBindings = []
    this.value = b.object[b.property]
    this.valueGetter = function(){
        return this.value;
    }.bind(this);
    this.valueSetter = function(val){
        this.value = val
        for (var i = 0; i < this.elementBindings.length; i++) {
            var binding = this.elementBindings[i]
            binding.element[binding.attribute] = val
        }
    }.bind(this);
    this.addBinding = function(element, attribute, event){
        var binding = {
            element: element,
            attribute: attribute
        }
        if (event){
            element.addEventListener(event, function(event){
                this.valueSetter(element[attribute]);
            }.bind(this))
            binding.event = event
        }       
        this.elementBindings.push(binding)
        element[attribute] = this.value
        return this
    }.bind(this);

    Object.defineProperty(b.object, b.property, {
        get: this.valueGetter,
        set: this.valueSetter
    }); 

    b.object[b.property] = this.value;
}

//https://www.wintellect.com/how-to-implement-the-observer-pattern-with-objects-and-arrays-in-pure-javascript/
export function Observer(o, property) {
    var value = o[property];
    this.observers = [];
    
    this.Observe = function (notifyCallback){
        this.observers.push(notifyCallback);
    }.bind(this);

    Object.defineProperty(o, property, {
        set: function(val){
            this.value = val;
            for(var i = 0; i < this.observers.length; i++) this.observers[i](val);
        }.bind(this),
        get: function(){
            return this.value;
        }.bind(this)
    });
}
export function ArrayObserver(a) {
    this.array = a;   
    this.observers = [];

    this.Observe = function (notifyCallback){
        this.observers.push(notifyCallback);
    }.bind(this);

    a.push = function(obj){
        var push = Array.prototype.push.apply(a, arguments);        
        for(var i = 0; i < this.observers.length; i++) this.observers[i](obj, "push");
        return push;
    }.bind(this);

    a.pop = function(){
        var popped = Array.prototype.pop.apply(a, arguments);        
        for(var i = 0; i < this.observers.length; i++) this.observers[i](popped, "pop");
        return popped;
    }.bind(this);

    a.reverse = function() {
        var result = Array.prototype.reverse.apply(a, arguments);
        for(var i = 0; i < this.observers.length; i++) this.observers[i](result, "reverse");
        return result;
    }.bind(this);

    a.shift = function() {
        var deleted_item = Array.prototype.shift.apply(a, arguments);
        for(var i = 0; i < this.observers.length; i++) this.observers[i](deleted_item, "shift");
        return deleted_item;                        
    }.bind(this);

    a.sort = function() {
        var result = Array.prototype.sort.apply(a, arguments);
        for(var i = 0; i < this.observers.length; i++) this.observers[i](result, "sort");
        return result;
    }.bind(this);

    a.splice = function(i, length, itemsToInsert) {
        var returnObj
        if(itemsToInsert){
            Array.prototype.slice.call(arguments, 2);
            returnObj = itemsToInsert;
        }
        else{
            returnObj = Array.prototype.splice.apply(a, arguments);
        }
        for(var i = 0; i < this.observers.length; i++) this.observers[i](returnObj, "splice");
        return returnObj;
    }.bind(this);

    a.unshift = function() {
        var new_length = Array.prototype.unshift.apply(a, arguments);
        for(var i = 0; i < this.observers.length; i++) this.observers[i](new_length, "unshift");
        return arguments;
    }.bind(this);
                
}
export function MapObserver(m) {
    this.map = m;
    this.observers = [];

    this.Observe = function (notifyCallback){
        this.observers.push(notifyCallback);
    }.bind(this)

    m.set = function(obj){
        var set = Map.prototype.set.apply(m, arguments);        
        for(var i = 0; i < this.observers.length; i++) this.observers[i](obj, "set");
        return set;
    }.bind(this)

    m.clear = function(obj){
        var clear = Map.prototype.clear.apply(m);        
        for(var i = 0; i < this.observers.length; i++) this.observers[i](obj, "clear");
        return clear;
    }.bind(this);
}

//https://netbasal.com/javascript-observables-under-the-hood-2423f760584
/*
class Observable {

    constructor(functionThatThrowsValues) {
        this._functionThatThrowsValues = functionThatThrowsValues;
    }

    subscribe(next, error, complete) {   
        if (typeof next === "function") {   
            return this._functionThatThrowsValues({
                next,
                error: error || () => {},
                complete: complete || () => {}
            });
        } else {
            return this._functionThatThrowsValues(next);
        }
    }

    map(projectionFunction) { 
        return new Observable(observer => {
            return this.subscribe({
                next(val) { observer.next(projectionFunction(val)) },
                error(e) { observer.error(e) } ,
                complete() { observer.complete() } 
            });
        });
    }
    
    mergeMap(anotherFunctionThatThrowsValues) {
        return new Observable(observer => {
            return this.subscribe({
                next(val) {    
                    anotherFunctionThatThrowsValues(val).subscribe({
                        next(val) {observer.next(val)},
                        error(e) { observer.error(e) } ,
                        complete() { observer.complete() } 
                    });
                },
                error(e) { observer.error(e) } ,
                complete() { observer.complete() } 
            });
        });
    }
    
    static fromArray(array) {
        return new Observable(observer => {
            array.forEach(val => observer.next(val));
            observer.complete();
        });
    }

    static fromEvent(element, event) {
        return new Observable(observer => {
            const handler = (e) => observer.next(e);
            element.addEventListener(event, handler); 
            return () => {
                element.removeEventListener(event, handler);
            };
        });
    }
    
    static fromPromise(promise) {
        return new Observable(observer => {
            promise.then(val => {
                observer.next(val); observer.complete();
            })
            .catch(e => {
                observer.error(val); observer.complete();
            });
        })
    }
}
*/
