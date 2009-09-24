const ID = 'disableaddons@clear-code.com';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{1e2fc340-a29f-11de-8a39-0800200c9a66}'); 
const kID   = '@clear-code.com/disableaddons/startup;1';
const kNAME = "Disable Addons Startup Service";

const ObserverService = Cc['@mozilla.org/observer-service;1']
		.getService(Ci.nsIObserverService);

function DisableAddonsStartupService() { 
}
DisableAddonsStartupService.prototype = {
	 
	observe : function(aSubject, aTopic, aData) 
	{
		switch (aTopic)
		{
			case 'app-startup':
				ObserverService.addObserver(this, 'profile-after-change', false);
				return;

			case 'profile-after-change':
				ObserverService.removeObserver(this, 'profile-after-change');
				this.init();
				return;
		}
	},
 
	init : function() 
	{
		this.ensureSilent();
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
  
	classID : kCID,
	contractID : kID,
	classDescription : kNAME,
	QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver]),
	_xpcom_categories : [
		{ category : 'app-startup', service : true }
	]
 
}; 

function NSGetModule(aCompMgr, aFileSpec)
{
	return XPCOMUtils.generateModule([DisableAddonsStartupService]);
}

