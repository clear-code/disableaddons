/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const ID = 'disableaddons@clear-code.com';

const BLOCKED_URIS = [
  "about:addons",
  "about:debugging"
];

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

let { Services } = Components.utils.import('resource://gre/modules/Services.jsm', {});

const kCID  = Components.ID('{0d55570e-1de3-4b38-b4f9-01e2ef7afbd1}');
const kID   = '@clear-code.com/disableaddons/addonmanagerblocker;1';
const kNAME = "DisableAddonsAddonManagerBlocker";

// const Application = Cc['@mozilla.org/steel/application;1']
//     .getService(Ci.steelIApplication);

// let { console } = Application;

// function dir(obj) console.log(Object.getOwnPropertyNames(obj).join("\n"));

const BLOCKED_URIS_PATTERN = new RegExp('^(?:' +
                                          BLOCKED_URIS.map(function(aURI) {
                                            return aURI.replace(/([\\^\$\*\+\?\.\(\)\|\{\}\[\]])/g, '\\$1');
                                          }).join('|') +
                                          ')',
                                        'i');

function DisableAddonsAddonManagerBlocker() {}

DisableAddonsAddonManagerBlocker.prototype = {
  QueryInterface: function (aIID) {
    if (!aIID.equals(Ci.nsIContentPolicy) &&
        !aIID.equals(Ci.nsISupportsWeakReference) &&
        !aIID.equals(Ci.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  shouldLoad: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    if (Services.prefs.getBoolPref('extensions.disableaddons@clear-code.com.disable.manager') &&
        BLOCKED_URIS_PATTERN.test(aContentLocation.spec)) {
      this.processBlockedContext(aContext);
      Components.utils.reportError(new Error(ID + ': ' + aContentLocation.spec + ' is blocked!'));
      return Ci.nsIContentPolicy.REJECT_REQUEST;
    }

    return Ci.nsIContentPolicy.ACCEPT;
  },

  shouldProcess: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    return Ci.nsIContentPolicy.ACCEPT;
  },

  processBlockedContext: function (aContext) {
    try {
      if (aContext && aContext.localName == 'browser') {
        aContext.stop();
        let doc = aContext.ownerDocument;
        let chrome = doc.defaultView;
        if (chrome &&
            chrome.gBrowser &&
            chrome.gBrowser.selectedBrowser == aContext &&
            chrome.gBrowser.visibleTabs.length == 1)
          return;
      }
      let win = aContext.contentWindow;
      win.close();
    } catch (error) {}

    // XXX: does not work
    // win.setTimeout(function () {
    //   win.close();
    // }, 0);
  },

  classID           : kCID,
  contractID        : kID,
  classDescription  : kNAME,
  QueryInterface    : XPCOMUtils.generateQI([Ci.nsIContentPolicy]),
  _xpcom_categories : [
    { category : 'content-policy', service : true }
  ]
};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableAddonsAddonManagerBlocker]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([DisableAddonsAddonManagerBlocker]);
