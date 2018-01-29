{// Disable Addons (only disallow install/uninstall), for Firefox 52/Thunderbird 52 and later
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

  let blocker = {
    observe(aSubject, aTopic, aData) {
      if (aSubject.location.href.indexOf('about:addons') == 0)
        aSubject.addEventListener('DOMContentLoaded', () => {
          aSubject.gDragDrop.onDrop = (aEvent) => {
            aEvent.stopPropagation();
            aEvent.preventDefault();
          };
        }, { once: true });
    }
  };
  Services.obs.addObserver(blocker, 'chrome-document-global-created', false);
  Services.obs.addObserver(blocker, 'content-document-global-created', false);

  const SSS = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  Services.obs.addObserver({
    observe(aSubject, aTopic, aData) {
      let style = `
        @namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
        @namespace html url("http://www.w3.org/1999/xhtml");
        @namespace xbl url("http://www.mozilla.org/xbl");

        @-moz-document
          url-prefix("chrome://browser/content/preferences/in-content/preferences.xul"),
          url-prefix("about:preferences") {
            #warnAddonInstall,
            #addonExceptions {
              visibility: collapse !important;
              -moz-user-focus: ignore !important;
            }
        }

        @-moz-document
          url-prefix("about:addons"),
          url-prefix("chrome://mozapps/content/extensions/extensions.xul") {
            /* buttons in richlistitems */
            *|button.addon-control.debug,
            *|button.addon-control.enable,
            *|button.addon-control.disable,
            *|button.addon-control.remove,
            *|button.addon-control.state,
            /* context menu items */
            *|menuitem[id="menuitem_enableItem"],
            *|menuitem[id="menuitem_disableItem"],
            *|menuitem[id="menuitem_installItem"],
            *|menuitem[id="menuitem_uninstallItem"],
            *|menuitem[id="menuitem_debugItem"],
            /* the gear button in the header */
            *|toolbarbutton[id="header-utils-btn"] {
              visibility: collapse !important;
              -moz-user-focus: none !important;
            }
        }
      `;
      let sheet = Services.io.newURI(`data:text/css,${encodeURIComponent(style)}`);
      if (!SSS.sheetRegistered(sheet, SSS.USER_SHEET))
        SSS.loadAndRegisterSheet(sheet, SSS.USER_SHEET);
    }
  }, 'final-ui-startup', false);
}
