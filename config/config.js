// Referencing browser instead of chrome on chrome causes problems.
if (typeof browser === "undefined")
    var browser = chrome;

/// Set header icon to match the toolbar's.
async function matchHeaderIcon(iconPath) {
    // TODO: use SVG if available.
    document.querySelector("header img").setAttribute("src", `/${iconPath}`);
}

function fillConfig(cfg) {
    document.querySelectorAll("#options input").forEach((node) => {
        switch (node.getAttribute("name")) {
            case "useSeasonalIcons":
                node.checked = cfg.icon.useSeasonal;
                break;
        }
    });
}

browser.storage.local.get(["config"], (c) => {
    var cfg = c.config;

    matchHeaderIcon(cfg.icon.sizes.path[128]);
    fillConfig(cfg);
});
