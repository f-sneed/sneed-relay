// Referencing browser instead of chrome on chrome causes problems.
if (typeof browser === "undefined")
    superThis.browser = chrome;

// Define paths of extension pages.
const EXT_PAGES = {
    config: "config/config.html"
};

// Open settings page on toolbar icon click.
browser.browserAction.onClicked.addListener(() => {
    let cfgTab = browser.tabs.create({url: EXT_PAGES.config});
});

var Socket = (ip, port) => {
    'use strict'

    const DEBUG = true;

    var msgQueue = [];

    var socket = null;

    function debug(message, ...args) {
        if (DEBUG)
            log(message, ...args);
    }

    function log(message, ...args) {
        const logStr = `[SNEED] ${message}`;
        if (args.length > 0)
            console.log(logStr, ...args);
        else
            console.log(logStr);
    }

    function newSocket() {
        function onClose(event) {
            debug("Socket closed:", event);
            setTimeout(() => newSocket(), 3000);
        }

        function onError(event) {
            debug("Socket error:", event);
            socket.close();
        }

        function onMessage(event) {
            debug("Socket message received:", event);
        }

        function onOpen(event) {
            debug("Socket open:", event);
            sendMessages(msgQueue);
            msgQueue = [];
        }

        if (socketExists()) {
            log("Closing existing chat socket.");
            socket.close();
            return newSocket();
        }

        log("Creating new chat socket.");
        socket = new WebSocket(`ws://${ip}:${port}/relay.ws`);

        socket.addEventListener("close", onClose);
        socket.addEventListener("error", onError);
        socket.addEventListener("message", onMessage);
        socket.addEventListener("open", onOpen);

        return true;
    }

    function socketExists() {
        return socket !== null && socket.readyState === WebSocket.OPEN;
    }

    function sendMessages(messages) {
        console.debug("sendMessages:", messages);
        if (socketExists())
            socket.send(JSON.stringify(messages));
        else
            msgQueue.push(...messages);
    }

    newSocket();

    return {
        sendMessages
    };
};

var chatSocket = Socket("127.0.0.1", 1350);
browser.runtime.onMessage.addListener((msg) => {
    console.log("New message:", msg);
    chatSocket.sendMessages(msg);
});
