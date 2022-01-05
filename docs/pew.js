var page = 'main';

function orgs() {
	page = 'orgs';
	window.scrollTo(0,0);
	let orgs = document.querySelector('.orgs');
	let orgsPage = document.querySelector('.orgs-page');
	orgs.style.zIndex = 200;
	orgs.style.transition = 'transform 1s ease-in-out';
	orgs.style.transform = 'translateY(100vh)';
	orgsPage.style.transform = 'translateY(0)';
	orgsPage.style.visibility = 'visible';
	document.body.style.overflowY = 'hidden';
	addState('#organizations');
	setTimeout(() => {
		let orgsLinks = document.querySelector('.orgs-links');
		orgsLinks.classList.add('orgs-links-enabled');
	}, 1000);
}

function unorgs() {
	page = 'main';
	let orgs = document.querySelector('.orgs');
	let orgsPage = document.querySelector('.orgs-page');
	let orgsLinks = document.querySelector('.orgs-links');
	orgsLinks.classList.remove('orgs-links-enabled');
	orgs.style.zIndex = 200;
	orgs.style.transition = 'transform 1s ease-in-out';
	orgs.style.transform = 'translateY(-15px)';
	orgsPage.style.transform = '';
	addState('');
	setTimeout(() => {
		let orgs = document.querySelector('.orgs');
		let orgsPage = document.querySelector('.orgs-page');
		orgsPage.style.visibility = '';
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
	page = 'info';
	window.scrollTo(0,0);
	let info = document.querySelector('.info-page');
	let bubble = document.querySelector('.info-top-bubble');
	info.style.visibility = 'visible';
	info.style.opacity = 1.0;
	info.style.backgroundColor = 'var(--pew-info-color)';
	bubble.style.backgroundColor = 'var(--pew-secondary-color)';
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
	page = 'info';
	window.scrollTo(0,0);
	let info = document.querySelector('.info-page');
	let bubble = document.querySelector('.info-top-bubble');
	info.style.visibility = 'visible';
	info.style.opacity = 1.0;
	info.style.backgroundColor = 'var(--pew-info-sensory-bg)';
	bubble.style.backgroundColor = 'var(--pew-info-sensory)';
	bubble.textContent = 'Sensory Disorders';
	document.body.style.overflowY = 'hidden';
	let infoEp = document.querySelector('.info-ep');
	let infoSe = document.querySelector('.info-se');
	let infoSu = document.querySelector('.info-su');
	infoEp.style.visibility = '';
	infoSe.style.visibility = 'visible';
	infoSu.style.visibility = '';
	addState('#info-sensory');
}

function infoSupport() {
	page = 'info';
	window.scrollTo(0,0);
	let info = document.querySelector('.info-page');
	let bubble = document.querySelector('.info-top-bubble');
	info.style.visibility = 'visible';
	info.style.opacity = 1.0;
	info.style.backgroundColor = 'var(--pew-info-support-bg)';
	bubble.style.backgroundColor = 'var(--pew-info-support)';
	bubble.innerHTML = 'Support<br>Groups';
	document.body.style.overflowY = 'hidden';
	let infoEp = document.querySelector('.info-ep');
	let infoSe = document.querySelector('.info-se');
	let infoSu = document.querySelector('.info-su');
	infoEp.style.visibility = '';
	infoSe.style.visibility = '';
	infoSu.style.visibility = 'visible';
	addState('#info-support');
}

function uninfo() {
	page = 'main';
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
		document.body.style.overflowY = '';
	}, 500);
}

function about() {
	page = 'about';
	window.scrollTo(0,0);
	let about = document.querySelector('.about');
	let aboutPage = document.querySelector('.about-page');
	about.style.zIndex = 200;
	about.style.transition = 'transform 1s ease-in-out';
	about.style.transform = 'translateY(100vh)';
	aboutPage.style.visibility = 'visible';
	aboutPage.style.transform = 'translateY(0)';
	document.body.style.overflowY = 'hidden';
	addState('#about-us');
}

function unabout() {
	page = 'main';
	let about = document.querySelector('.about');
	let aboutPage = document.querySelector('.about-page');
	about.style.zIndex = 200;
	about.style.transition = 'transform 1s ease-in-out';
	about.style.transform = 'translateY(0)';
	aboutPage.style.transform = '';
	addState('');
	setTimeout(() => {
		let about = document.querySelector('.about');
		let aboutPage = document.querySelector('.about-page');
		aboutPage.style.visibility = '';
		about.style.zIndex = '';
		about.style.transition = '';
		about.style.transform = '';
		document.body.style.overflowY = '';
	}, 1000);
}

function addState(state) {
    let stateObj = { id: "100" };
      
    window.history.pushState(stateObj,
             state, "/index.html" + state);
}

document.onmousemove = (event) => {
	if(window.location.href.split('#')[1] !== undefined) {
		return;
	}

	let eye = document.querySelector('object').getSVGDocument().getElementById('path833');
	let iconBB = document.querySelector('object').getBoundingClientRect();
	let eyeBB = eye.getBBox();
	let [eyeX, eyeY] = [eyeBB.x + iconBB.x + eyeBB.width / 2, eyeBB.y + iconBB.y + eyeBB.height /2];
	let [x, y] = [event.screenX - eyeX - window.screen.left, event.screenY - window.screen.top - eyeY];
	let l = Math.sqrt(x * x + y * y);
	x = x / (Math.log(l) * 20);
	y = y / (Math.log(l) * 20);
	
	eye.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
};

function back_to_main() {
	switch(page) {
		case 'orgs':
			unorgs();
			break;
		case 'info':
			uninfo();
			break;
		case 'about':
			unabout();
			break;
	}
}

window.onload = () => {
	switch(window.location.href.split('#')[1]) {
		case undefined:
			if(page != 'main') back_to_main();
			break;
		case 'organizations':
			if(page != 'orgs') back_to_main();
			orgs();
			break;
		case 'info-epilepsy':
			if(page != 'info') back_to_main();
			infoEpilepsy();
			break;
		case 'info-sensory':
			if(page != 'info') back_to_main();
			infoSensory();
			break;
		case 'info-support':
			if(page != 'info') back_to_main();
			infoSupport();
			break;
		case 'about-us':
			if(page != 'about') back_to_main();
			about();
			break;
	}
	document.querySelector('object').getSVGDocument().onmousemove = document.onmousemove;
}

window.onpopstate = window.onload;