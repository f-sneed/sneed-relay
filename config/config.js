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
        var nodePath = node.getAttribute("name").split("_");
        var option = nodePath.pop();

        var optionPath = cfg;
        nodePath.forEach((p) => {
            optionPath = optionPath[p];
        });

        switch (node.getAttribute("type")) {
            case "checkbox":
                node.checked = optionPath[option];
                break;
            case "text":
                node.value = optionPath[option];
                break;
        }
    });
}

browser.storage.local.get(["config"], (c) => {
    var cfg = c.config;

    matchHeaderIcon(cfg.icon.sizes.path[128]);
    fillConfig(cfg);

    document.querySelector("#save_btn").addEventListener("click", () => {
        document.querySelectorAll("#options input").forEach((node) => {
            var nodePath = node.getAttribute("name").split("_");
            var option = nodePath.pop();

            var optionPath = cfg;
            nodePath.forEach((p) => {
                optionPath = optionPath[p];
            });

            switch (node.getAttribute("type")) {
                case "checkbox":
                    optionPath[option] = node.checked;
                    break;
                case "text":
                    optionPath[option] = node.value;
                    break;
            }
        });

        browser.storage.local.set({config: cfg});
    });
});
