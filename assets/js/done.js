var oelna = window.oelna || {};
oelna.done = window.oelna.done || {};

//fail silently, if console is not available
if(typeof console === 'undefined') {
	console = {};
	console.log = function() {
		return;
	}
}

jQuery(document).ready(function($) {
	oelna.done.webapp = window.navigator.standalone;
	oelna.done.domain = document.domain;
	oelna.done.clickevent = (Modernizr.touch) ? 'touchend' : 'click'; //use click for non-touch devices, kill 600ms delay for touchscreens

	console.log('init');
});