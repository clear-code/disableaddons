/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
pref("extensions.update.enabled", false);
pref("xpinstall.enabled", false);
pref("extensions.showMismatchUI", false);

//We should keep the blocklist available, because it provides more information not only blocked addons...
// lockPref("extensions.blocklist.enabled", false);
// lockPref("extensions.blocklist.detailsURL", "");
// lockPref("extensions.blocklist.itemURL", "");
// lockPref("extensions.blocklist.url", "");

lockPref("extensions.getAddons.get.url", "");
lockPref("extensions.getAddons.getWithPerformance.url", "");
lockPref("extensions.getAddons.recommended.url", "");
lockPref("extensions.getAddons.search.browseURL", "");
lockPref("extensions.getAddons.search.url", "");

//Because the "share" button is out of control, keep it available.
// lockPref("extensions.webservice.discoverURL", "");

pref("extensions.disableaddons@clear-code.com.disable.manager", true);
