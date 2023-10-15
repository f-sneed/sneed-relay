const SOCKET_TIMEOUT = 3000;
const SOCKET_URI = "ws://localhost:1350/chat.ws";

var socket = new WebSocket(SOCKET_URI);

socket.addEventListener("open", (event) => {
    console.log("[SNEED] Connection established.");
});

socket.addEventListener("close", (event) => {
    console.log("[SNEED] Socket has closed. Attempting reconnect.", event.reason);
    setTimeout(() => { socket = new WebSocket(SOCKET_URI); }, SOCKET_TIMEOUT);
});

socket.addEventListener("error", (event) => {
    socket.close();
    setTimeout(() => { socket = new WebSocket(SOCKET_URI); }, SOCKET_TIMEOUT);
});

//
// Chat Messages
//
let MESSAGE_QUEUE = [];

const CREATE_MESSAGE = () => {
    return {
        id: crypto.randomUUID(),
        platform: "IDK",
        username: "DUMMY_USER",
        message: "",
        sent_at: Date.now(), // System timestamp for display ordering.
        received_at: Date.now(), // Local timestamp for management.
        avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
        is_premium: false,
        amount: 0,
        currency: "ZWL",
        is_verified: false,
        is_sub: false,
        is_mod: false,
        is_owner: false,
        is_staff: false,
    };
};

const BIND_MUTATION_OBSERVER = () => {
    const targetNode = GET_CHAT_CONTAINER();

    if (targetNode === null) {
        return false;
    }

    if (document.querySelector(".sneed-chat-container") !== null) {
        console.log("[SNEED] Chat container already bound, aborting.");
        return false;
    }

    targetNode.classList.add("sneed-chat-container");

    const observer = new MutationObserver(MUTATION_OBSERVE);
    observer.observe(targetNode, {
        childList: true,
        attributes: false,
        subtree: false
    });

    GET_EXISTING_MESSAGES();
    return true;
};

const MUTATION_OBSERVE = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const messages = HANDLE_MESSAGES(mutation.addedNodes);
            if (messages.length > 0) {
                SEND_MESSAGES(messages);
            }
        }
    }
};

const SEND_MESSAGES = (messages) => {
    // check if socket is open
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messages));
    }
    else {
        // add to queue if not
        messages.forEach((message) => {
            MESSAGE_QUEUE.push(messages);
        });
    }
};

setInterval(() => {
    if (document.querySelector(".sneed-chat-container") === null) {
        const chatContainer = GET_CHAT_CONTAINER();
        if (chatContainer !== null && !chatContainer.classList.contains("sneed-chat-container")) {
            console.log("[SNEED] Binding chat container.");
            BIND_MUTATION_OBSERVER();
        }
    }
}, 1000);
