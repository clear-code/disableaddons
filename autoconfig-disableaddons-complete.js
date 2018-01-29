{// Disable Addons (complete version), for Firefox 52/Thunderbird 52 and later
  lockPref('extensions.update.enabled', false);
  lockPref('xpinstall.enabled', false);
  lockPref('extensions.showMismatchUI', false);
  lockPref('extensions.getAddons.get.url', '');
  lockPref('extensions.getAddons.getWithPerformance.url', '');
  lockPref('extensions.getAddons.recommended.url', '');
  lockPref('extensions.getAddons.search.browseURL', '');
  lockPref('extensions.getAddons.search.url', '');
  let { classes: Cc, interfaces: Ci, utils: Cu } = Components;
  let { Services } = Cu.import('resource://gre/modules/Services.jsm', {});
  Services.obs.addObserver({
    observe(aSubject, aTopic, aData) {
      if (aSubject.location.href.indexOf('about:addons') == 0)
        aSubject.location.replace('about:blank');
    }
  }, 'chrome-document-global-created', false);

  const SSS = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  Services.obs.addObserver({
    observe(aSubject, aTopic, aData) {
      let style = `
        @namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
        @namespace html url("http://www.w3.org/1999/xhtml");
        @namespace xbl url("http://www.mozilla.org/xbl");

        /* common */
        @-moz-document
          url-prefix("about:home"),
          url-prefix("chrome://browser/content/abouthome/aboutHome.xhtml") {
            *|*#addons, *|*[id="addons"] {
              display: none !important;
              visibility: collapse !important;
            }
        }

        /* Firefox */
        @-moz-document
          url-prefix("chrome://browser/content/browser.xul") {
            #appmenu_addons,
            #appmenu_safeMode,
            /* menu bar */
            #menu_openAddons,
            #helpSafeMode,
            /* Australis panel UI */
            #wrapper-add-ons-button, /* For Fx 31 ESR */
            #add-ons-button {
              display: none !important;
              -moz-user-focus: ignore !important;
            }
        }

        /* Thunderbird */
        @-moz-document
          url-prefix("chrome://messenger/content/messenger.xul"),
          url-prefix("chrome://messenger/content/messageWindow.xul") {
            #addonsManager,
            #helpSafeMode,
            /* application menu */
            #appmenu_addons,
            #appmenu_safeMode, #appmenu_safeMode + menuseparator {
              display: none !important;
              -moz-user-focus: ignore !important;
            }
        }
        @-moz-document
          url-prefix("chrome://messenger/content/preferences/preferences.xul") {
            #addonsMgrGroup,
            /* security */
            #addonInstallBox,
            #addonInstallBox + separator {
              visibility: collapse !important;
              -moz-user-focus: ignore !important;
            }
        }
      `;
      let sheet = Services.io.newURI(`data:text/css,${encodeURIComponent(style)}`);
      if (!SSS.sheetRegistered(sheet, SSS.USER_SHEET))
        SSS.loadAndRegisterSheet(sheet, SSS.USER_SHEET);
    }
  }, 'final-ui-startup', false);
}
