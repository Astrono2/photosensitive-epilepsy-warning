document.getElementById('inject').onclick = async function() {
	var tab = (await chrome.tabs.query({active: true, currentWindow: true}))[0];
	chrome.runtime.sendMessage({action: 'open_selection_context', tabId: tab.id});
}

document.getElementById('inject').onkeydown = function(self) {
	if(self.key === "Enter") {
		self.target.style.backgroundColor = 'var(--primary-color-semi-dark)';
	}
}

document.getElementById('inject').onkeyup = function(self) {
	if(self.key === "Enter") {
		self.target.style.backgroundColor = '';
	}
}

document.getElementById('block-all').onkeypress = function(self) {
	if(self.key === "Enter") {
		self.target.checked = !self.target.checked;
	}
}