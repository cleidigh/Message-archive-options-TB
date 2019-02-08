
function granualitySwitch() {
	var yearradio = document.getElementById('granuality1');
	var monthradio = document.getElementById('granuality2');
	var yearField = document.getElementById('year')
	var monthField = document.getElementById('month')

	if (monthradio.selected) monthField.removeAttribute("disabled");
	else monthField.setAttribute("disabled", "true");
	if (yearradio.selected || monthradio.selected) yearField.removeAttribute("disabled");
	else yearField.setAttribute("disabled", "true");
}

function onDialogAccept() {
	var yearField = document.getElementById('year').value
	var monthField = document.getElementById('month').value
	const mFolder = strftime(monthField);
	const yFolder = strftime(yearField);

	let illegalChars = /[^a-z0-9_()-\s]/gi;

	if(illegalChars.test(mFolder)) {
		alert('Illegal Month Foldername: ' + mFolder);
		return false;
	}

	if(illegalChars.test(yFolder)) {
		alert('Illegal Year Foldername: ' + yFolder);
		return false;
	}

	return true;
}
