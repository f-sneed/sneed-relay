// Referencing browser instead of chrome on chrome causes problems.
if (typeof browser === "undefined")
    var browser = chrome;

const DEFAULT_LOGO = "logo";

function newIconSet(name) {
    let paths = {};

    [48, 96, 128].forEach((s) => {
        // Chromium apparently doesn't like SVG icons.
        // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons
        paths[s] = `static/icon/${name}_${s}.png`;
    });
    console.debug(`[SNEED::Config] Created new icon set for ${name}.`);

    return paths;
}

function newConfig() {
    return {
        // Currently selected icon for the toolbar.
        icon: {
            name: DEFAULT_LOGO,
            sizes: {
                path: newIconSet(DEFAULT_LOGO)
            },
            preferred: DEFAULT_LOGO,
            // Automatically switch to seasonal icons.
            useSeasonal: true
        }
    };
}

async function writeConfig(cfg) {
    console.log("[SNEED::Config] Writing config to local storage.");

    try {
        browser.storage.local.set({config: cfg});
        console.log("[SNEED::Config] Config written to local storage:", cfg);
    } catch (e) {
        console.error("[SNEED::Config] Error writing config to local storage:", e);
        return false;
    }

    return true;
}

function resetConfig() {
    console.log("[SNEED::Config] Re-initializing config.");
    var cfg = newConfig();
    // Directly pass the Promise and let the caller decide on locking.
    return writeConfig(cfg);
}

async function setIcon(cfg, name, newSet=false) {
    cfg.icon.name = name;

    // Only generate a new set if necessary.
    if (newSet) {
        cfg.icon.sizes.path = newIconSet(name);
        writeConfig(cfg);
    }

    try {
        await browser.browserAction.setIcon(cfg.icon.sizes);
        console.log(`[SNEED::Config] Set new icon ${cfg.icon.name}.`);
    } catch (e) {
        console.error("[SNEED::Config] Error setting toolbar icon:", e);
        return false;
    }

    return true;
}

async function seasonalIcons(cfg) {
    const date = new Date();
    switch(date.getMonth()) {
        case 9: // Yes, 9 is October here.
            if (cfg.icon.name !== "halloween");
                setIcon(cfg, "halloween", newSet=true);
            break;
        default:
            // Reset outdated seasonal icon.
            setIcon(cfg, DEFAULT_LOGO, newSet=true);
            break;
    }
}

/// Load user config from browser's local storage.
/// Note: this does not conventionally load a config file from a path.
async function loadConfig(c) {
    var cfg = {};
    if (typeof c["config"] !== "undefined") {
        console.debug("[SNEED::Config] Loaded config from local storage:", c.config);
        cfg = c.config;
        await setIcon(cfg, cfg.icon.name);
    } else {
        console.log("[SNEED::Config] No config found in local storage. Initializing.");
        cfg = newConfig();
        // Avoid potential races, especially here.
        await writeConfig(cfg);
    }

    if (cfg.icon.useSeasonal)
        seasonalIcons(cfg);
}

browser.storage.local.get(["config"], loadConfig);
