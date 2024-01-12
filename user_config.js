if (browser === undefined)
    superThis.browser = chrome;

var Config = () => {
    const DEFAULT_LOGO = "logo";

    /// Load user config from browser's local storage.
    /// Note: this does not conventionally load a config file from a path.
    function loadConfig(c) {
        var cfg = c["config"];
        if (cfg !== undefined) {
            console.debug("[SNEED::Config] Loaded config from local storage:", cfg);
            setIcon(cfg, cfg.icon.name);
        } else {
            console.log("[SNEED::Config] No config found in local storage. Initializing.");
            cfg = newConfig();
            writeConfig(cfg);
        }

        return cfg.icon.useSeasonal ? seasonalIcons(cfg) : setIcon(cfg, cfg.icon.name);
    }

    function newIconSet(name) {
        var paths = {};

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
                sizes: null,
                preferred: DEFAULT_LOGO,
                // Automatically switch to seasonal icons.
                useSeasonal: true
            },
            server: {
                ip: "127.0.0.1",
                port: 1350
            }
        };
    }

    function writeConfig() {
        return browser.storage.local.set({config: cfg})
                      .then(console.log("[SNEED::Config] Config written to local storage:", cfg));
    }

    function resetConfig() {
        console.log("[SNEED::Config] Re-initializing config.");
        cfg = newConfig();
        return writeConfig();
    }

    function setIcon(name) {
        cfg.icon.name = name;
        cfg.icon.sizes.path = newIconSet(name);

        return browser.browserAction.setIcon(cfg.icon.sizes)
                      .then(console.log(`[SNEED::Config] Set new icon ${cfg.icon.name}.`));
    }

    function seasonalIcons() {
        if (!cfg.icon.useSeasonal)
            return Promise.resolve(false);

        const date = new Date();
        var icon = DEFAULT_LOGO;
        switch (date.getMonth()) {
            case 9: // Yes, 9 is October here.
                icon = "halloween";
                break;
        }

        return setIcon(icon).then(writeConfig);
    }

    var cfg = browser.storage.local.get(["config"]);
    return cfg === undefined ? Promise.resolve(false) : cfg.then(loadConfig).then(Promise.resolve(cfg));
};

superThis.cfg = Config();
