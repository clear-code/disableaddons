This disables add-on feature of Firefox and Thunderbird. After you install this, you never can install/manage addons anymore.

If you hope that the addon manager should be available only to list activated addons and change configurations, then:

    lockPref("extensions.disableaddons@clear-code.com.disable.manager", false);

This is mainly designed for corporate-use. To activate addon features, you have to uninstall this from your profile directory or other installed location by hand.
