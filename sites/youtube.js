// Attempts to switch to Live Chat from Top Chat.
// Returns TRUE if we can proceed to checking the MutationObserver is wokring.
// Returns FALSE if the chat isn't found.
const YOUTUBE_LIVE_CHAT = () => {
    const chatContainer = GET_CHAT_CONTAINER();

    if (chatContainer === null) {
        console.log("[SNEED] Awaiting live chat container...");
        return false;
    }

    const chatApp = chatContainer.closest("yt-live-chat-app");
    const dropdownEl = chatApp.querySelector("#label.yt-dropdown-menu");
    const liveEl = chatApp.querySelectorAll("#item-with-badge.yt-dropdown-menu")[1];

    if (dropdownEl === null || liveEl === undefined) {
        console.log("[SNEED] No live chat dropdown menu.");
        console.log(dropdownEl, liveEl);
        return false;
    }

    if (dropdownEl.textContent.trim() == liveEl.textContent.trim()) {
        // We're already live chat.
        return true;
    }

    liveEl.closest("a").click();
    console.log("[SNEED] Live chat activated. Eat it, Neal!");
    return true;
}

const GET_CHAT_CONTAINER = () => {
    const chatFrame = document.querySelector("#chatframe.ytd-live-chat-frame");
    const targetDoc = chatFrame === null ? document : chatFrame.contentWindow.document;
    return targetDoc.querySelector("#items.yt-live-chat-item-list-renderer");
};

const GET_EXISTING_MESSAGES = () => {
    console.log("[SNEED] Checking for existing messages.");
    const nodes = GET_CHAT_CONTAINER().childNodes;

    if (nodes.length > 0) {
        const messages = HANDLE_MESSAGES(nodes);
        if (messages.length > 0) {
            SEND_MESSAGES(messages);
        }
    }
}

const HANDLE_MESSAGES = (nodes) => {
    const messages = [];

    nodes.forEach((node) => {
        const tag = node.tagName.toLowerCase();
        if (tag != 'yt-live-chat-text-message-renderer' && tag != 'yt-live-chat-paid-message-renderer') {
            return;
        }

        let message = CREATE_MESSAGE();
        message.platform = "YouTube";
        message.received_at = Date.now(); // Rumble provides no information.

        message.avatar = node.querySelector("yt-img-shadow img").src;
        message.username = node.querySelector("[id='author-name']").innerText;
        message.message = node.querySelector("[id='message']").innerHTML;

        if (tag === "yt-live-chat-paid-message-renderer") {
            const dono = node.querySelector("#purchase-amount").innerText;
            message.is_premium = true;
            const amt = dono.replace(/[^0-9.-]+/g, "");
            message.amount = Number(amt);
            // get index of first number or whitespace in dono
            //const currency = dono.substring(0, dono.indexOf(" ")).trim();
            const currency = dono.split(/[0-9 ]/)[0].trim();
            // ## TODO ## YT superchats are MANY currencies.
            switch (currency) {
              case "$": message.currency = "USD"; break;
              case "CA$": message.currency = "CAD"; break;
              case "C$": message.currency = "NIO"; break; // I think this is Nicaraguan Cordoba and not Canadian Dollar.
              case "A$": message.currency = "AUD"; break;
              case "NZ$": message.currency = "NZD"; break;
              case "NT$": message.currency = "TWD"; break;
              case "R$": message.currency = "BRL"; break;
              case "MX$": message.currency = "MXN"; break;
              case "HK$": message.currency = "HKD"; break;
              case "£": message.currency = "GBP"; break;
              case "€": message.currency = "EUR"; break;
              case "₽": message.currency = "RUB"; break;
              case "₹": message.currency = "INR"; break;
              case "¥": message.currency = "JPY"; break;
              case "₩": message.currency = "KRW"; break;
              case "₱": message.currency = "PHP"; break;
              case "₫": message.currency = "VND"; break;
              default:
                  // Many YT currencies are actually the currency code.
                  if (currency.length === 3) {
                      message.currency = currency;
                  }
                  else {
                      console.log("[SNEED] Unknown currency: " + currency);
                      message.currency = "ZWD";
                  }
            }
        }

        // The owner and subs copme from a top-level [author-type].
        const authorType = node.getAttribute("author-type");
        if (typeof authorType === "string") {
            if (authorType.includes("owner")) {
                message.is_owner = true;
            }
            if (authorType.includes("moderator")) {
                message.is_mod = true;
            }
            if (authorType.includes("member")) {
                message.is_sub = true;
            }
        }

        // "Verified" is exclusively denominated by a badge, but other types can be found that way too.
        // Whatever, just check the badges too.
        node.querySelectorAll("yt-live-chat-author-badge-renderer.yt-live-chat-author-chip").forEach((badge) => {
            switch (badge.getAttribute("type")) {
              case "moderator": message.is_mod = true; break;
              case "verified": message.is_verified = true; break;
              case "member": message.is_sub = true; break;

            }
            // I don't think YouTube staff will ever use live chat?
        });

        if (tag == 'yt-live-chat-paid-message-renderer') {
            console.log("superchat", node);
        }


        messages.push(message);
    });

    return messages;
};

//
// https://www.youtube.com/live/UicP06m9IQY
// https://www.youtube.com/live_chat?is_popout=1&v=UicP06m9IQY
//
//
// These samples taken on 2023-JUL-19
//
// Regular Message
//
// <yt-live-chat-text-message-renderer class="style-scope yt-live-chat-item-list-renderer" modern="" id="ChwKGkNOaTg4ZnpzbTRBREZZdjJGZ2tkWDJZUHJ3" author-type="">
//   <!--css-build:shady-->
//   <!--css-build:shady-->
//   <yt-img-shadow id="author-photo" class="no-transition style-scope yt-live-chat-text-message-renderer" height="24" width="24" style="background-color: transparent;" loaded="">
//     <!--css-build:shady-->
//     <!--css-build:shady--><img id="img" draggable="false" class="style-scope yt-img-shadow" alt="" height="24" width="24" src="https://yt4.ggpht.com/ytc/AOPolaSlOaa0jzjlhZaoRZzT40ewoZHpvcwnSal4JGvtrQ=s64-c-k-c0x00ffffff-no-rj">
//   </yt-img-shadow>
//   <div id="content" class="style-scope yt-live-chat-text-message-renderer">
//     <span id="timestamp" class="style-scope yt-live-chat-text-message-renderer">5:47 PM</span>
//     <yt-live-chat-author-chip class="style-scope yt-live-chat-text-message-renderer">
//       <!--css-build:shady-->
//       <!--css-build:shady-->
//       <span id="prepend-chat-badges" class="style-scope yt-live-chat-author-chip"></span>
//       <span id="chat-badges" class="style-scope yt-live-chat-author-chip">
//         <yt-live-chat-author-badge-renderer class="style-scope yt-live-chat-author-chip" aria-label="Moderator" type="moderator" shared-tooltip-text="Moderator">
//           <!--css-build:shady--><!--css-build:shady-->
//           <div id="image" class="style-scope yt-live-chat-author-badge-renderer">
//             <yt-icon class="style-scope yt-live-chat-author-badge-renderer">
//               <!--css-build:shady--><!--css-build:shady-->
//               <yt-icon-shape class="style-scope yt-icon">
//                 <icon-shape class="yt-spec-icon-shape">
//                   <div style="width: 100%; height: 100%; fill: currentcolor;">
//                     <svg viewBox="0 0 16 16" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
//                       <path d="M9.64589146,7.05569719 C9.83346524,6.562372 9.93617022,6.02722257 9.93617022,5.46808511 C9.93617022,3.00042984 7.93574038,1 5.46808511,1 C4.90894765,1 4.37379823,1.10270499 3.88047304,1.29027875 L6.95744681,4.36725249 L4.36725255,6.95744681 L1.29027875,3.88047305 C1.10270498,4.37379824 1,4.90894766 1,5.46808511 C1,7.93574038 3.00042984,9.93617022 5.46808511,9.93617022 C6.02722256,9.93617022 6.56237198,9.83346524 7.05569716,9.64589147 L12.4098057,15 L15,12.4098057 L9.64589146,7.05569719 Z"></path>
//                     </svg>
//                   </div>
//                 </icon-shape>
//               </yt-icon-shape>
//             </yt-icon>
//           </div>
//         </yt-live-chat-author-badge-renderer>
//       </span>
//       <span id="author-name" dir="auto" class="moderator style-scope yt-live-chat-author-chip style-scope yt-live-chat-author-chip">
//         Nightbot
//         <span id="chip-badges" class="style-scope yt-live-chat-author-chip">
//           <yt-live-chat-author-badge-renderer class="style-scope yt-live-chat-author-chip" aria-label="Verified" type="verified" shared-tooltip-text="Verified">
//             <!--css-build:shady--><!--css-build:shady-->
//             <div id="image" class="style-scope yt-live-chat-author-badge-renderer">
//               <yt-icon class="style-scope yt-live-chat-author-badge-renderer">
//                 <!--css-build:shady--><!--css-build:shady-->
//                 <yt-icon-shape class="style-scope yt-icon">
//                   <icon-shape class="yt-spec-icon-shape">
//                     <div style="width: 100%; height: 100%; fill: currentcolor;">
//                       <svg viewBox="0 0 16 16" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
//                         <path transform="scale(0.66)" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
//                       </svg>
//                     </div>
//                   </icon-shape>
//                 </yt-icon-shape>
//               </yt-icon>
//             </div>
//           </yt-live-chat-author-badge-renderer>
//         </span>
//       </span>
//     </yt-live-chat-author-chip>&ZeroWidthSpace;<span id="message" dir="auto" class="style-scope yt-live-chat-text-message-renderer">hambone</span><span id="deleted-state" class="style-scope yt-live-chat-text-message-renderer"></span><a id="show-original" href="#" class="style-scope yt-live-chat-text-message-renderer"></a>
//   </div>
//   <div id="menu" class="style-scope yt-live-chat-text-message-renderer">
//     <yt-icon-button id="menu-button" class="style-scope yt-live-chat-text-message-renderer">
//       <!--css-build:shady-->
//       <!--css-build:shady--><button id="button" class="style-scope yt-icon-button" aria-label="Chat actions">
//         <yt-icon icon="more_vert" class="style-scope yt-live-chat-text-message-renderer">
//           <!--css-build:shady-->
//           <!--css-build:shady-->
//           <yt-icon-shape class="style-scope yt-icon">
//             <icon-shape class="yt-spec-icon-shape">
//               <div style="width: 100%; height: 100%; fill: currentcolor;"><svg enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
//                   <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
//                 </svg></div>
//             </icon-shape>
//           </yt-icon-shape>
//         </yt-icon>
//       </button>
//       <yt-interaction id="interaction" class="circular style-scope yt-icon-button">
//         <!--css-build:shady-->
//         <!--css-build:shady-->
//         <div class="stroke style-scope yt-interaction"></div>
//         <div class="fill style-scope yt-interaction"></div>
//       </yt-interaction>
//     </yt-icon-button>
//   </div>
//   <div id="inline-action-button-container" class="style-scope yt-live-chat-text-message-renderer" aria-hidden="true">
//     <div id="inline-action-buttons" class="style-scope yt-live-chat-text-message-renderer"></div>
//   </div>
// </yt-live-chat-text-message-renderer>
//
//
// Paid Message
//
//<yt-live-chat-paid-message-renderer class="style-scope yt-live-chat-item-list-renderer" modern="" id="ChwKGkNJLUpqWUx0bTRBREZaMGIxZ0FkWEtvRHh3" allow-animations="" style="--yt-live-chat-paid-message-primary-color: rgba(0,229,255,1); --yt-live-chat-paid-message-secondary-color: rgba(0,184,212,1); --yt-live-chat-paid-message-header-color: rgba(0,0,0,1); --yt-live-chat-paid-message-timestamp-color: rgba(0,0,0,0.5019607843137255); --yt-live-chat-paid-message-color: rgba(0,0,0,1); --yt-live-chat-disable-highlight-message-author-name-color: rgba(0,0,0,0.7019607843137254);"><!--css-build:shady--><!--css-build:shady--><div id="card" class="style-scope yt-live-chat-paid-message-renderer">
//  <div id="header" class="style-scope yt-live-chat-paid-message-renderer">
//
//    <yt-img-shadow id="author-photo" height="40" width="40" class="style-scope yt-live-chat-paid-message-renderer no-transition" style="background-color: transparent;" loaded=""><!--css-build:shady--><!--css-build:shady-->
//      <img id="img" draggable="false" class="style-scope yt-img-shadow" alt="" height="40" width="40" src="https://yt4.ggpht.com/ytc/AOPolaSwvFOIx2wDgFqnNL-uiwWhPh-e3-kMRnRx6ymPlg=s64-c-k-c0x00ffffff-no-rj">
//     </yt-img-shadow>
//    <dom-if restamp="" class="style-scope yt-live-chat-paid-message-renderer"><template is="dom-if"></template></dom-if>
//    <dom-if class="style-scope yt-live-chat-paid-message-renderer"><template is="dom-if"></template></dom-if>
//    <dom-if restamp="" class="style-scope yt-live-chat-paid-message-renderer"><template is="dom-if"></template></dom-if>
//    <div id="header-content" class="style-scope yt-live-chat-paid-message-renderer">
//      <div id="header-content-primary-column" class="style-scope yt-live-chat-paid-message-renderer">
//        <div id="author-name-chip" class="style-scope yt-live-chat-paid-message-renderer">
//          <yt-live-chat-author-chip disable-highlighting="" class="style-scope yt-live-chat-paid-message-renderer"><!--css-build:shady--><!--css-build:shady--><span id="prepend-chat-badges" class="style-scope yt-live-chat-author-chip"></span><span id="author-name" dir="auto" class=" style-scope yt-live-chat-author-chip style-scope yt-live-chat-author-chip">Mike<span id="chip-badges" class="style-scope yt-live-chat-author-chip"></span></span><span id="chat-badges" class="style-scope yt-live-chat-author-chip"></span></yt-live-chat-author-chip>
//        </div>
//        <div id="purchase-amount-column" class="style-scope yt-live-chat-paid-message-renderer">
//          <yt-img-shadow id="currency-img" height="16" width="16" class="style-scope yt-live-chat-paid-message-renderer no-transition" hidden=""><!--css-build:shady--><!--css-build:shady--><img id="img" draggable="false" class="style-scope yt-img-shadow" alt="" height="16" width="16"></yt-img-shadow>
//          <div id="purchase-amount" class="style-scope yt-live-chat-paid-message-renderer">
//            <yt-formatted-string class="style-scope yt-live-chat-paid-message-renderer">CA$2.79</yt-formatted-string>
//          </div>
//        </div>
//      </div>
//      <span id="timestamp" class="style-scope yt-live-chat-paid-message-renderer">5:47 PM</span>
//      <div id="gradient-container" class="style-scope yt-live-chat-paid-message-renderer">
//        <div id="gradient" class="style-scope yt-live-chat-paid-message-renderer"></div>
//      </div>
//      <div id="menu" class="style-scope yt-live-chat-paid-message-renderer">
//        <yt-icon-button id="menu-button" class="style-scope yt-live-chat-paid-message-renderer"><!--css-build:shady--><!--css-build:shady--><button id="button" class="style-scope yt-icon-button" aria-label="Chat actions">
//          <yt-icon icon="more_vert" class="style-scope yt-live-chat-paid-message-renderer"><!--css-build:shady--><!--css-build:shady--><yt-icon-shape class="style-scope yt-icon"><icon-shape class="yt-spec-icon-shape"><div style="width: 100%; height: 100%; fill: currentcolor;"><svg enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path></svg></div></icon-shape></yt-icon-shape></yt-icon>
//        </button><yt-interaction id="interaction" class="circular style-scope yt-icon-button"><!--css-build:shady--><!--css-build:shady--><div class="stroke style-scope yt-interaction"></div><div class="fill style-scope yt-interaction"></div></yt-interaction></yt-icon-button>
//      </div>
//      <div id="creator-heart-button" class="style-scope yt-live-chat-paid-message-renderer"></div>
//    </div>
//  </div>
//  <div id="content" class="style-scope yt-live-chat-paid-message-renderer">
//    <div id="message" dir="auto" class="style-scope yt-live-chat-paid-message-renderer">you skipped my dono to talk about sausage wtf</div>
//    <div id="input-container" class="style-scope yt-live-chat-paid-message-renderer">
//      <dom-if class="style-scope yt-live-chat-paid-message-renderer"><template is="dom-if"></template></dom-if>
//    </div>
//    <yt-formatted-string id="deleted-state" class="style-scope yt-live-chat-paid-message-renderer" is-empty=""><!--css-build:shady--><!--css-build:shady--><yt-attributed-string class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
//    <div id="footer" class="style-scope yt-live-chat-paid-message-renderer"></div>
//  </div>
//</div>
// <div id="lower-bumper" class="style-scope yt-live-chat-paid-message-renderer"></div>
// <div id="buy-flow-button" class="style-scope yt-live-chat-paid-message-renderer" hidden=""></div>
// <div id="inline-action-button-container" class="style-scope yt-live-chat-paid-message-renderer" aria-hidden="true">
//   <div id="inline-action-buttons" class="style-scope yt-live-chat-paid-message-renderer"></div>
// </div>
// </yt-live-chat-paid-message-renderer>
