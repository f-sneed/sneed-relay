// Referencing browser instead of chrome on chrome causes problems.
if (typeof browser === "undefined")
    var browser = chrome;

// Define paths of extension pages.
const EXT_PAGES = {
    config: "config/config.html"
};

// Open settings page on toolbar icon click.
browser.browserAction.onClicked.addListener(() => {
    let cfgTab = browser.tabs.create({url: EXT_PAGES.config});
});
