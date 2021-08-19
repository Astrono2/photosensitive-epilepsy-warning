var mainContainer = document.body;
const svgns = "http://www.w3.org/2000/svg";

var PewVideo;
import(chrome.runtime.getURL('/Scripts/pewVideo.js')).then(obj => {
	PewVideo = obj.PewVideo;
});

/* VIDEO ANALYSIS */

var analysisOverlays;

var videoAnalysisResizeObserver = new ResizeObserver((entries, observer) => {
	for(let entry of entries) {
		let video = entry.target;
		let pewVideo = pewVideos.get(video);
		let [width, height] = [video.scrollWidth, video.scrollHeight];
		let boundingRect = video.getBoundingClientRect();
		let [x, y] = [boundingRect.x + scrollX, boundingRect.y + scrollY];

		// If we observe a size change in a video with no overlay, stop observing it.
		if(!pewVideo.isOverlayed) {
			observer.unobserve(video);
			continue;
		}
		pewVideo.analysisOverlay.style.width = width + 'px';
		pewVideo.analysisOverlay.style.height = height + 'px';
		pewVideo.analysisOverlay.style.left = x + 'px';
		pewVideo.analysisOverlay.style.top = y + 'px';
	}
});

function videoAnalysisCancel(event) {
	let analysisOverlay = event.target.parentNode;
	if(confirm('Are you sure you want to cancel the video analysis?')) {
		analysisOverlay.parentNode.removeChild(analysisOverlay);
	}
}

/* VIDEO DETECTION */

// Associate videos with PewVideo objects
var pewVideos = new Map();

function scanForVideos() {
	let videoElements = mainContainer.getElementsByTagName('video');
	for(let video of videoElements) {
		if(pewVideos.has(video)) continue;

		pewVideos.set(video, new PewVideo(video));
	}
}

/* VIDEO SELECTION */

var selectionTopBar, selectionOverlay, selectionClickables;
var isSelecting = false;

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

		// Otherwise, adjust the mask cutout and clickable
		let video = entry.target;
		let pewVideo = pewVideos.get(video);
		let [width, height] = [video.scrollWidth, video.scrollHeight];
		let boundingRect = video.getBoundingClientRect();
		let [x, y] = [boundingRect.x + scrollX, boundingRect.y + scrollY];

		pewVideo.selectionOverlayCutout.setAttribute('width', width);
		pewVideo.selectionOverlayCutout.setAttribute('height', height);
		pewVideo.selectionOverlayCutout.setAttribute('x', x);
		pewVideo.selectionOverlayCutout.setAttribute('y', y);

		pewVideo.selectionClickable.style.width = width + 'px';
		pewVideo.selectionClickable.style.height = height + 'px';
		pewVideo.selectionClickable.style.left = x + 'px';
		pewVideo.selectionClickable.style.top = y + 'px';
	}
});

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

	// Add clickables container
	if(!selectionClickables) {
		selectionClickables = document.createElement('div');
		selectionClickables.classList.add('pew-selection-clickables');
	}

	for(let [video, pewVideo] of pewVideos) {
		if(pewVideo.isOverlayed) continue;
		// Observe video for size changes
		videoSelectingResizeObserver.observe(video);
		// Add black cutout to the mask
		selectionOverlay.getElementById('black-cutouts').appendChild(pewVideo.selectionOverlayCutout);
		// Add clickable to the clickables container
		selectionClickables.appendChild(pewVideo.selectionClickable);
	}

	mainContainer.appendChild(selectionOverlay);
	mainContainer.appendChild(selectionClickables);

	videoSelectingResizeObserver.observe(mainContainer);
}

function confirmSelection() {
	if(!analysisOverlays) {
		analysisOverlays = document.createElement('div');
		analysisOverlays.classList.add('pew-analysis-overlays');
		mainContainer.appendChild(analysisOverlays);
	}
	for(let [video, pewVideo] of pewVideos) {
		if(pewVideo.selected) {
			analysisOverlays.appendChild(pewVideo.analysisOverlay);
			videoAnalysisResizeObserver.observe(video);
			pewVideo.overlayCancelButton.onclick = videoAnalysisCancel;
		}
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

	// Clear masks children
	selectionOverlay.getElementById('black-cutouts').textContent = '';

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

}

function unblockVideos() {

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
				chrome.runtime.sendMessage({action: 'set_blocking_state', block: isBlocking});
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

// On document load, notify of the blocking state and scan for videos
window.onload = function() {
	// Notify popup of the blocking state
	isBlocking = localStorage.getItem('blocking_state') === 'true';
	chrome.runtime.sendMessage({action: 'set_blocking_state', block: isBlocking});
	if(isBlocking) {
		blockVideos();
	}
	// Scan for videos
	scanForVideos();
}