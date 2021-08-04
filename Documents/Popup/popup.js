document.getElementById('inject').onclick = async function() {
	var tab = (await chrome.tabs.query({active: true, currentWindow: true}))[0];
	chrome.runtime.sendMessage({action: 'open_selection_context', tabId: tab.id});
}

