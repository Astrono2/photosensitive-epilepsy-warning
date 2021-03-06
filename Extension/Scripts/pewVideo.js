export class PewVideo {
	video; // Reference to the associated video

	selectionOverlayCutout; // Rect
	selectionClickable; // Label
	blockingOverlay; // Div
	analysisOverlay; // Div

	analysisPortUid; // Int
	analysisCanvas; // Canvas
	analysisCanvasCtx; // Canvas context

	isCrossOrigin; // Boolean

	mutationObserver; // MutationObserver

	contentRemoveOverlay; // Method

	isSafe; // Bool
	isAnalyzing; // Bool

	constructor(video) {
		this.video = video;

		this.isCrossOrigin = PewVideo.checkCrossOrigin(video);
		// Make canvas
		this.analysisCanvas = document.createElement('canvas');
		this.analysisCanvas.width = video.videoWidth;
		this.analysisCanvas.height = video.videoHeight;
		this.analysisCanvasCtx = this.analysisCanvas.getContext('2d');

		// If it's true or false it means it has been analyzed
		this.isSafe = undefined;

		this.isAnalyzing = false;

		this.makeOverlays();
	}

	static checkCrossOrigin(video) {
		// If the video source begins with a fowardslash, it's a relative url and not cross-origin
		if(video.src[0] === '/') return false;

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
		cancelButton.classList.add('cancel-button');
		cancelButton.textContent = 'Cancel';
		cancelButton.onclick = this.onCancelButtonPressed.bind(this);
		// Create PEW eye icon, to show loading and convey the result
		let pewIcon = document.createElement('video');
		pewIcon.width = 300;
		pewIcon.height = 300;
		pewIcon.autoplay = true;
		// Create label for extra info
		let label = document.createElement('label');

		if(!this.isCrossOrigin) {
			pewIcon.src = chrome.runtime.getURL('Media/logo_analysis.webm');
			pewIcon.loop = true;
			label.textContent = 'Analyzing...';
		} else {
			pewIcon.src = chrome.runtime.getURL('Media/logo_analysis_cors.webm');
			label.textContent = 'Sorry, this video can\'t be analyzed';
		}

		this.analysisOverlay.appendChild(cancelButton);
		this.analysisOverlay.appendChild(pewIcon);
		this.analysisOverlay.appendChild(label);
	}
	/*-----------------------------------------------------------------*/

	onCancelButtonPressed() {
		if(confirm('Are you sure you want to cancel the video analysis?')) {
			this.stopAnalysis();
			this.removeOverlay();
		}
	}

	/*-----------------------------------------------------------------*/

	// Result is a boolean, true for safe, false for unsafe
	finishedAnalyzing(result) {
		this.isSafe = result;
		let pewIcon = this.analysisOverlay.querySelector('video');
		pewIcon.loop = false;

		let cancelButton = this.analysisOverlay.querySelector('.cancel-button');
		this.analysisOverlay.removeChild(cancelButton);

		pewIcon.onended = onEnded.bind([pewIcon, this]);

		function onEnded(event) {
			let pewIcon = this[0];
			let pewVideo = this[1];
			if(pewVideo.isSafe) {
				pewIcon.src = chrome.runtime.getURL('Media/logo_analysis_good.webm');
			} else {
				pewIcon.src = chrome.runtime.getURL('Media/logo_analysis_bad.webm');
			}
			pewIcon.currentTime = 0;
			pewIcon.play();
			pewIcon.onended = updateOverlay.bind(pewVideo);
		}

		function updateOverlay(event) {
			let label = this.analysisOverlay.querySelector('label');
			let continueButton = document.createElement('button');
			continueButton.id = 'continue';
			if(this.isSafe) {
				label.textContent = 'This video is safe to watch!';
				label.style.color = '#00FF00';
				continueButton.classList.add('continue');
				continueButton.style.backgroundColor = '#00EE00';
				continueButton.textContent = 'Finish';
				continueButton.onclick = this.removeOverlay.bind(this);
			} else {
				label.textContent = 'This video isn\'t safe to watch!';
				label.style.color = '#FF0000';
				continueButton.classList.add('continue');
				continueButton.style.backgroundColor = '#EE0000';
				continueButton.textContent = 'Watch anyway';
				continueButton.onclick = this.watchAnyways.bind(this);
			}

			this.analysisOverlay.appendChild(continueButton);
		}
	}

	removeOverlay() {
		this.analysisOverlay.parentNode.removeChild(this.analysisOverlay);
	}

	// This method needs to be secure
	watchAnyways() {
		if(confirm('This video might trigger a seizure. Are you sure you want to watch it?')) {
			this.removeOverlay();
		}
	}

	startAnalysis() {
		if (this.isSafe !== undefined) return
		chrome.runtime.sendMessage({action: 'get_native_port'}, (uid) => {
			this.analysisPortUid = uid;

			let metadata_message = '';
			metadata_message += this.video.videoWidth.toString(16);
			metadata_message += ',';
			metadata_message += this.video.videoHeight.toString(16);
			metadata_message += ',';
			metadata_message += (30).toString(16); // fps
			metadata_message += ',';
			metadata_message += 't'; // has alpha = true

			chrome.runtime.sendMessage({
				action: 'send_native_message',
				uid: this.analysisPortUid,
				message: metadata_message
			});

			this.video.pause();
			this.video.currentTime = 0;
			this.sendFrame();
			this.isAnalyzing = true;
		});
	}

	stopAnalysis() {
		chrome.runtime.sendMessage({
			action: 'remove_native_port',
			uid: this.analysisPortUid
		});
		this.video.currentTime = 0;
		this.video.pause();
		this.isAnalyzing = false;
	}

	sendFrame() {
		let video = this.video;
		let ctx = this.analysisCanvasCtx;
		ctx.drawImage(video, 0, 0);
		let frame = ctx.getImageData(0,0,video.videoWidth,video.videoHeight).data;
		chrome.runtime.sendMessage({
			action: 'send_native_message',
			uid: this.analysisPortUid,
			message: frame.toString()
		});
		video.currentTime += 1/30;
	}

	onMessage(message) {
		if(!this.isAnalyzing) return;
		if(this.isSafe !== undefined) return;
		if(message === 2) {
			if(this.video.currentTime < this.video.duration) {
				this.sendFrame();
			} else {
				this.stopAnalysis();
				this.finishedAnalyzing(true);
			}
		} else {
			this.stopAnalysis();
			this.finishedAnalyzing(false);
		}
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