// Referencing browser instead of chrome on chrome causes problems.
if (typeof browser === "undefined")
    var browser = chrome;

function newConfig() {
    return {
        icon: {
            name: "logo",
            sizes: {
                path: {
                    48: "static/icon/logo_48.png",
                    96: "static/icon/logo_96.png",
                    128: "static/icon/logo_128.png"
                }
            }
        }
    };
}

async function writeConfig() {
    console.debug("[SNEED] Config: Writing config to local storage.");
    return browser.storage.local.set({config: userConfig});
}

async function setNewIcon(name) {
    userConfig.icon.name = name;
    [48, 96, 128].forEach((s) => {
        userConfig.icon.sizes.path[s] = `static/icon/${userConfig.icon.name}_${s}.png`;
        console.debug(`[SNEED] Config: Created new icon set for ${userConfig.icon.name}.`);
    });

    browser.browserAction.setIcon(userConfig.icon.sizes);
    await writeConfig();
    console.debug(`[SNEED] Config: Set new icon ${userConfig.icon.name}.`);
}

var userConfig = newConfig();

async function eventIcons() {
    const date = new Date();
    switch(date.getMonth()) {
        case 9:
            if (userConfig.icon.name !== "halloween")
                setNewIcon("halloween");
            break;
    }
}

async function resetConfig() {
    userConfig = newConfig();
    await writeConfig();
    console.log("[SNEED] Config: Wrote default config to local storage.");
}

browser.storage.local.get(["config"], async (c) => {
    console.log(typeof c["config"]);
    if (typeof c["config"] !== "undefined") {
        console.debug("[SNEED] Config: Got config ", c);
        userConfig = c.config;
        browser.browserAction.setIcon(userConfig.icon.sizes);
    } else {
        console.debug("[SNEED] Config: No config found in storage. Initializing.");
        await writeConfig();
    }

    eventIcons();
});
