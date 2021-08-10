var mainContainer = document.body;
const svgns = "http://www.w3.org/2000/svg";

/* OBSERVERS */

var resizeObserver = new ResizeObserver(entries => {
	for(let entry of entries) {
		// If the main container was resized and the user is selecting, adjust the overlay and mask
		if(entry.target === mainContainer && isSelecting) {
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

		// Check what overlays it has and resize appropriately
		let video = entry.target;
		let parent = video.parentNode;
		let pewOverlay = parent.querySelector('.pew-video-overlay');
		let thumbnail = parent.querySelector('.pew-video-thumbnail');
		if(pewOverlay) {
			pewOverlay.style.width = video.scrollWidth + 'px';
			pewOverlay.style.height = video.scrollHeight + 'px';
		}
		if(thumbnail) {
			thumbnail.style.width = video.scrollWidth + 'px';
			thumbnail.style.height = video.scrollHeight + 'px';
		}

		// If we are selecting, resize mask cutout and clickable
		if(isSelecting) {
			let videoIdx = Array.from(videoElements).indexOf(video);
			let maskBlackRects = selectionOverlay.getElementById('black-cutouts');

			// Adjust mask rect
			let maskRect = maskBlackRects.children['video-elem-' + videoIdx];
			maskRect.setAttribute('x', video.getBoundingClientRect().x + window.scrollX);
			maskRect.setAttribute('y', video.getBoundingClientRect().y + window.scrollY);
			maskRect.setAttribute('width', video.scrollWidth);
			maskRect.setAttribute('height', video.scrollHeight);

			// Adjust clickable rect
			let videoButtonStyle = selectionClickables.children['video-elem-' + videoIdx].style;
			videoButtonStyle.left = video.getBoundingClientRect().x + window.scrollX + 'px';
			videoButtonStyle.top = video.getBoundingClientRect().y + window.scrollY + 'px';
			videoButtonStyle.width = video.scrollWidth + 'px';
			videoButtonStyle.height = video.scrollHeight + 'px';
		}
	}
});

var mutationObserver = new PewMutationObserver(mutations => {
	for(let mutation of mutations) {
		// If elements were added to the main container, check for new videos
		if(mutation.target === mainContainer && mutation.type === 'childList') {
			if(isSelecting) scanForVideos();
			if(isBlocking) blockVideos();
		}

		// This check is redundant but is here for readability
		if(mutation.type === 'attributes') {
			// If the mutation wasn't on the main container, it can only be on a video
			let video = mutation.target;
			// Check what overlays it has and adjust appropriately
			let parent = video.parentNode;
			let pewOverlay = parent.querySelector('.pew-video-overlay');
			let thumbnail = parent.querySelector('.pew-video-thumbnail');
			if(pewOverlay) {
				pewOverlay.style.top = video.style.top;
				pewOverlay.style.left = video.style.left;
			}
			if(thumbnail) {
				thumbnail.style.top = video.style.top;
				thumbnail.style.left = video.style.left;
			}
		}
	}
});

/* VIDEO SELECTION */

var selectionTopBar, selectionOverlay, selectionClickables;
var isSelecting = false;
var selectedVideos = [];
var videoElements = [];

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
			resizeObserver.unobserve(videoElements[i]);
			mutationObserver.unobserve(videoElements[i]);
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

		// Unobserve before observing to prevent duplicates
		resizeObserver.unobserve(newVideoElements[i]);
		// Observe the video for rect changes
		resizeObserver.observe(newVideoElements[i]);
		mutationObserver.observe(newVideoElements[i]);

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

	// Unobserve before observing to prevent duplicates
	resizeObserver.unobserve(mainContainer);

	// Observe mainContainer size changes
	resizeObserver.observe(mainContainer);

	// Observe mainContainer subtree changes
	mutationObserver.observe(mainContainer, {childList: true, subtree: true, attributes: true});

	mainContainer.appendChild(selectionOverlay);
	mainContainer.appendChild(selectionClickables);
}

function confirmSelection() {
	for (var i = 0; i < selectedVideos.length; i++) {
		// Add pete overlay to video
		let overlay = document.createElement('iframe');
		overlay.classList.add('pew-video-overlay');
		overlay.src = chrome.runtime.getURL('Documents/Overlay/overlay.html');
		
		selectedVideos[i].parentNode.appendChild(overlay);
	}
	endSelection();
}

function endSelection() {
	// Remove injected HTML
	mainContainer.removeChild(selectionTopBar);
	mainContainer.removeChild(selectionOverlay);
	mainContainer.removeChild(selectionClickables);

	// Unobserve the main container for size changes
	resizeObserver.unobserve(mainContainer);

	// Only unobserve for tree changes if blocking is disabled
	if(!isBlocking) mutationObserver.unobserve(mainContainer);

	isSelecting = false;

	// Clear video list
	videoElements = [];

	// Clear masks children
	selectionOverlay.getElementById('black-cutouts').textContent = '';

	// Clear selected videos
	selectedVideos = [];

	// Clear selection clickables
	selectionClickables.textContent = '';
}

/* VIDEO BLOCKING */

var isBlocking = false;

function captureVideoPoster(video) {
	let canvas = document.createElement('canvas');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	let canvasCtx = canvas.getContext('2d');
	canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
	return canvas.toDataURL('image/jpg', 0.5);
}

function blockVideos() {
	for(let video of document.getElementsByTagName('video')) {
		// Check if video is being analyzed
		if(video.parentNode.querySelector('.pew-video-overlay')) continue;

		// Get thumbnail from parent
		let thumbnail = video.parentNode.querySelector('.pew-video-thumbnail');

		// If thumbnail doesn't exist, create it
		if(!thumbnail) {
			thumbnail = document.createElement('div');
			thumbnail.classList.add('pew-video-thumbnail');
			video.parentNode.appendChild(thumbnail);
			// Set video blocked text
			let span = document.createElement('span');
			span.innerHTML = 'This video has been blocked by PEW<br>' +
							'Disable video blocking or analyze the video to unblock it.';
			thumbnail.appendChild(span);
		}

		if(video.poster !== '') {
			// If video has a default thumnail, use that
			thumbnail.style.backgroundImage = 'url(' + video.poster + ')';
		} else if(video.readyState !== 0) {
			// Otherwise, if the video has already loaded, use a screenshot
			thumbnail.style.backgroundImage = 'url(' + captureVideoPoster(video) + ')';
		} else {
			// If the video hasn't loaded, listen to the loadeddata event
			video.onloadeddata = (self) => {
				let thumbnail = self.target.parentNode.querySelector('.pew-video-thumbnail');
				thumbnail.style.backgroundImage = 'url(' + captureVideoPoster(self.target) + ')';
				// Pause and mute video
				video.muted = true;
				video.pause();
			}
		}

		// Unobserve before observing to prevent duplicates
		resizeObserver.unobserve(video);

		resizeObserver.observe(video);
		mutationObserver.observe(video, {childList: false, attributes: true});

		// Pause and mute video
		video.muted = true;
		video.pause();
	}

	// Observe mainContainer for new videos
	mutationObserver.observe(mainContainer, {childList: true, subtree: true, attributes: true});
}

function unblockVideos() {
	for(let thumbnail of document.getElementsByClassName('pew-video-thumbnail')) {
		thumbnail.parentNode.removeChild(thumbnail);
	}
	// Only unobserve mainContainer for new videos if not selecting
	if(!isSelecting) mutationObserver.unobserve(mainContainer);
}

/* GENERAL STUFF */

// Inject stylesheets
let contentCssLink = document.createElement('link');
contentCssLink.rel = 'stylesheet';
contentCssLink.type = 'text/css';
contentCssLink.href = chrome.runtime.getURL('Documents/Inject/content.css');
document.head.insertBefore(contentCssLink, document.head.firstChild);

let masterCssLink = document.createElement('link');
masterCssLink.rel = 'stylesheet';
masterCssLink.type = 'text/css';
masterCssLink.href = chrome.runtime.getURL('master.css');
document.head.insertBefore(masterCssLink, document.head.firstChild);

// Setup message listener
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case 'get_blocking_state':
				sendResponse({block: isBlocking});
				break;
			case 'set_blocking_state':
				localStorage.setItem('blocking_state', request.block);
				isBlocking = request.block;
				if(request.block) {
					blockVideos();
				} else {
					unblockVideos();
				}
				break;
			case 'open_selection_context':
				setupSelection();
				break;
		}
	}
);

// Check for edge cases
// Youtube places all of its stuff not inside body, but inside "ytd-app" for some god forsaken reason
if(document.location.hostname === "www.youtube.com") {
	mainContainer = document.getElementsByTagName('ytd-app')[0];
}

// On document load, notify of the blocking state
window.onload = function() {
	isBlocking = localStorage.getItem('blocking_state');
	chrome.runtime.sendMessage({action: 'set_blocking_state', block: isBlocking});
	if(isBlocking) {
		blockVideos();
	}
}