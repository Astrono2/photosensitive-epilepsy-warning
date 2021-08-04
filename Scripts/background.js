importScripts('Scripts/content.js');

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.action){
    	case 'open_selection_context':
	    	chrome.scripting.executeScript({
				target: { tabId: request.tabId },
				function: injection_start
			});
			break;
    }
  }
);
