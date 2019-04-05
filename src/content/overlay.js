const { strftime } = ChromeUtils.import("chrome://messagearchiveoptions/content/strftime.js");
console.error('Overland load 8 ** ' + strftime.strftime('%Y %b'));

console.log("overlay 2");

var messagearchiveoptions = {
	preferenceService: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.messagearchiveoptions@eviljeff.com."),

	// cleidigh - use getStringPref for TB 60+
	get monthValue() { return this.preferenceService.getStringPref("monthstring"); },
	get yearValue() { return this.preferenceService.getStringPref("yearstring"); },

	get keyModifiers() {
		var modifiers = [];
		if (this.preferenceService.getBoolPref("key.shift")) modifiers.push("shift");
		if (this.preferenceService.getBoolPref("key.alt")) modifiers.push("alt");
		if (this.preferenceService.getBoolPref("key.control")) modifiers.push("accel");
		return modifiers;
	},
	onLoad: function () {

		// cleidigh - original approach modifies batch archive function to substitute
		// complex date strings for folder names.

		// Modify year and month folder names
		// cleidigh - use strftime from @tdoan to replace deprecated toLocaleFormat in TB 60+

		let rg = /let monthFolderName =.*;$/gm;
		var origfunc = ((BatchMessageMover.prototype.archiveSelectedMessages) ? BatchMessageMover.prototype.archiveSelectedMessages : BatchMessageMover.prototype.archiveMessages).toSource(); // function name changed in TB3.1

		origfunc = origfunc.replace(rg, 'let monthFolderName = strftime(messagearchiveoptions.monthValue, msgDate).toString();');

		origfunc = origfunc.replace('msgDate.getFullYear().toString()', 'strftime(messagearchiveoptions.yearValue, msgDate)');

		// Remove function declaration and function closure so anonymous function is not nested
		// otherwise new function fails to work

		rg = /^\s*\(\s*function\s*\(.+\)\s*\{/gm;
		origfunc = origfunc.replace(rg, '');

		rg = /\}.*\)\s*$/gm;
		origfunc = origfunc.replace(rg, '');

		// Rework removing eval() and replacing with new Function()
		BatchMessageMover.prototype.archiveMessages = new Function('aMsgHdrs', origfunc);

		this.migrateOldPrefs();
		this.observe("", "nsPref:changed", "");

	},
	observe: function (subject, topic, data) {
		// Application.console.log("MessageArchiveOptions:observe");
		if (topic !== "nsPref:changed") return;
		document.getElementById("key_archive").setAttribute("modifiers", this.keyModifiers.join(" "));
	},
	migrateOldPrefs: function () {
		var ps = this.preferenceService;
		if (ps.prefHasUserValue("mail.server.default.archive_granularity")) {
			ps.setIntPref("mail.identity.default.archive_granularity", ps.getIntPref("mail.server.default.archive_granularity"));
			ps.clearUserPref("mail.server.default.archive_granularity");
		}
	},
};

// cleidigh - use nsIPrefBranch for TB 60+
window.addEventListener("load", function (e) { messagearchiveoptions.onLoad(e); }, false);
messagearchiveoptions.preferenceService.QueryInterface(Ci.nsIPrefBranch).addObserver("key", messagearchiveoptions, false);
