// const UUID = import("https://jspm.dev/uuid");

const namespace = "5ceefcfb-4aa5-443a-bea6-1f8590231471";
const platform = "Rumble";
const channel = (() => {
    const path = document.location.pathname;
    if (path.startsWith("/chat/popup"))
        return path.split("/")[3];
    else
        return document.querySelector(".rumbles-vote-pill").dataset.id;
})();

var Rumble = () => {
    'use strict';

    var emotes = [];
    var eventSrc = null;

    async function fetchChatHistory() {
        eventSrc = new EventSource(`https://web7.rumble.com/chat/api/chat/${channel}/stream`, { withCredentials: true });

        eventSrc.onmessage = (event) => {
            switch (event.type) {
                case "init":
                case "message":
                    const messages = prepareChatMessages(JSON.parse(event.data));
                    if (messages.length > 0)
                        this.sendChatMessages(messages);

                    break;
            }
        };

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

    function receiveChatPairs(messages, users) {
        const newMessages = prepareChatMessages(messages, users);
        this.sendChatMessages(newMessages);
    }

    function prepareChatMessages(json) {
        const data = json.data;
        var messages = [];

        if (data.messages === undefined || data.users === undefined) {
            console.log("[SNEED] Unexpected input:", data);
            return messages;
        }

        data.messages.forEach((messageData, index) => {
            // const id = UUID.v5(messageData.id, NAMESPACE);
            const id = crypto.randomUUID();
            const message = ChatMessage(id, platform, channel);
            const user = data.users.find((user) => user.id === messageData.user_id);
            if (user === undefined) {
                console.log("[SNEED] User not found:", messageData.user_id);
                return;
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
            if (user['image.1'] !== undefined) {
                message.avatar = user['image.1'];
            }

            if (user.badges !== undefined) {
                user.badges.forEach((badge) => {
                    switch (badge) {
                        case "admin":
                            message.is_owner = true;
                            break;
                        case "moderator":
                            message.is_mod = true;
                            break;
                        case "whale-gray":
                        case "whale-blue":
                        case "whale-yellow":
                        case "locals":
                        case "locals_supporter":
                        case "recurring_subscription":
                            message.is_sub = true;
                            break;
                        case "premium":
                            break;
                        case "verified":
                            message.is_verified = true;
                            break;
                        default:
                            console.log(`[SNEED] Unknown badge type: ${badge.type}`);
                            break;
                    }
                });
            }

            if (messageData.rant !== undefined) {
                message.amount = messageData.rant.price_cents / 100;
                message.currency = "USD";
            }

            messages.push(message);
        });

        return messages;
    }

    /* TODO:
    async function onFetchResponse(response) {
        const url = new URL(response.url);
        if (url.searchParams.get('name') == "emote.list") {
            await response.json().then((json) => {
                json.data.items.forEach((channel) => {
                    if (channel.emotes !== undefined && channel.emotes.length > 0) {
                        channel.emotes.forEach((emote) => {
                            // emotes_pack_id: 1881816
                            // file: "https://ak2.rmbl.ws/z12/F/3/4/s/F34si.aaa.png"
                            // id: 139169247
                            // is_subs_only: false
                            // moderation_status: "NOT_MODERATED"
                            // name: "r+rumblecandy"
                            // pack_id: 1881816
                            // position: 0
                            emotes[emote.name] = emote.file;
                        });
                    }
                });
            });
        }
    }
    */

    return {
        fetchChatHistory
    };
};

var site = Rumble();
var seed = Seed();
var Feed = Object.assign(seed, site);
Feed.init();
