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

const ObserverService = Cc['@mozilla.org/observer-service;1']
		.getService(Ci.nsIObserverService);

const Prefs = Cc['@mozilla.org/preferences;1']
		.getService(Ci.nsIPrefBranch)
		.QueryInterface(Ci.nsIPrefBranch2);

const SSS = Cc['@mozilla.org/content/style-sheet-service;1']
		.getService(Ci.nsIStyleSheetService);

const IOService = Cc['@mozilla.org/network/io-service;1']
		.getService(Ci.nsIIOService);

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
				ObserverService.addObserver(this, 'profile-after-change', false);
				return;

			case 'profile-after-change':
				if (this.listening) {
					ObserverService.removeObserver(this, 'profile-after-change');
					this.listening = false;
				}
				this.init();
				return;

			case 'nsPref:changed':
				this.onPrefChange(aData);
				return;
		}
	},

	onPrefChange : function(aPrefName)
	{
		switch (aPrefName)
		{
			case 'extensions.update.notifyUser':
				if (Prefs.getBoolPref(aPrefName)) {
					this.applyUpdates();
					Prefs.setBoolPref(aPrefName, false);
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

		Prefs.addObserver('extensions.update.', this, false);
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
		const Pref = Cc['@mozilla.org/preferences;1']
				.getService(Ci.nsIPrefBranch);
		try {
			Pref.lockPref('xpinstall.enabled');
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
		var sheet = IOService.newURI('chrome://disableaddons/content/global.css', null, null);
		if (!SSS.sheetRegistered(sheet, SSS.USER_SHEET)) {
			SSS.loadAndRegisterSheet(sheet, SSS.USER_SHEET);
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
