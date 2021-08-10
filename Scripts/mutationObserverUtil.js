class PewMutationObserver {
	callback;
	observers = {};

	constructor(callback) {
		if(typeof callback != 'function') {
			console.error('Parameter to pewMutationObserver constructor must be a function');
		}
		if(callback.length !== 1) {
			console.error('Parameter to pewMutationObserver constructor must take one argument')
		}
		this.callback = callback;
	}

	observe(node, options) {
		if(this.observers[node]) return;
		this.observers[node] = new MutationObserver(this.callback);
		this.observers[node].observe(node, options);
	}

	unobserve(node) {
		this.observers[node].disconnect();
		this.observers[node] = undefined;
	}

	disconnect() {
		for(let key in observers) {
			this.observers[key].disconnect();
		}
		this.observers = {};
	}
}