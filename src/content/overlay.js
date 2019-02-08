/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Message Archive Options.
 *
 * The Initial Developer of the Original Code is
 * eviljeff.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var messagearchiveoptions = {
  preferenceService: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.messagearchiveoptions@eviljeff.com."),

	// cleidigh - use getStringPref for TB 60+
	get monthValue() {return this.preferenceService.getStringPref("monthstring");},
	get yearValue() {return this.preferenceService.getStringPref("yearstring");},

	get keyModifiers() {
	var modifiers=new Array();
	if (this.preferenceService.getBoolPref("key.shift")) modifiers.push("shift");
	if (this.preferenceService.getBoolPref("key.alt")) modifiers.push("alt");
	if (this.preferenceService.getBoolPref("key.control")) modifiers.push("accel");
	return modifiers;
  },
  onLoad: function() {
	
		let rg = /let monthFolderName =.*;$/gm

		var origfunc=((BatchMessageMover.prototype.archiveSelectedMessages)? BatchMessageMover.prototype.archiveSelectedMessages : BatchMessageMover.prototype.archiveMessages).toSource(); //function name changed in TB3.1

		
		// cleidigh - use strftime from @tdoan to replace deprecated toLocaleFormat in TB 60+
		// origfunc=origfunc.replace('msgDate.toLocaleFormat("%Y-%m")','msgDate.toLocaleFormat(messagearchiveoptions.monthValue)');
		// origfunc=origfunc.replace(rg, 'let monthFolderName = strftime(messagearchiveoptions.monthValue, msgDate).toString(); console.log(monthFolderName)');
		origfunc=origfunc.replace(rg, 'let monthFolderName = strftime(messagearchiveoptions.monthValue, msgDate).toString();');

		// origfunc=origfunc.replace('msgDate.getFullYear().toString()','msgDate.toLocaleDateString(locale, messagearchiveoptions.yearValue)');
		origfunc=origfunc.replace('msgDate.getFullYear().toString()','strftime(messagearchiveoptions.yearValue, msgDate)');

		// origfunc=origfunc.replace('if (!aMsgHdrs.length)', 'console.log(aMsgHdrs.length);\n if (!aMsgHdrs.length)');

		rg = /^\s*\(\s*function\s*\(.+\)\s*\{/gm
		origfunc=origfunc.replace(rg, '');
		// origfunc=origfunc.replace('(function (aMsgHdrs) {', '');
		// origfunc=origfunc.replace('})', '');

		
		rg = /\}.*\)\s*$/gm
		origfunc=origfunc.replace(rg, '');
		
		console.log('after F*\n'+origfunc);
		
		// eval("BatchMessageMover.prototype.archive"+ ((BatchMessageMover.prototype.archiveSelectedMessages)? "Selected" : "") +"Messages = "+origfunc);
		//BatchMessageMover.prototype.archiveSelectedMessages = this.archiveSelectedMessages;

		// console.log(BatchMessageMover.prototype.archiveSelectedMessages)		
		// console.log(BatchMessageMover.prototype.archiveMessages)	
		// console.log(BatchMessageMover.prototype.archiveMessages.toSource())	
		//  let s = ("BatchMessageMover.prototype.archive"+ ((BatchMessageMover.prototype.archiveSelectedMessages)? "Selected" : "") +"Messages = "+origfunc);
		// console.log(origfunc);

		// BatchMessageMover.prototype.archiveMessages = new Function('alert("hello")');
		BatchMessageMover.prototype.archiveMessages = new Function('aMsgHdrs',origfunc);
		// eval(s)

		console.log('after prototype')
		console.log(BatchMessageMover.prototype.archiveMessages)	
		console.log(BatchMessageMover.prototype.archiveMessages.toSource())	

	this.migrateOldPrefs();
	this.observe("","nsPref:changed","");

  }, 
  observe:function(subject ,topic , data) {
	//Application.console.log("MessageArchiveOptions:observe");
	if (topic!="nsPref:changed") return;
	document.getElementById("key_archive").setAttribute("modifiers",this.keyModifiers.join(" "));
  },
  migrateOldPrefs:function() {
	var ps=this.preferenceService;
    if (ps.prefHasUserValue("mail.server.default.archive_granularity")) {
		ps.setIntPref("mail.identity.default.archive_granularity", ps.getIntPref("mail.server.default.archive_granularity"))
		ps.clearUserPref("mail.server.default.archive_granularity");
	}
  }
};

// cleidigh - use nsIPrefBranch for TB 60+ 
window.addEventListener("load", function(e) { messagearchiveoptions.onLoad(e); }, false);
messagearchiveoptions.preferenceService.QueryInterface(Components.interfaces.nsIPrefBranch).addObserver("key", messagearchiveoptions, false);