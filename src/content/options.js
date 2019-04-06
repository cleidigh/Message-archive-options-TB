/* global strftime, Preferences */
var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');
const { strftime } = ChromeUtils.import("chrome://messagearchiveoptions/content/strftime.js");

var currentPrefs = [];

// var returnValues = window.arguments[0];

console.log("options load");
Preferences.addAll([
	{ id: "extensions.messagearchiveoptions@eviljeff.com.monthstring", type: "unichar" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.yearstring", type: "unichar" },
	{ id: "mail.identity.default.archive_granularity", type: "int" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.key.alt", type: "bool" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.key.shift", type: "bool" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.key.control", type: "bool" },
]);

for (let element of document.querySelectorAll('[id]')) {
	window[element.id] = element;
}


function granualitySwitch() {
	var yearradio = document.getElementById('granuality1');
	var monthradio = document.getElementById('granuality2');
	var yearField = document.getElementById('year');
	var monthField = document.getElementById('month');


	console.log("granularity " + yearField);
	if (monthradio.selected) monthField.removeAttribute("disabled");
	else monthField.setAttribute("disabled", "true");
	if (yearradio.selected || monthradio.selected) yearField.removeAttribute("disabled");
	else yearField.setAttribute("disabled", "true");
}

function onDialogAccept(e) {
	console.log("accept hours");
	console.log(Preferences.getAll());
	var yearField = document.getElementById('year').value;
	var monthField = document.getElementById('month').value;
	const mFolder = strftime.strftime(monthField);
	const yFolder = strftime.strftime(yearField);

	let illegalChars = /[^a-z0-9_()-\s]/gi;

	if (illegalChars.test(mFolder)) {
		Services.prompt.alert(window, 'Option Error', 'Illegal Month Foldername: ' + mFolder);

		console.log("accept "+mFolder);
		e.preventDefault();

		return false;
	}

	if (illegalChars.test(yFolder)) {
		Services.prompt.alert('Option Error', 'Illegal Year Foldername: ' + mFolder);
		// alert('Illegal Year Foldername: ' + yFolder);
		console.log("accept "+yFolder);
		// e.preventDefault();

		return false;
	}

	return true;
}

function onDialogCancel() {
	console.log("dialogue cancel Mine ");
	console.log(Preferences.getAll());
}

function onLoad(e) {
	currentPrefs = Preferences.getAll();
	granualitySwitch();
}

document.addEventListener('dialogaccept', function(e) {
	onDialogAccept(e);
	// returnValues.cancelDialog = false;
	return false;
});
// document.addEventListener('dialogcancel', onDialogCancel());
document.addEventListener('dialogcancel', function(e) {
	let preferenceService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.messagearchiveoptions@eviljeff.com.");

	console.log("dialogue cancel ");
	// Preferences.addAll(currentPrefs);
	console.log(Preferences.getAll()[0].value);
	console.log(currentPrefs[0].value);
	var yearField = document.getElementById('year');
	var monthField = document.getElementById('month');
	// yearField.value = currentPrefs[1].value;
	// monthField.value = currentPrefs[0].value;
	// preferenceService.setStringPref("monthstring", currentPrefs[0].value);
	// preferenceService.setStringPref("yearstring", currentPrefs[1]._value);
	// console.log(Preferences.getAll());

	// returnValues.cancelDialog = true;
	return true;
});

// window.addEventListener("load", onLoad(), false);
window.addEventListener("load", function (e) { onLoad(e); }, false);
