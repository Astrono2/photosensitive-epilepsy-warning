export class PewVideo {
	video; // Reference to the associated video

	selectionOverlayCutout; // Rect
	selectionClickable; // Label
	blockingOverlay; // Div
	analysisOverlay; // Div

	analysisWorker; // Worker
	analysisCanvas; // Canvas

	isCrossOrigin; // Boolean

	mutationObserver; // MutationObserver

	contentRemoveOverlay; // Method

	constructor(video) {
		this.video = video;

		this.isCrossOrigin = PewVideo.checkCrossOrigin(video);
		// Make canvas
		this.analysisCanvas = document.createElement('canvas');
		this.analysisCanvas.width = video.videoWidth;
		this.analysisCanvas.height = video.videoHeight;

		this.makeOverlays();
	}

	static checkCrossOrigin(video) {
		let videoUrl = new URL(video.src);
		let docUrl = new URL(document.URL);
		// Videos with file:// origin count as cross origin
		let isCrossOrigin = videoUrl.origin !== docUrl.origin || videoUrl.origin === 'file://';
		if(isCrossOrigin) {
			console.warn('Video element is cross origin. PEW cannot analyze this video.\n%o\n(file:// always counts as cross origin)', {
				video: video,
				src: video.src,
				srcOrigin: videoUrl.origin,
				currentOrigin: docUrl.origin
			});
		}
		return isCrossOrigin;
	}

	makeOverlays() {
		// Create cutout rect for the selection overlay
		this.selectionOverlayCutout = document.createElementNS(svgns, 'rect');
		this.selectionOverlayCutout.setAttribute('fill', 'black');

		// Create clickable for selection
		this.selectionClickable = document.createElement('label');
		let selectionClickableCheckBox = document.createElement('input');
		selectionClickableCheckBox.type = 'checkbox';
		let selectionClickableSpan = document.createElement('span');
		this.selectionClickable.appendChild(selectionClickableCheckBox);
		this.selectionClickable.appendChild(selectionClickableSpan);

		// Create blocking overlay
		this.blockingOverlay = document.createElement('div');
		this.blockingOverlay.classList.add('pew-video-thumbnail');
		// Set video blocked text
		let span = document.createElement('span');
		span.innerHTML = 'This video has been blocked by PEW<br>' +
						'Disable video blocking or analyze the video to unblock it.';
		this.blockingOverlay.appendChild(span);
		if(!this.isCrossOrigin) {
			// Capture poster image
		}

		// Create analysis overlay
		this.analysisOverlay = document.createElement('div');
		// Create button to cancel analysis
		let cancelButton = document.createElement('button');
		cancelButton.textContent = 'Cancel';
		cancelButton.onclick = this.onCancelButtonPressed.bind(this);
		// Create PEW eye icon, to show loading and convey the result
		let pewIcon = document.createElement('video');
		pewIcon.width = 300;
		pewIcon.height = 300;
		pewIcon.autoplay = true;
		if(!this.isCrossOrigin) {
			pewIcon.src = chrome.runtime.getURL('Media/logo_analysis.webm');
			pewIcon.loop = true;
		} else {
			pewIcon.src = chrome.runtime.getURL('Media/logo_analysis_cors.webm');
		}

		this.analysisOverlay.appendChild(cancelButton);
		this.analysisOverlay.appendChild(pewIcon);
	}
	/*-----------------------------------------------------------------*/

	onCancelButtonPressed() {
		if(confirm('Are you sure you want to cancel the video analysis?')) {
			this.analysisOverlay.parentNode.removeChild(this.analysisOverlay);
			this.stopAnalysis();
		}
	}

	/*-----------------------------------------------------------------*/

	startAnalysis() {

	}

	stopAnalysis() {
	}

	get selected() {
		return this.selectionClickable.querySelector('input').checked;
	}

	set selected(val) {
		this.selectionClickable.querySelector('input').checked = val;
	}

	get overlayCancelButton() {
		return this.analysisOverlay.querySelector('button');
	}

	get overlayPewIcon() {
		return this.analysisOverlay.querySelector('video');
	}

	get isOverlayed() {
		return this.analysisOverlay.parentNode !== null;
	}
}