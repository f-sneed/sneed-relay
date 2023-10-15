const GET_CHAT_CONTAINER = () => {
    return document.getElementById("chat-history-list");
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
        let message = CREATE_MESSAGE();
        message.platform = "Rumble";

        const avatarEl = node.querySelector("img.chat-history--user-avatar");
        const picEl = node.querySelector(".chat--profile-pic");
        if (avatarEl !== null && avatarEl.src !== "") {
            console.log("Avatar", avatarEl.src);
            message.avatar = avatarEl.src;
        }
        else if (picEl !== null && picEl.style.backgroundImage !== "") {
            message.avatar = picEl.style.backgroundImage.replace('url("', "").replace('")', "");
            console.log("Profile Pic", picEl.style.backgroundImage);
        }


        if (node.classList.contains("chat-history--rant")) {
            message.username = node.querySelector(".chat-history--rant-username").innerText;
            message.message = node.querySelector(".chat-history--rant-text").innerHTML;
            message.is_premium = true;
            message.amount = parseFloat(node.querySelector(".chat-history--rant-price").innerText.replace("$", ""));
            message.currency = "USD"; // Rumble rants are always USD.
            console.log("Superchat", message);
        }
        else {
            message.username = node.querySelector(".chat-history--username").innerText;
            message.message = node.querySelector(".chat-history--message").innerHTML;
        }

        node.querySelectorAll(".chat-history--user-badge").forEach((badge) => {
            if (badge.src.includes("moderator")) {
                message.is_mod = true;
            }
            else if (badge.src.includes("locals") || badge.src.includes("whale")) {
                message.is_sub = true;
            }
            else if (badge.src.includes("admin")) {
                // misnomer: this is the streamer.
                message.is_owner = true;
            }
            // Rumble staff badge unknown.
        });

        console.log(message);
        messages.push(message);
    });

    return messages;
};

// <li class="chat-history--row" data-message-user-id="u64 goes here" data-message-id="u64 goes here">
// <img class="chat-history--user-avatar" src="https://sp.rmbl.ws/many/sub/dir/xxx.jpeg">
// <div class="chat-history--message-wrapper">
//   <div class="chat-history--username">
//     <a target="_blank" href="/user/username" style="color: #e1637f">UserName</a>
//   </div>
//   <div class="chat-history--badges-wrapper">
//     <img class="chat-history--user-badge" src="/i/badges/moderator_48.png" alt="Moderator" title="Moderator"></img>
//     <a href="/account/publisher-packages"><img class="chat-history--user-badge" src="/i/badges/premium_48.png" alt="Rumble Premium User" title="Rumble Premium User"></a>
//     <img class="chat-history--user-badge" src="/i/badges/locals_48.png" alt="Sub" title="Sub">
//     <img class="chat-history--user-badge" src="/i/badges/whale_yellow_48.png" alt="Supporter+" title="Supporter+">
//     <img class="chat-history--user-badge" src="/i/badges/admin_48.png" alt="Admin" title="Admin">
//   </div>
//   <div class="chat-history--message">USER CHAT MESSAGE</div>
// </div>
// </li>

// <li class="chat-history--row chat-history--rant" data-message-user-id="x" data-message-id="x">
// <div class="chat-history--rant" data-level="2">
//   <div class="chat-history--rant-head">
//     <div class="chat--profile-pic" style="margin-right: 1rem; background-image: url(&quot;https://sp.rmbl.ws/xxx&quot;);" data-large=""></div>
//       <div style="display: flex; flex-wrap: wrap; align-items: flex-end">
//         <a class="chat-history--rant-username" target="_blank" href="/user/xxx">xxx</a>
//         <div class="chat-history--badges-wrapper"><img class="chat-history--user-badge" src="/i/badges/whale_yellow_48.png" alt="Supporter+" title="Supporter+"></div>
//         <div class="chat-history--rant-price" style="width: 100%;">$2</div>
//       </div>
//     </div>
//     <div class="chat-history--rant-text">xxx</div>
//   </div>
// </div>
// </li>


// <li class="chat-history--row chat-history--rant" data-message-user-id="88707682" data-message-id="1182290124941408978"><div class="chat-history--rant" data-level="2">
// <div class="chat-history--rant-head">
// <div class="chat--profile-pic" style="margin-right: 1rem; background-image: url(&quot;https://sp.rmbl.ws/z0/I/j/z/s/Ijzsf.asF-1gtbaa-rpmd6x.jpeg&quot;);" data-large=""></div>
// <div style="display: flex; flex-wrap: wrap; align-items: flex-end">
// <a class="chat-history--rant-username" target="_blank" href="/user/madattheinternet">madattheinternet</a>
// <div class="chat-history--badges-wrapper"><img class="chat-history--user-badge" src="/i/badges/admin_48.png" alt="Admin" title="Admin"><a href="/account/publisher-packages"><img class="chat-history--user-badge" src="/i/badges/premium_48.png" alt="Rumble Premium User" title="Rumble Premium User"></a><img class="chat-history--user-badge" src="/i/badges/whale_gray_48.png" alt="Supporter" title="Supporter"></div>
// <div class="chat-history--rant-price" style="width: 100%;">$2</div>
// </div>
// </div>
// <div class="chat-history--rant-text">Testing superchats.</div>
// </div></li>
