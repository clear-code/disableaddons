/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const ID = 'disableaddons@clear-code.com';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{a5126d50-a958-11e1-afa6-0800200c9a66}');
const kID   = '@clear-code.com/disableaddons/featureconfiguratorblocker;1';
const kNAME = "DisableAddonsFeatureConfiguratorBlocker";

const ObserverService = Cc['@mozilla.org/observer-service;1']
		.getService(Ci.nsIObserverService);

// const Application = Cc['@mozilla.org/steel/application;1']
//     .getService(Ci.steelIApplication);

// let { console } = Application;

const STARTUP_TOPIC = XPCOMUtils.generateNSGetFactory ?
					'profile-after-change' : // for gecko 2.0
					'app-startup' ;

function DisableAddonsFeatureConfiguratorBlocker() { 
}
DisableAddonsFeatureConfiguratorBlocker.prototype = {
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
				ObserverService.addObserver(this, 'chrome-document-global-created', false);
				return;

			case 'chrome-document-global-created':
				this.onChromeDocumentLoaded(aSubject);
				return;
		}
	},
 
	onChromeDocumentLoaded : function(aWindow) 
	{
		if (aWindow.location.href != 'chrome://messenger/content/featureConfigurator.xhtml')
			return;

		aWindow.addEventListener('DOMContentLoaded', function() {
			aWindow.addEventListener('DOMContentLoaded', arguments.callee, false);
			aWindow.FeatureConfigurator.subpages = aWindow.FeatureConfigurator.subpages.filter(function(aPage) {
				return aPage != 'compactheader' &&
						aPage != 'folderpanecolumns';
			});
		}, false);
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
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableAddonsFeatureConfiguratorBlocker]);
else
	var NSGetModule = XPCOMUtils.generateNSGetModule([DisableAddonsFeatureConfiguratorBlocker]);
