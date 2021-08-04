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
			chrome.action.disable(tabId);
		}
	}
);