const namespace = "5ceefcfb-4aa5-443a-bea6-1f8590231471";
const platform = "Rumble";
const channel = (() => {
    const path = document.location.pathname;
    return path.startsWith("/chat/popup") ? path.split("/")[3] : document.querySelector(".rumbles-vote-pill").dataset.id;
})();

var ChatMessage = (platform, channel) => {
    return {
        platform,
        channel,
        sent_at: Date.now(),
        received_at: Date.now(),
        message: "",
        username: "DUMMY_USER",
        avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", // Transparent pixel.
        amount: 0,
        currency: "XYZ",
        roles: []
    };
};

var Rumble = () => {
    'use strict';

    var emotes = [];
    var eventSrc = null;

    function fetchChatHistory() {
        eventSrc = new EventSource(`https://web7.rumble.com/chat/api/chat/${channel}/stream`, { withCredentials: true });

        eventSrc.onmessage = (async (event) => {
            switch (event.type) {
                case "init":
                case "message":
                    const messages = JSON.parse(event.data);
                    handleChatPairs(messages);
                    break;
                default:
                    console.debug("Unhandled EventSource event type:", event.type);
            }
        });

        eventSrc.error = () => {
            if (eventSrc.readyState === 2 && !reconnectTimeoutID) {
                reconnectTimeoutID = setTimeout(
                    () => {
                        reconnectTimeoutID = 0;
                        if (should_keep_alive)
                            eventSource = rumbleSocketConnect();
                    },
                    3000,
                );
            }
        };
    }

    function handleChatPairs(messages) {
        return prepareChatMessages(messages)
            .then((msgs) => {
                if (msgs.length === 0)
                    throw new Error("prepareChatMessages returned an empty array.");

                return msgs;
            })
            .then((msgs) => {
                return browser.runtime.sendMessage({
                    platform,
                    channel,
                    messages: msgs
                });
            });
    }

    function prepareChatMessages(json) {
        var messages = [];

        const data = json.data;
        if (data.messages === undefined || data.users === undefined)
            throw new Error("Unexpected input:" + data);

        return Promise.all(data.messages.map(async (messageData, index) => {
            // const id = UUID.v5(messageData.id, NAMESPACE);
            const id = crypto.randomUUID();
            const message = ChatMessage(platform, channel);
            const user = data.users.find((user) => user.id === messageData.user_id);
            if (user === undefined) {
                console.log("[SNEED] User not found:", messageData.user_id);
                return Promise.resolve(false);
            }

            message.sent_at = Date.parse(messageData.time);
            // replace :r+rumbleemoji: with <img> tags
            message.message = messageData.text.replace(/:(r\+.*?)\:/g, (match, id) => {
                if (emotes[id] !== undefined)
                    return `<img class="emoji" data-emote="${id}" src="${emotes[id]}" alt="${id}" />`;

                console.log(`no emote for ${id}`);
                return match;
            });

            message.username = user.username;
            if (user["image.1"] !== undefined)
                message.avatar = user["image.1"];

            if (user.badges !== undefined) {
                user.badges.forEach(async (badge) => {
                    switch (badge) {
                        case "admin":
                            message.roles.push("owner")
                            break;
                        case "moderator":
                            message.roles.push("mod")
                            break;
                        case "whale-gray":
                        case "whale-blue":
                        case "whale-yellow":
                        case "locals":
                        case "locals_supporter":
                        case "recurring_subscription":
                            message.roles.push("sub")
                            break;
                        case "premium":
                            break;
                        case "verified":
                            message.roles.push("verified")
                            break;
                        default:
                            console.log(`[SNEED] Unknown badge type: ${badge.type}`);
                    }
                });
            }

            if (messageData.rant !== undefined) {
                message.amount = messageData.rant.price_cents / 100;
                message.currency = "USD";
            }

            return message;
        }));
    }

    function init() {
        fetchChatHistory();
    }

    return {
        init
    };
};

var Feed = Rumble();
Feed.init();
