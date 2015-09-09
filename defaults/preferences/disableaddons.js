/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
pref("extensions.update.enabled", false);
pref("xpinstall.enabled", false);
pref("extensions.showMismatchUI", false);

//We should keep the blocklist available, because it provides more information not only blocked addons...
// pref("extensions.blocklist.enabled", false);
// pref("extensions.blocklist.detailsURL", "");
// pref("extensions.blocklist.itemURL", "");
// pref("extensions.blocklist.url", "");

pref("extensions.getAddons.get.url", "");
pref("extensions.getAddons.getWithPerformance.url", "");
pref("extensions.getAddons.recommended.url", "");
pref("extensions.getAddons.search.browseURL", "");
pref("extensions.getAddons.search.url", "");

//Because the "share" button is out of control, keep it available.
// pref("extensions.webservice.discoverURL", "");

pref("extensions.disableaddons@clear-code.com.disable.manager", true);
