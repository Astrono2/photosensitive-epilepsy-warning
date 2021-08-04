const injectBtn = document.getElementById('inject');
const blockAllSwitch = document.getElementById('block-all');
var tab;

// Get the blocking state for the tab
window.onload = async function() {
	tab = (await chrome.tabs.query({active: true, currentWindow: true}))[0];
	chrome.tabs.sendMessage(tab.id, {action: 'get_blocking_state'}, function(response) {
		if(response) {
			console.log(response.block);
			blockAllSwitch.nextElementSibling.classList.add('notransition');
			blockAllSwitch.checked = response.block === 'true' ? true : false;
			blockAllSwitch.offsetHeight;
			blockAllSwitch.nextElementSibling.classList.remove('notransition');
		}
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