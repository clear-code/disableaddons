/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const ID = 'disableaddons@clear-code.com';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{1e2fc340-a29f-11de-8a39-0800200c9a66}');
const kID   = '@clear-code.com/disableaddons/startup;1';
const kNAME = 'Disable Addons Startup Service';

let { Services } = Components.utils.import('resource://gre/modules/Services.jsm', {});

const SSS = Cc['@mozilla.org/content/style-sheet-service;1']
		.getService(Ci.nsIStyleSheetService);

var WindowWatcher;

// Firefox
// const Application = Cc['@mozilla.org/fuel/application;1']
//     .getService(Ci.fuelIApplication);
// Thunderbird
// const Application = Cc['@mozilla.org/steel/application;1']
//     .getService(Ci.steelIApplication);

// let { console } = Application;

const STARTUP_TOPIC = XPCOMUtils.generateNSGetFactory ?
					'profile-after-change' : // for gecko 2.0
					'app-startup' ;

function DisableAddonsStartupService() {
}
DisableAddonsStartupService.prototype = {
	listening : false,

	observe : function(aSubject, aTopic, aData)
	{
		switch (aTopic)
		{
			case 'app-startup':
				this.listening = true;
				Services.obs.addObserver(this, 'profile-after-change', false);
				return;

			case 'profile-after-change':
				if (this.listening) {
					Services.obs.removeObserver(this, 'profile-after-change');
					this.listening = false;
				}
				this.init();
				return;

			case 'nsPref:changed':
				this.onPrefChange(aData);
				return;

			case 'chrome-document-global-created':
				// block loading of the addon manager
				if (Services.prefs.getBoolPref('extensions.disableaddons@clear-code.com.disable.manager') &&
					aSubject.location.href.indexOf('about:addons') == 0)
					aSubject.location.replace('about:blank');
				return;
		}
	},

	onPrefChange : function(aPrefName)
	{
		switch (aPrefName)
		{
			case 'extensions.update.notifyUser':
				if (Services.prefs.getBoolPref(aPrefName)) {
					this.applyUpdates();
					Services.prefs.setBoolPref(aPrefName, false);
				}
				return;
		}
	},

	init : function()
	{
		WindowWatcher = Cc['@mozilla.org/embedcomp/window-watcher;1']
						.getService(Ci.nsIWindowWatcher);

		this.registerGlobalStyleSheet();
		this.lockXPInstall();
		this.ensureSilent();

		try {
			this.enableBackgroundUpdates();
		}
		catch(error) {
			Components.utils.reportError(error);
		}

		Services.prefs.addObserver('extensions.update.', this, false);
		this.registerGlobalStyleSheet();

		Services.obs.addObserver(this, 'chrome-document-global-created', false);
	},

	ensureSilent : function()
	{
		const Pref = Cc['@mozilla.org/preferences;1']
				.getService(Ci.nsIPrefBranch)
		try {
			Pref.clearUserPref('extensions.newAddons');
		}
		catch(error) {
			Components.utils.reportError(error);
		}
	},

	enableBackgroundUpdates : function()
	{
		Components.utils.import("resource://gre/modules/Services.jsm");
		Components.utils.import("resource://gre/modules/AddonManager.jsm");

		AddonManager.getAllAddons(function (aAddonList) {
			aAddonList.forEach(function (aAddon) {
				if ("applyBackgroundUpdates" in aAddon)
					aAddon.applyBackgroundUpdates = AddonManager.AUTOUPDATE_ENABLE;
			});
		});
	},

	lockXPInstall : function()
	{
		try {
			Serices.prefs.lockPref('xpinstall.enabled');
		}
		catch(error) {
			Components.utils.reportError(error);
		}
	},

	applyUpdates : function()
	{
		var mode = Cc['@mozilla.org/supports-string;1']
					.createInstance(Ci.nsISupportsString);
		mode.data = 'updates-only';
		var params = Cc['@mozilla.org/supports-array;1']
						.createInstance(Ci.nsISupportsArray);
		params.AppendElement(mode);

		var win = WindowWatcher.openWindow(
				null,
				'chrome://mozapps/content/extensions/extensions.xul',
				null,
				'chrome,all,width=10,height=10,screenX=-100,screenY=-100,titlebar=no',
				params
			);
		if (!win.closed)
			win.setTimeout(function() {
				if (!win.closed)
					win.close();
			}, 5 * 60 * 1000);
	},

	registerGlobalStyleSheet : function()
	{
		var disableManagerSheet = Services.io.newURI('chrome://disableaddons/content/global-disablemanager.css', null, null);
		if (Services.prefs.getBoolPref('extensions.disableaddons@clear-code.com.disable.manager') &&
		    !SSS.sheetRegistered(disableManagerSheet, SSS.USER_SHEET)) {
			SSS.loadAndRegisterSheet(disableManagerSheet, SSS.USER_SHEET);
		}
		var disableControllsSheet = Services.io.newURI('chrome://disableaddons/content/global-disablecontrolls.css', null, null);
		if (!SSS.sheetRegistered(disableControllsSheet, SSS.USER_SHEET)) {
			SSS.loadAndRegisterSheet(disableControllsSheet, SSS.USER_SHEET);
		}
		var disableOptionsSheet = Services.io.newURI('chrome://disableaddons/content/global-disableoptions.css', null, null);
		if (!SSS.sheetRegistered(disableOptionsSheet, SSS.USER_SHEET)) {
			SSS.loadAndRegisterSheet(disableOptionsSheet, SSS.USER_SHEET);
		}
	},

	classID : kCID,
	contractID : kID,
	classDescription : kNAME,
	QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver]),
	_xpcom_categories : [
		{ category : STARTUP_TOPIC, service : true }
	]

};

if (XPCOMUtils.generateNSGetFactory)
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableAddonsStartupService]);
else
	var NSGetModule = XPCOMUtils.generateNSGetModule([DisableAddonsStartupService]);
