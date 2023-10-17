const GET_CHAT_CONTAINER = () => {
    return document.querySelector(".chat-list--default .chat-scrollable-area__message-container");
};

const GET_EXISTING_MESSAGES = () => {
    console.log("[SNEED] Checking for existing messages.");
    const nodes = document.querySelectorAll(".sneed-chat-container .chat-line__message");

    if (nodes.length > 0) {
        const messages = HANDLE_MESSAGES(nodes);
        if (messages.length > 0) {
            SEND_MESSAGES(messages);
        }
    }
};

const HANDLE_MESSAGES = (nodes) => {
    const messages = [];

    nodes.forEach((node) => {
        let message = CREATE_MESSAGE();
        message.platform = "Twitch";
        const user = node.querySelector(".chat-line__username > span");
        const name = node.querySelector(".chat-author__display-name");

        node.querySelectorAll("[data-a-target='chat-badge']").forEach((badge) => {
            const img = badge.querySelector("img");

            const label = img.getAttribute("alt");
            switch (label) {
              case "Admin":
                  message.is_staff = true;
                  break;
              case "Broadcaster":
                  message.is_owner = true;
                  break;
              case "Moderator":
                  message.is_mod = true;
                  break;
              case "Prime Gaming":
              // Sub tiers necessitate this ugly hack. A better way probably exists.
              case /Subscriber/.test(label) && label:
                  message.is_sub = true;
                  break;
              case "Verified":
                  message.is_verified = true;
                  break;
              default:
                  img.removeAttribute("srcset");
                  user.insertBefore(img, name);
                  break;
            }
        });

        name.replaceWith(name.innerHTML);
        message.username = user.innerHTML;

        const msg_body = node.querySelector("[data-a-target='chat-line-message-body']");
        msg_body.querySelectorAll(".mention-fragment, .text-fragment").forEach((txt) => txt.replaceWith(txt.textContent));
        msg_body.querySelectorAll("[data-test-selector='emote-button']").forEach((emote) => {
            const img = emote.querySelector(".chat-image");
            img.removeAttribute("srcset");
            emote.replaceWith(img);
        });

        message.message = msg_body.innerHTML;

        if (node.classList.contains("channel-points-reward-line__icon")) {
            message.is_premium = true;

            message.currency = node.querySelector(".channel-points-icon__image").getAttribute("alt");
            message.amount = node.querySelector(".user-notice-line div:first-child").textContent;
        }

        messages.push(message);
    });

    return messages;
};
