var selectionTopBar, selectionOverlay, selectionClickables;
var contentCssLink, masterCssLink;
var videoElements = [];
var scanInterval;
var mainContainer = document.body;
var isSelecting = false;
var selectedVideos = [];
const svgns = "http://www.w3.org/2000/svg";



// Check for edge cases
// Youtube places all of its stuff not inside body, but inside "ytd-app" for some god forsaken reason
if(document.location.hostname === "www.youtube.com") {
	mainContainer = document.getElementsByTagName('ytd-app')[0];
}

// Create resize observers
var videoOverlayResizeObserver = new ResizeObserver(entries => {
	for(let entry of entries) {
		let parent = entry.target.parentNode;
		let pewOverlay = parent.querySelector('.pew-video-overlay');
		console.assert(pewOverlay, {videoElement: entry.target, error: 'Parent doesn\'t have PEW overlay.'});

		pewOverlay.style.width = entry.contentRect.width + 'px';
		pewOverlay.style.height = entry.contentRect.height + 'px';
	}
});

var videoSelectingResizeObserver = new ResizeObserver(entries => {
	let maskBlackRects = selectionOverlay.getElementById('black-cutouts');
	for(let entry of entries) {
		// If the main container was resized, adjust the overlay and mask
		if(entry.target === mainContainer) {
			let width = mainContainer.scrollWidth;
			let height = mainContainer.scrollHeight;
			let mask = selectionOverlay.getElementById('darken-mask');

			selectionOverlay.setAttribute('width', width);
			selectionOverlay.setAttribute('height', height);
			selectionOverlay.setAttribute('style',
				'min-width: ' + width + 'px; ' +
				'min-height: ' + height + 'px;');

			selectionOverlay.getElementById('darken-rect').setAttribute('width', width);
			selectionOverlay.getElementById('darken-rect').setAttribute('height', height);
			mask.children['white-fill'].setAttribute('width', width);
			mask.children['white-fill'].setAttribute('height', height);
			continue;
		}

		// Otherwise, adjust the mask cutouts
		let video = entry.target;
		let videoIdx = Array.from(videoElements).indexOf(video);

		// Adjust mask rect
		let maskRect = maskBlackRects.children['video-elem-' + videoIdx];
		maskRect.setAttribute('x', entry.target.getBoundingClientRect().x + window.scrollX);
		maskRect.setAttribute('y', entry.target.getBoundingClientRect().y + window.scrollY);
		maskRect.setAttribute('width', video.scrollWidth);
		maskRect.setAttribute('height', video.scrollHeight);

		// Adjust clickable rect
		let videoButtonStyle = selectionClickables.children['video-elem-' + videoIdx].style;
		videoButtonStyle.left = entry.target.getBoundingClientRect().x + window.scrollX + 'px';
		videoButtonStyle.top = entry.target.getBoundingClientRect().y + window.scrollY + 'px';
		videoButtonStyle.width = video.scrollWidth + 'px';
		videoButtonStyle.height = video.scrollHeight + 'px';
	}
});

// Get video elements and update the mask and clickables
function scanForVideos() {
	// Clear mask's black cutouts
	var maskBlackRects = selectionOverlay.getElementById('black-cutouts');

	// Loop through videos and get their rects
	let newVideoElements = mainContainer.getElementsByTagName('video');
	for (let i = 0; i < newVideoElements.length; i++) {
		// Ignore videos that are being analized
		if(newVideoElements[i].parentNode.querySelector('.pew-video-overlay')) {
			continue;
		}

		if(videoElements[i] === newVideoElements[i]) {
			continue;
		} else if(i < videoElements.length) {
			let orphanVidRect = selectionOverlay.getElementById('video-elem-' + i);
			maskBlackRects.removeChild(orphanVidRect);
			let orphanVidButton = selectionClickables.getElementById('video-elem' + i);
			selectionClickables.removeChild(orphanVidButton);
			videoSelectingResizeObserver.unobserve(videoElements[i]);
		}

		// Create cutout rects for the overlay
		let vidRect = document.createElementNS(svgns, 'rect');
		vidRect.setAttribute('id', 'video-elem-' + i);
		vidRect.setAttribute('fill', 'black');
		maskBlackRects.appendChild(vidRect);

		// Create clickables
		let vidButton = document.createElement('button');
		vidButton.setAttribute('id', 'video-elem-' + i);
		if(selectedVideos.includes(newVideoElements[i])) {
			vidButton.classList.add('pew-video-selected');
		}
		vidButton.onclick = function(self) {
			var videoIdx = parseInt(self.target.id.replace('video-elem-', ''));
			var videoSelectedIdx = selectedVideos.indexOf(newVideoElements[videoIdx]);
			// If videoSelected Idx is -1, then selectedVideos does not contain the video
			if(videoSelectedIdx != -1) {
				selectedVideos.splice(videoSelectedIdx, 1);
				self.target.classList = [];
			} else {
				selectedVideos.push(newVideoElements[videoIdx]);
				self.target.classList.add('pew-video-selected');
			}
		}
		selectionClickables.appendChild(vidButton);

		// Observe the video for resize changes
		videoSelectingResizeObserver.unobserve(newVideoElements[i]);
		videoSelectingResizeObserver.observe(newVideoElements[i]);
		videoElements[i] = newVideoElements[i];
	}
}

function setupSelection() {
	if(isSelecting) return;
	isSelecting = true;

	// Add top confirm/cancel bar
	if(!selectionTopBar) {
		selectionTopBar = document.createElement('div');
		selectionTopBar.classList.add('pew-selection-top');

		// Add confirm and cancel buttons
		let confirmButton = document.createElement('button');
		confirmButton.innerHTML = 'Confirm';
		confirmButton.onclick = confirmSelection;
		selectionTopBar.appendChild(confirmButton);

		let cancelButton = document.createElement('button');
		cancelButton.innerHTML = 'Cancel';
		cancelButton.onclick = endSelection;
		selectionTopBar.appendChild(cancelButton);
	}
	mainContainer.appendChild(selectionTopBar);	

	// Add stylesheets
	let head = document.head;
	if(!contentCssLink) {
		contentCssLink = document.createElement('link');
		contentCssLink.rel = 'stylesheet';
		contentCssLink.type = 'text/css';
		contentCssLink.href = chrome.runtime.getURL('Documents/Inject/content.css');
	}
	head.insertBefore(contentCssLink, head.firstChild);

	if(!masterCssLink) {
		masterCssLink = document.createElement('link');
		masterCssLink.rel = 'stylesheet';
		masterCssLink.type = 'text/css';
		masterCssLink.href = chrome.runtime.getURL('master.css');
	}
	head.insertBefore(masterCssLink, head.firstChild);

	// Add dark overlay
	if(!selectionOverlay) {
		selectionOverlay = document.createElementNS(svgns, 'svg');
		selectionOverlay.classList.add('pew-selection-darken');

		// Add rect
		let rect = document.createElementNS(svgns, 'rect');
		rect.setAttribute('id', 'darken-rect');
		rect.setAttribute('fill', '#00000088'); // TEMPORARY!!!
		selectionOverlay.appendChild(rect);

		// Add mask
		let mask = document.createElementNS(svgns, 'mask');
		mask.setAttribute('id', 'darken-mask');
		selectionOverlay.insertBefore(mask, rect);
		rect.setAttribute('mask', 'url(#darken-mask)');

		// Fill mask with white
		let whiteRect = document.createElementNS(svgns, 'rect');
		whiteRect.setAttribute('id', 'white-fill');
		whiteRect.setAttribute('fill', 'white');
		mask.appendChild(whiteRect);

		// Add group for black rects
		let blackRectsGroup = document.createElementNS(svgns, 'g');
		blackRectsGroup.setAttribute('id', 'black-cutouts');
		mask.appendChild(blackRectsGroup);
	}

	// Add clickable inputs
	if(!selectionClickables) {
		selectionClickables = document.createElement('div');
		selectionClickables.classList.add('pew-selection-clickables');
	}

	scanForVideos();

	// Rescan every second for dynamically loaded videos
	scanInterval = setInterval(scanForVideos, 1000);

	// Observe mainContainer size changes
	videoSelectingResizeObserver.observe(mainContainer);

	mainContainer.appendChild(selectionOverlay);
	mainContainer.appendChild(selectionClickables);
}

function confirmSelection() {
	for (var i = 0; i < selectedVideos.length; i++) {
		// Add pete overlay to video
		let overlay = document.createElement('iframe');
		overlay.classList.add('pew-video-overlay');
		overlay.src = chrome.runtime.getURL('Documents/Overlay/overlay.html');
		
		videoOverlayResizeObserver.observe(selectedVideos[i]);
		selectedVideos[i].parentNode.appendChild(overlay);
	}
	endSelection();
}

function endSelection() {
	// Remove injected HTML
	mainContainer.removeChild(selectionTopBar);
	mainContainer.removeChild(selectionOverlay);
	mainContainer.removeChild(selectionClickables);

	// Unobserve resize for videos
	videoSelectingResizeObserver.disconnect();

	isSelecting = false;

	// Clear video list
	videoElements = [];

	// Stop scanning for videos
	clearInterval(scanInterval);
	scanInterval = null;

	// Clear masks children
	selectionOverlay.getElementById('black-cutouts').textContent = '';

	// Clear selected videos
	selectedVideos = [];

	// Clear selection clickables
	selectionClickables.textContent = '';
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case 'get_blocking_state':
				sendResponse({block: localStorage.getItem('blocking_state')});
				break;
			case 'set_blocking_state':
				localStorage.setItem('blocking_state', request.block);
				break;
			case 'open_selection_context':
				setupSelection();
		}
	}
);