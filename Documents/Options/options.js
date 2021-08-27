const settingsBox = document.querySelector('.settings-box');

var options;
chrome.storage.sync.get(["options"], (response) => {
	options = response.options;
	setupOptions();
});

function setupOptions() {
	for(let section of options) {
		let header = createHeader(section.title);
		settingsBox.appendChild(header);
		let list = document.createElement('ul');
		list.classList.add('settings-list');
		settingsBox.appendChild(list);
		for(let item of section.items) {
			let listItem = document.createElement('li');
			list.appendChild(listItem);
			let itemElement;
			switch(item.type) {
				case 'bool':
					itemElement = createBoolItem(item);
					break;
				case 'slider':
					itemElement = createSliderItem(item);
					break;
			}
			listItem.appendChild(itemElement);
		}
	}
}

function createHeader(textContent) {
	let header = document.createElement('h2');
	header.textContent = textContent;
	return header;
}

function createBoolItem(item) {
	let label = document.createElement(['label']);
	label.classList.add('settings-bool');
	let title = document.createTextNode(item.title);
	label.appendChild(title);
	let input = document.createElement('input');
	input.type = 'checkbox';
	input.checked = item.value;
	input.onchange = onBoolChange.bind(item);
	label.appendChild(input);
	let span = document.createElement('span');
	label.appendChild(span);
	return label;
}

function createSliderItem(item) {
	item.value = parseInt(item.value);
	item.lastModified = 0;
	let slider = document.createElement('div');
	slider.classList.add('settings-slider');
	let title = document.createTextNode(item.title);
	slider.appendChild(title);
	let sliderContainer = document.createElement('div');
	sliderContainer.classList.add('slider-container');
	slider.appendChild(sliderContainer);
	let input = document.createElement('input');
	input.type = 'range';
	input.min = item.range[0];
	input.max = item.range[1];
	input.value = item.value;
	input.oninput = onSliderChanged.bind(item);
	input.onchange = saveSlider.bind(item);
	sliderContainer.appendChild(input);
	let span = document.createElement('span');
	span.contentEditable = true;
	span.classList.add('settings-input');
	span.textContent = item.value;
	span.addEventListener('keydown', onNumberInput, false);
	span.addEventListener('focusout', onSliderNumberConfirm.bind(item));
	span.oninput = onSliderNumberInput.bind(item);
	span.style.maxWidth = new String(input.max).length + 'em';
	sliderContainer.appendChild(span);
	if(item.suffix !== '') {
		let suffix = document.createTextNode(item.suffix);
		sliderContainer.appendChild(suffix);
	}
	return slider;
}

/*------------------------------------------------------------------*/

function onSliderChanged(self) {
	let item = this;
	let slider = self.target;
	item.value = slider.value;
	if(item.lastModified === undefined ||
		performance.now() - item.lastModified > 100 ||
		slider.value === slider.min || slider.value === slider.max) {
		let span = slider.parentNode.querySelector('span');
		span.textContent = slider.value;
		item.lastModified = performance.now();
	}
}

function onSliderNumberInput(self) {
	let item = this;
	let span = self.target;
	let slider = span.parentNode.querySelector('input');
	slider.value = span.textContent || 0;
}

function onSliderNumberConfirm(self) {
	let item = this;
	let span = self.target;
	let value = parseInt(span.textContent || '0');
	value = Math.min(value, item.range[1]);
	value = Math.max(value, item.range[0]);
	span.textContent = value;
	item.value = value;
	chrome.storage.sync.set({options: options});
}

function saveSlider(self) {
	let slider = self.target;
	let item = this;
	item.value = slider.value;
	chrome.storage.sync.set({options: options});
} 

/*------------------------------------------------------------------*/

function onBoolChange(self) {
	let item = this;
	let input = self.target;
	item.value = input.checked;
	chrome.storage.sync.set({options: options});
}

/*------------------------------------------------------------------*/

function onNumberInput(self) {
	let isValid = !isNaN(parseInt(self.key)) || ['Delete', 'Backspace', 'ArrowRight', 'ArrowLeft', 'Tab'].includes(self.key);
	if(!isValid) self.preventDefault();
}