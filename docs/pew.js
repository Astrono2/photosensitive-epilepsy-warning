function orgs() {
	let orgs = document.querySelector('.orgs');
	let orgsPage = document.querySelector('.orgs-page');
	orgs.style.zIndex = 200;
	orgs.style.transition = 'transform 1s ease-in-out';
	orgs.style.transform = 'translateY(100vh)';
	orgsPage.style.transform = 'translateY(0)';
	document.body.style.overflowY = 'hidden';
	addState('#organizations');
}

function unorgs() {
	let orgs = document.querySelector('.orgs');
	let orgsPage = document.querySelector('.orgs-page');
	orgs.style.zIndex = 200;
	orgs.style.transition = 'transform 1s ease-in-out';
	orgs.style.transform = 'translateY(-15px)';
	orgsPage.style.transform = '';
	addState('');
	setTimeout(() => {
		let orgs = document.querySelector('.orgs');
		orgs.style.zIndex = '';
		orgs.style.transition = '';
		orgs.style.transform = '';
		document.body.style.overflowY = '';
	}, 1000);
}

var isInfoOpen = false;
var selected = null;

function info() {
	let info = document.querySelector('.info');
	isInfoOpen = !isInfoOpen;
	if(isInfoOpen) {
		selected = null;
		info.style.zIndex = 200;
		info.style.transition = 'transform 1s ease-in-out';
		info.style.transform = 'translateY(0)';
	} else {
		info.style.transform = 'translateY(calc(-8rem - 15px))';
		setTimeout(() => {
			let info = document.querySelector('.info');
			info.style.zIndex = '';
			info.style.transition = '';
			info.style.transform = '';
			switch(selected) {
				case 'epilepsy':
					infoEpilepsy();
					break;
				case 'sensory':
					infoSensory();
					break;
				case 'support':
					infoSupport();
					break;
			}
		}, 1000);
	}
}

function infoEpilepsy() {
	let info = document.querySelector('.info-page');
	let bubble = document.querySelector('.info-top-bubble');
	info.style.visibility = 'visible';
	info.style.opacity = 1.0;
	info.style.backgroundColor = '#F2CCFF';
	bubble.style.backgroundColor = '#663993';
	bubble.textContent = 'Epilepsy';
	let infoEp = document.querySelector('.info-ep');
	let infoSe = document.querySelector('.info-se');
	let infoSu = document.querySelector('.info-su');
	infoEp.style.visibility = 'visible';
	infoSe.style.visibility = '';
	infoSu.style.visibility = '';
	addState('#info-epilepsy');
}

function infoSensory() {
	let info = document.querySelector('.info-page');
	let bubble = document.querySelector('.info-top-bubble');
	info.style.visibility = 'visible';
	info.style.opacity = 1.0;
	info.style.backgroundColor = '#FFDFF6';
	bubble.style.backgroundColor = '#F992DC';
	bubble.textContent = 'Sensory Disorders';
	let infoEp = document.querySelector('.info-ep');
	let infoSe = document.querySelector('.info-se');
	let infoSu = document.querySelector('.info-su');
	infoEp.style.visibility = '';
	infoSe.style.visibility = 'visible';
	infoSu.style.visibility = '';
	addState('#info-sensory');
}

function infoSupport() {
	let info = document.querySelector('.info-page');
	let bubble = document.querySelector('.info-top-bubble');
	info.style.visibility = 'visible';
	info.style.opacity = 1.0;
	info.style.backgroundColor = '#C7F3CC';
	bubble.style.backgroundColor = '#7DD185';
	bubble.innerHTML = 'Support<br>Groups';
	let infoEp = document.querySelector('.info-ep');
	let infoSe = document.querySelector('.info-se');
	let infoSu = document.querySelector('.info-su');
	infoEp.style.visibility = '';
	infoSe.style.visibility = '';
	infoSu.style.visibility = 'visible';
	addState('#info-support');
}

function uninfo() {
	let info = document.querySelector('.info-page');
	let infoEp = document.querySelector('.info-ep');
	let infoSe = document.querySelector('.info-se');
	let infoSu = document.querySelector('.info-su');
	infoEp.style.visibility = '';
	infoSe.style.visibility = '';
	infoSu.style.visibility = '';
	info.style.opacity = '';
	addState('');
	setTimeout(() => {
		let info = document.querySelector('.info-page');
		info.style.visibility = '';
	}, 500);
}

function about() {
	let about = document.querySelector('.about');
	let aboutPage = document.querySelector('.about-page');
	about.style.zIndex = 200;
	about.style.transition = 'transform 1s ease-in-out';
	about.style.transform = 'translateY(100vh)';
	aboutPage.style.transform = 'translateY(0)';
	document.body.style.overflowY = 'hidden';
	addState('#about-us');
}

function unabout() {
	let about = document.querySelector('.about');
	let aboutPage = document.querySelector('.about-page');
	about.style.zIndex = 200;
	about.style.transition = 'transform 1s ease-in-out';
	about.style.transform = 'translateY(0)';
	aboutPage.style.transform = '';
	addState('');
	setTimeout(() => {
		let about = document.querySelector('.about');
		about.style.zIndex = '';
		about.style.transition = '';
		about.style.transform = '';
		document.body.style.overflowY = '';
	}, 1000);
}

function addState(state) {
    let stateObj = { id: "100" };
      
    window.history.pushState(stateObj,
             state, "/landing.html" + state);
}

// document.onmousemove = (event) => {
// 	if(window.location.href.split('#')[1] !== undefined) {
// 		return;
// 	}
// 	let eye = document.querySelector('object').getSVGDocument().getElementById('path833');
// 	let iconBB = document.querySelector('object').getBoundingClientRect();
// 	let eyeBB = eye.getBBox();
// 	let [eyeX, eyeY] = [eyeBB.x + iconBB.x + eyeBB.width / 2, eyeBB.y + iconBB.y + eyeBB.height /2];
// 	let [x, y] = [event.pageX - eyeX, event.pageY - eyeY];
// 	let l = Math.sqrt(x * x + y * y);
// 	x = x / (Math.log(l) * 20);
// 	y = y / (Math.log(l) * 20);
	
// 	eye.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
// };

window.onload = () => {
	switch(window.location.href.split('#')[1]) {
		case undefined:
			break;
		case 'organizations':
			orgs();
			break;
		case 'info-epilepsy':
			infoEpilepsy();
			break;
		case 'info-sensory':
			infoSensory();
			break;
		case 'info-support':
			infoSupport();
			break;
		case 'about-us':
			about();
			break;
	}
}