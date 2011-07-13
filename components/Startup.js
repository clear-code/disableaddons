const ID = 'disableaddons@clear-code.com';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{1e2fc340-a29f-11de-8a39-0800200c9a66}'); 
const kID   = '@clear-code.com/disableaddons/startup;1';
const kNAME = "Disable Addons Startup Service";

const ObserverService = Cc['@mozilla.org/observer-service;1']
		.getService(Ci.nsIObserverService);

const Application = Cc['@mozilla.org/steel/application;1']
    .getService(Ci.steelIApplication);

let { console } = Application;

if (XPCOMUtils.generateNSGetFactory)
	var STARTUP_TOPIC = 'profile-after-change'; // for gecko 2.0
else
	var STARTUP_TOPIC = 'app-startup';

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
		}
	},
 
	init : function() 
	{
		this.ensureSilent();
		try {
			this.enableBackgroundUpdates();
		} catch (x) {
			console.log(x);
		}
	},

	ensureSilent : function()
	{
		const Pref = Cc['@mozilla.org/preferences;1']
				.getService(Ci.nsIPrefBranch)
		try {
			Pref.clearUserPref('extensions.newAddons');
		}
		catch(e) {
		}
	},

	enableBackgroundUpdates : function()
	{
		Components.utils.import("resource://gre/modules/Services.jsm");
		Components.utils.import("resource://gre/modules/AddonManager.jsm");

		AddonManager.getAllAddons(function (aAddonList) {
			aAddonList.forEach(function (aAddon) {
				if ("applyBackgroundUpdates" in aAddon)
					Addon.applyBackgroundUpdates = AddonManager.AUTOUPDATE_ENABLE;
			});
		});
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
