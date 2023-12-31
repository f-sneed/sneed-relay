if (typeof browser === "undefined")
    var browser = chrome;

var ChatMessage = (id, platform, channel) => {
    return {
        id,
        platform,
        channel,
        sent_at: Date.now(),
        received_at: Date.now(),
        message: "",
        username: "DUMMY_USER",
        avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", // Transparent pixel.
        amount: 0,
        currency: "ZWL",
        is_verified: false,
        is_sub: false,
        is_mod: false,
        is_owner: false,
        is_staff: false
    }
};

var Seed = () => {
    'use strict';

    const DEBUG = true;

    /// Channel name used as a token and in messages.
    /// UUID used for generating v5 UUIDs consistently to each platform.
    /// Platform name used as a token and in messages.

    /// Messages waiting to be sent to the Rust backend.
    var chatMessageQueue = [];
    /// Current connection to the Rust backend.
    var chatSocket = null;

    function debug(message, ...args) {
        if (DEBUG) {
            log(message, ...args);
        }
    }

    function log(message, ...args) {
        if (args.length > 0) {
            console.log(`[SNEED::${platform}] ${message}`, ...args);
        }
        else {
            console.log(`[SNEED::${platform}] ${message}`);
        }
    }

    /*
      async fetchDependencies() {
      window.UUID = await import('https://jspm.dev/uuid');
      }
    */

    function onDocumentReady() {
        debug("Document ready.");
    }

    //
    // Chat Socket
    //
    // Creates a WebSocket to the Rust chat server.
    function createChatSocket(ip, port) {
        if (chatSocket !== null && chatSocket.readyState === WebSocket.OPEN) {
            log("Chat socket already exists and is open.");
        } else {
            log("Creating chat socket.");
            const SOCKET_URL = `ws://${ip}:${port}/chat.ws`;
            const ws = new WebSocket(SOCKET_URL);
            ws.addEventListener("open", (event) => onChatSocketOpen(ws, event));
            ws.addEventListener("message", (event) => onChatSocketMessage(ws, event));
            ws.addEventListener("close", (event) => onChatSocketClose(ws, event));
            ws.addEventListener("error", (event) => onChatSocketError(ws, event));

            ws.sneed_socket = true;
            chatSocket = ws;
        }

        return chatSocket;
    }

    // Called when the chat socket is opened.
    function onChatSocketOpen(ws, event) {
        debug("Chat socket opened.");
        sendChatMessages(chatMessageQueue);
        chatMessageQueue = [];
    }

    // Called when the chat socket receives a message.
    function onChatSocketMessage(ws, event) {
        debug("Chat socket received data.", event);
    }

    // Called when the chat socket is closed.
    function onChatSocketClose(ws, event) {
        debug("Chat socket closed.", event);
        setTimeout(() => createChatSocket(), 3000);
    }

    // Called when the chat socket errors.
    function onChatSocketError(ws, event) {
        debug("Chat socket errored.", event);
        ws.close();
        setTimeout(() => createChatSocket(), 3000);
    }

    /// Sends messages to the Rust backend, or adds them to the queue.
    function sendChatMessages(messages) {
        // Check if the chat socket is open.
        if (chatSocket.readyState === WebSocket.OPEN && channel !== null) {
            // Send message queue to Rust backend.
            chatSocket.send(JSON.stringify({
                platform: platform,
                channel: channel,
                messages: messages,
            }));
        }
        else {
            // Add messages to queue.
            chatMessageQueue.push(...messages);
        }
    }

    // TODO: Figure out the patching shit.

    function fetchChatHistory() {
        return;
    }

    log("Initializing.");

    function init() {
        browser.storage.local.get(["config"], (c) => {
            var cfg = c.config;
            createChatSocket(cfg.server.ip, cfg.server.port);
            this.fetchChatHistory();
        });
    }

    return {
        init,
        sendChatMessages
    };
};
