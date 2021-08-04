chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case 'get_blocking_state':
				sendResponse({block: localStorage.getItem('blocking_state')});
				break;
			case 'set_blocking_state':
				localStorage.setItem('blocking_state', request.block);
				break;
		}
	}
);