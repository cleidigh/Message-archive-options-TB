const { strftime } = ChromeUtils.import("chrome://messagearchiveoptions/content/strftime.js");
console.error('Overland load 66  *** ' + strftime.strftime('%Y %b'));



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
		console.log("overlay 5 ");
		// console.log("granularity "+ this.yearValue());
		// console.log("overlay "+strftime);
		console.error('Overland load inside ' + strftime.strftime('%Y %b'));

		let rg = /let monthFolderName =.*;$/gm;
		var origfunc = ((BatchMessageMover.prototype.archiveSelectedMessages) ? BatchMessageMover.prototype.archiveSelectedMessages : BatchMessageMover.prototype.archiveMessages).toSource(); // function name changed in TB3.1
		const ofunc = origfunc;
		// console.log(ofunc + '\n\n');

		// origfunc = origfunc.replace(rg, 'let monthFolderName = strftime(messagearchiveoptions.monthValue, msgDate).toString();');

		// origfunc = origfunc.replace('msgDate.getFullYear().toString()', 'strftime(messagearchiveoptions.yearValue, msgDate)');

		// console.log('before\n' + origfunc + '\n\n');

		// Remove function declaration and function closure so anonymous function is not nested
		// otherwise new function fails to work

		// rg = /^\s*\(\s*function\s*\(.+\)\s*\{/gm;
		rg = /^\s*archiveMessages\s*\(.+\)\s*\{/gm;
		origfunc = origfunc.replace(rg, '');

		// rg = /\}.*\)\s*$/gm;
		rg = /\}.*\s*$/gm;
		origfunc = origfunc.replace(rg, '');


		// console.log(origfunc);

		// Rework removing eval() and replacing with new Function()
		// BatchMessageMover.prototype.archiveMessages = new Function('aMsgHdrs', 'alert("hello "+aMsgHdrs.length)');
		// BatchMessageMover.prototype.archiveMessages = new Function('aMsgHdrs', ofunc);
		// BatchMessageMover.prototype.archiveMessages = new Function('aMsgHdrs', origfunc);
		BatchMessageMover.prototype.archiveMessages = messagearchiveoptions.archiveMessagesOverride;

		// origfunc = ((BatchMessageMover.prototype.archiveSelectedMessages) ? BatchMessageMover.prototype.archiveSelectedMessages : BatchMessageMover.prototype.archiveMessages).toSource(); // function name changed in TB3.1
		// console.log(origfunc);

		this.migrateOldPrefs();
		this.observe("", "nsPref:changed", "");
		console.log('end of overlay');
	},

	test: function (aMsgHdrs) {
		console.log('test function ' + aMsgHdrs.length);
		// messagearchiveoptions.archiveMessagesOverride(aMsgHdrs, this);
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

	archiveMessagesOverride(aMsgHdrs) {

		if (!aMsgHdrs.length)
			return;

		const { strftime } = ChromeUtils.import("chrome://messagearchiveoptions/content/strftime.js");

		console.log('within override ');

		gFolderDisplay.hintMassMoveStarting();
		for (let i = 0; i < aMsgHdrs.length; i++) {
			let msgHdr = aMsgHdrs[i];

			let server = msgHdr.folder.server;

			// Convert date to JS date object.
			let msgDate = new Date(msgHdr.date / 1000);
			// let msgYear = msgDate.getFullYear().toString();
			// let monthFolderName = msgYear + "-" + (msgDate.getMonth() + 1).toString().padStart(2, "0");


			let msgYear = strftime.strftime(messagearchiveoptions.yearValue, msgDate);
			let monthFolderName = strftime.strftime(messagearchiveoptions.monthValue, msgDate).toString();

			let archiveFolderURI;
			let archiveGranularity;
			let archiveKeepFolderStructure;

			let identity = getIdentityForHeader(msgHdr);

			if (!identity || FeedMessageHandler.isFeedFolder(msgHdr.folder)) {
				// If no identity, or a server (RSS) which doesn't have an identity
				// and doesn't want the default unrelated identity value, figure
				// this out based on the default identity prefs.
				let enabled = Services.prefs.getBoolPref(
					"mail.identity.default.archive_enabled"
				);
				if (!enabled)
					continue;

				archiveFolderURI = server.serverURI + "/Archives";
				archiveGranularity = Services.prefs.getIntPref(
					"mail.identity.default.archive_granularity"
				);
				archiveKeepFolderStructure = Services.prefs.getBoolPref(
					"mail.identity.default.archive_keep_folder_structure"
				);
			} else {
				if (!identity.archiveEnabled)
					continue;

				archiveFolderURI = identity.archiveFolder;
				archiveGranularity = identity.archiveGranularity;
				archiveKeepFolderStructure = identity.archiveKeepFolderStructure;
			}

			let copyBatchKey = msgHdr.folder.URI;
			if (archiveGranularity >= Ci.nsIMsgIdentity
				.perYearArchiveFolders)
				copyBatchKey += "\0" + msgYear;

			if (archiveGranularity >= Ci.nsIMsgIdentity
				.perMonthArchiveFolders)
				copyBatchKey += "\0" + monthFolderName;

			if (archiveKeepFolderStructure)
				copyBatchKey += msgHdr.folder.URI;

			// Add a key to copyBatchKey
			if (!(copyBatchKey in this._batches)) {
				this._batches[copyBatchKey] = {
					srcFolder: msgHdr.folder,
					archiveFolderURI,
					granularity: archiveGranularity,
					keepFolderStructure: archiveKeepFolderStructure,
					yearFolderName: msgYear,
					monthFolderName,
					messages: [],
				};
			}
			this._batches[copyBatchKey].messages.push(msgHdr);
		}
		MailServices.mfn.addListener(this, MailServices.mfn.folderAdded);

		// Now we launch the code iterating over all message copies, one in turn.
		this.processNextBatch();
	},
};

// cleidigh - use nsIPrefBranch for TB 60+
window.addEventListener("load", function (e) { messagearchiveoptions.onLoad(e); }, false);
messagearchiveoptions.preferenceService.QueryInterface(Ci.nsIPrefBranch).addObserver("key", messagearchiveoptions, false);
