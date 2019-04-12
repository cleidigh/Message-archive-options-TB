/* global strftime, Preferences */
var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');
const { strftime } = ChromeUtils.import("chrome://messagearchiveoptions/content/strftime.js");

Preferences.addAll([
	{ id: "extensions.messagearchiveoptions@eviljeff.com.monthstring", type: "unichar" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.yearstring", type: "unichar" },
	{ id: "mail.identity.default.archive_granularity", type: "int" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.key.alt", type: "bool" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.key.shift", type: "bool" },
	{ id: "extensions.messagearchiveoptions@eviljeff.com.key.control", type: "bool" },
]);


function granualitySwitch() {
	var yearradio = document.getElementById('granuality1');
	var monthradio = document.getElementById('granuality2');
	var yearField = document.getElementById('year');
	var monthField = document.getElementById('month');

	if (monthradio.selected) monthField.removeAttribute("disabled");
	else monthField.setAttribute("disabled", "true");
	if (yearradio.selected || monthradio.selected) yearField.removeAttribute("disabled");
	else yearField.setAttribute("disabled", "true");
}

function strftimeReferenceLoad() {
	let tabmail = getMail3Pane();
	const ref = "https://thdoan.github.io/strftime/";
	tabmail.openTab("chromeTab", { chromePage: ref });
}

function getMail3Pane() {
	var w = Cc["@mozilla.org/appshell/window-mediator;1"]
		.getService(Ci.nsIWindowMediator)
		.getMostRecentWindow("mail:3pane");
	return w;
}


function onDialogAccept(e) {
	console.log("onDialogAccept ");
	console.log(Preferences.getAll());
	var yearField = document.getElementById('year').value;
	var monthField = document.getElementById('month').value;
	const mFolder = strftime.strftime(monthField);
	const yFolder = strftime.strftime(yearField);

	let illegalChars = /[^a-z0-9_()-\s]/gi;

	if (illegalChars.test(mFolder)) {
		Services.prompt.alert(window, 'Option Error', 'Illegal Month Foldername: ' + mFolder);

		console.log("accept " + mFolder);
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	if (illegalChars.test(yFolder)) {
		Services.prompt.alert('Option Error', 'Illegal Year Foldername: ' + mFolder);
		console.log("accept " + yFolder);
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	return true;
}

function onDialogCancel() {
	console.log("dialogue cancel Mine ");
	console.log(Preferences.getAll());
}

function onLoad(e) {
	granualitySwitch();
}

document.addEventListener('dialogaccept', function (e) {
	Services.console.logStringMessage(" dialogaccept event handler");
	onDialogAccept(e);
	return false;
});

document.addEventListener('dialogcancel', function (e) {
	Services.console.logStringMessage("dialogcancel event handler");
	return true;
});

window.addEventListener("load", function (e) { onLoad(e); }, false);
