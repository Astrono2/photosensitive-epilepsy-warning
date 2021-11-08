// Manage native messaging
let ports = new Map();

// Handle messages
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		let port;
		switch(request.action){
			case 'get_native_port':
				port = chrome.runtime.connectNative('pew');
				let uid = Math.round(10000 * Math.random());
				while(ports.has(uid)) {
					uid = Math.round(10000 * Math.random());
				}
				ports.set(uid, port);
				port.onMessage.addListener(onNativeMessage.bind({
					uid: uid,
					tabId: sender.tab.id
				}));
				sendResponse(uid);
				break;
			case 'send_native_message':
				port = ports.get(request.uid);
				port.postMessage(request.message);
				break;
			case 'remove_native_port':
				port = ports.get(request.uid);
				port.disconnect();
				ports.delete(request.uid);
				break;
		}
	}
);

function onNativeMessage(message) {
	let uid = this.uid;
	let tabId = this.tabId;
	chrome.tabs.sendMessage(tabId, {action: 'pass_message', uid: uid, message: message});
}

// Disable action in pages that don't allow JavaScript injections
chrome.tabs.onUpdated.addListener(
	function(tabId, changeInfo, tab) {
		if (tab.url.startsWith('chrome://')) {
			chrome.browserAction.disable(tabId);
		}
	}
);

chrome.tabs.onActivated.addListener(
	function(activeInfo) {
		let id = activeInfo.tabId;
		chrome.tabs.get(id, function(tab) {
			if (tab.url.startsWith('chrome://')) {
				chrome.browserAction.disable(tab.id);
			}
		});
	}
);

// Set options on install
chrome.runtime.onInstalled.addListener(function() {
	fetch(chrome.runtime.getURL('Documents/Options/options.json'))
		.then(response => response.json())
		.then((json) => {
			chrome.storage.sync.set(json);
		});
});