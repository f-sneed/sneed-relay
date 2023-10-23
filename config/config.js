// Referencing browser instead of chrome on chrome causes problems.
if (typeof browser === "undefined")
    var browser = chrome;

browser.storage.local.get(["config"], (c) => {
    let userConfig = c.config;
    document.querySelector("header img").setAttribute("src", `/${userConfig.icon.sizes.path[128]}`);
});
