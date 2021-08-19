const injectBtn = document.getElementById('inject');
const blockAllSwitch = document.getElementById('block-all');
var tab;

// Get the blocking state for the tab
window.onload = function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		tab = tabs[0];
		if(tab.status !== 'complete') return;
		chrome.tabs.sendMessage(tab.id, {action: 'get_blocking_state'});
	});
}

injectBtn.onclick = async function() {
	chrome.tabs.sendMessage(tab.id, {action: 'open_selection_context'});
}

injectBtn.onmouseup = function() {
	window.close();
}

injectBtn.onkeydown = function(self) {
	if(self.key === "Enter") {
		self.target.style.backgroundColor = 'var(--primary-color-semi-dark)';
	}
}

injectBtn.onkeyup = function(self) {
	if(self.key === "Enter") {
		self.target.style.backgroundColor = '';
		window.close();
	}
}

/* ---------------------------------------------------------------- */

blockAllSwitch.onkeypress = function(self) {
	if(self.key === "Enter") {
		self.target.checked = !self.target.checked;
		self.target.onclick();
	}
}

blockAllSwitch.onclick = function(self) {
	chrome.tabs.sendMessage(tab.id, {action: 'set_blocking_state', block: self.target.checked});
}

/* ---------------------------------------------------------------- */

chrome.runtime.onMessage.addListener(
	function(request, sender, response) {
		console.log(request);
		switch(request.action) {
			case 'set_blocking_state':
				blockAllSwitch.nextElementSibling.classList.add('notransition');
				blockAllSwitch.checked = request.block;
				blockAllSwitch.offsetHeight;
				blockAllSwitch.nextElementSibling.classList.remove('notransition');
				break;
		}
	}
);