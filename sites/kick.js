const GET_CHAT_CONTAINER = () => {
    return document.querySelector("#chatroom .overflow-y-scroll");
};

const GET_EXISTING_MESSAGES = () => {
    console.log("[SNEED] Checking for existing messages.");
    const nodes = document.querySelectorAll(".sneed-chat-container .chat-history--row");

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
        // Kick actually has its own UUID parameter, generously.
        switch (node.dataset.chatEntry ?? '') {
          case 'history_breaker': break;
          case '': break;
          default:
              let message = CREATE_MESSAGE();
              message.id = node.dataset.chatEntry;
              message.platform = "Kick";
              // Kick avatars are not readily available, so use the favicon.
              // Removed 1-Sep-23 to make way for letter avatars.
              //message.avatar = document.querySelector("link[rel='apple-touch-icon-precomposed'][sizes='144x144']").href;

              const userEl = node.querySelector(".chat-entry-username");
              const textEl = node.querySelector(".chat-entry-content");
              const emoteEl = node.querySelector(".chat-emote");

              message.username = userEl ? userEl.innerText.trim() : "";
              message.message = "";
              message.message += textEl ? textEl.innerHTML.trim() : "";
              message.message += emoteEl ? emoteEl.outerHTML.trim() : "";

              if (userEl === null) {
                  console.log("No username?", node);
              }

              // Kick's badge system is a total disaster and there is zero consistency.
              message.is_owner = node.querySelector("#Badge_Chat_host") !== null; // Consistent?
              message.is_verified = node.querySelector("#badge-verified-gradient") !== null; // Consistent?
              message.is_mod = node.querySelector("[data-v-fa8cab30]") !== null; // This changes periodically.
              // There are many images for this, including custom <img> tags for verified users, and <svg> generics.
              //message.is_sub = node.querySelector("[data-v-df7f331e]") !== null;

              // These are weird Kick-unique things. It's kind of like being knighted by a gambler.
              // #badge-vip-gradient
              // #badge-og-gradient-2

              messages.push(message);
              break;
        };
    });

    return messages;
};

// Kick message (chat emote)
//
//<div data-v-5e52272e="" data-chat-entry="90ba6e13-5155-4627-a3d6-e57f88ef2e86" class="mt-0.5">
//  <div class="chat-entry">
//    <!---->
//    <div>
//      <!---->
//      <!---->
//      <span data-v-bb151e01="" class="chat-message-identity">
//        <span data-v-bb151e01="" class="inline-flex translate-y-[3px]"></span>
//        <span data-v-b433ad78="" data-v-bb151e01="" class="chat-entry-username" data-chat-entry-user="rsturbo" data-chat-entry-user-id="4425316" style="color: rgb(188, 102, 255);">RSTurbo</span>
//      </span>
//      <span class="font-bold text-white">: </span>
//      <span data-v-89ba08de="">
//        <div data-v-31c262c8="" data-v-89ba08de="" class="chat-emote-container">
//          <div data-v-31c262c8="" class="relative">
//            <img data-v-31c262c8="" data-emote-name="KEKW" data-emote-id="37226" src="https://files.kick.com/emotes/37226/fullsize" alt="KEKW" class="chat-emote"></div>
//        </div>
//      </span>
//      <!---->
//    </div>
//    <!---->
//  </div>
//</div>
//
//<div data-v-5e52272e="" data-chat-entry="90ba6e13-5155-4627-a3d6-e57f88ef2e86" class="mt-0.5">
//  <div class="chat-entry">
//    <!---->
//    <div>
//      <!---->
//      <!---->
//      <span data-v-bb151e01="" class="chat-message-identity">
//        <span data-v-bb151e01="" class="inline-flex translate-y-[3px]"></span>
//        <span data-v-b433ad78="" data-v-bb151e01="" class="chat-entry-username" data-chat-entry-user="rsturbo" data-chat-entry-user-id="4425316" style="color: rgb(188, 102, 255);">RSTurbo</span>
//      </span>
//      <span class="font-bold text-white">: </span>
//      <span data-v-89ba08de="" class="chat-entry-content">Its Lil durks</span>
//      <!---->
//    </div>
//    <!---->
//  </div>
//</div>
