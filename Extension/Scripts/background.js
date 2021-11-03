// Handle messages
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action){

		}
	}
);

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