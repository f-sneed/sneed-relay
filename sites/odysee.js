const GET_CHAT_CONTAINER = () => {
    return document.querySelector(".livestream__comments");
};

const GET_EXISTING_MESSAGES = () => {
    console.log("[SNEED] Checking for existing messages.");
    const nodes = document.querySelectorAll(".sneed-chat-container .livestream__comment");
    if (nodes.length > 0) {
        const list = Array.prototype.slice.call(nodes);
        const messages = HANDLE_MESSAGES(list.reverse());
        if (messages.length > 0) {
            SEND_MESSAGES(messages);
        }
    }
};

const HANDLE_MESSAGES = (nodes) => {
    const messages = [];

    nodes.forEach((node) => {
        // Note about Odysee:
        // The DOM changes in realtime because for some reason the initial HTML gets modified a lot by JS.
        // Odysee's UI in general is very sluggish so a lot changes.
        // In particular, avatars appear to be GIF images that are frozen after a short time.
        const message = CREATE_MESSAGE();
        message.platform = "Odysee";
        message.sent_at = Date.parse(node.querySelector(".date_time").getAttribute("title"));

        // in strange conditions this can be null, I do not know why.
        const avatar = node.querySelector(".channel-thumbnail__custom, .freezeframe-img")?.src;
        if (typeof avatar === "string" && avatar.length > 0) {
            message.avatar = avatar;
        }
        message.username = node.querySelector(".comment__author").innerText;
        const messageEl = node.querySelector(".livestream-comment__text .markdown-preview");
        message.message = messageEl ? messageEl.innerText : "";

        const creditEl = node.querySelector(".credit-amount");
        if (creditEl !== null) {
            const amount = creditEl.innerText;
            // Ignore LBRY for now.
            if (amount.includes("$")) {
                message.is_premium = true;
                message.currency = "USD";
                message.amount = parseFloat(amount.replace("$", ""));
                console.log("Superchat!", message);
            }
        }

        if (node.querySelector(".icon--BadgeMod")) {
            message.is_mod = true;
        }
        if (node.querySelector(".icon--BadgeStreamer")) {
            message.is_owner = true;
        }

        console.log(message);
        messages.push(message);
    });

    return messages;
};

// <li class="livestream__comment">
//    <div class="livestream-comment__body">
//       <div class="channel-thumbnail channel-thumbnail__default--3 channel-thumbnail--xsmall"><img class="channel-thumbnail__custom" loading="lazy" src="https://thumbnails.odycdn.com/optimize/s:160:160/quality:85/plain/https://spee.ch/spaceman-png:2.png" style="visibility: visible;"></div>
//       <div class="livestream-comment__info">
//          <div class="livestream-comment__meta-information">
//             <button aria-expanded="false" aria-haspopup="true" aria-controls="menu--6430" class="button--uri-indicator comment__author" data-reach-menu-button="" type="button" id="menu-button--menu--6430">Schmuck</button>
//             <a class="button button--no-style" href="/$/premium">
//                <span class="button__content">
//                   <span class="comment__badge" aria-label="Premium+">
//                      <svg size="40" class="icon icon--PremiumPlus" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 30" width="40" height="40" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></svg>
//                   </span>
//                </span>
//             </a>
//             <span class="date_time" title="July 20, 2023 08:32 PM">1 minute ago</span>
//          </div>
//          <div class="livestream-comment__text">
//             <div dir="auto" class="notranslate markdown-preview">
//                <p><button aria-expanded="false" aria-haspopup="true" aria-controls="menu--6431" class="menu__button" data-reach-menu-button="" type="button" id="menu-button--menu--6431">@François_Le_Châtain</button> Sounds much like the movie GARP</p>
//             </div>
//          </div>
//       </div>
//    </div>
//    <div class="livestream-comment__menu">
//       <button aria-expanded="false" aria-haspopup="true" aria-controls="menu--6432" class="menu__button" data-reach-menu-button="" type="button" id="menu-button--menu--6432">
//          <svg size="18" class="icon icon--MoreVertical" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
//       </button>
//    </div>
// </li>
//
//
// $USD Superchat
//
// <li class="livestream__comment livestream__comment--hyperchat">
//     <div class="livestream-comment__hyperchat-banner">
//         <span title="1" class="credit-amount-wrapper hyperChat">
//             <span class="credit-amount">
//                 <p style="display: inline;">$1.00</p>
//             </span>
//         </span>
//     </div>
//     <div class="livestream-comment__body">
//         <div class="channel-thumbnail channel-thumbnail--xsmall freezeframe-wrapper">
//             <div class="ff-container ff-responsive ff-ready ff-inactive">
//                 <canvas class="ff-canvas ff-canvas-ready" width="64" height="64"> </canvas>
//                 <img class="freezeframe-img ff-image" src="https://thumbnails.odycdn.com/optimize/s:64:0/quality:95/plain/https://thumbs.odycdn.com/99bb5917edaae46dbecfce94512d9601.webp" style="background-image: url(&quot;&quot;);">
//             </div>
//         </div>
//         <div class="livestream-comment__info">
//             <div class="livestream-comment__meta-information"><button aria-expanded="false" aria-haspopup="true" aria-controls="menu--15248" class="button--uri-indicator comment__author" data-reach-menu-button="" type="button" id="menu-button--menu--15248">@Castoreum</button><span class="date_time" title="September 5, 2023 01:21 PM">7 minutes ago</span></div>
//             <div class="livestream-comment__text">
//                 <div dir="auto" class="notranslate markdown-preview">
//                     <p>whoosh</p>
//                 </div>
//             </div>
//         </div>
//     </div>
//     <div class="livestream-comment__menu">
//         <button aria-expanded="false" aria-haspopup="true" aria-controls="menu--15249" class="menu__button" data-reach-menu-button="" type="button" id="menu-button--menu--15249">
//             <svg size="18" class="icon icon--MoreVertical" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <g>
//                     <circle cx="12" cy="5" r="1"></circle>
//                     <circle cx="12" cy="12" r="1"></circle>
//                     <circle cx="12" cy="19" r="1"></circle>
//                 </g>
//             </svg>
//         </button>
//     </div>
// </li>
//
//
// $LBRY Superchat
//
// <li class="livestream__comment livestream__comment--hyperchat">
//     <div class="livestream-comment__hyperchat-banner">
//         <span title="5" class="credit-amount-wrapper hyperChat">
//             <span class="credit-amount">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="black" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="icon icon--LBC icon__lbc icon__lbc--after-text" aria-hidden="true">
//                     <path d="M1.03125 14.1562V9.84375L12 0L22.9688 9.84375V14.1562L12 24L1.03125 14.1562Z"></path>
//                     <path d="M8.925 10.3688L3.99375 14.8125L7.70625 18.15L12.6375 13.7063L8.925 10.3688Z"></path>
//                     <path d="M8.925 10.3688L15.1312 4.80005L12 1.98755L2.60625 10.425V13.575L3.99375 14.8125L8.925 10.3688Z"></path>
//                     <path d="M8.925 10.3688L3.99375 14.8125L7.70625 18.15L12.6375 13.7063L8.925 10.3688Z" fill="url(#paint0_linear07dfd500-efdf-4633-8826-4fd337e086b2)"></path>
//                     <path d="M8.925 10.3688L15.1312 4.80005L12 1.98755L2.60625 10.425V13.575L3.99375 14.8125L8.925 10.3688Z" fill="url(#paint1_linear07dfd500-efdf-4633-8826-4fd337e086b2)"></path>
//                     <path d="M15.075 13.6313L20.0062 9.1876L16.2937 5.8501L11.3625 10.2938L15.075 13.6313Z" fill="url(#paint2_linear07dfd500-efdf-4633-8826-4fd337e086b2)"></path>
//                     <path d="M15.075 13.6312L8.86875 19.2L12 22.0125L21.3937 13.575V10.425L20.0062 9.1875L15.075 13.6312Z" fill="url(#paint3_linear07dfd500-efdf-4633-8826-4fd337e086b2)"></path>
//                     <defs>
//                         <linearGradient id="paint0_linear07dfd500-efdf-4633-8826-4fd337e086b2" x1="3.7206" y1="14.2649" x2="15.1645" y2="14.2649" gradientUnits="userSpaceOnUse">
//                             <stop offset="0.2464" stop-color="#E700FF"></stop>
//                             <stop offset="0.3166" stop-color="#E804F9"></stop>
//                             <stop offset="0.4108" stop-color="#E90EE8"></stop>
//                             <stop offset="0.5188" stop-color="#EC1FCC"></stop>
//                             <stop offset="0.637" stop-color="#F037A5"></stop>
//                             <stop offset="0.7635" stop-color="#F45672"></stop>
//                             <stop offset="0.8949" stop-color="#FA7A36"></stop>
//                             <stop offset="1" stop-color="#FF9B00"></stop>
//                         </linearGradient>
//                         <linearGradient id="paint1_linear07dfd500-efdf-4633-8826-4fd337e086b2" x1="2.60274" y1="8.40089" x2="15.14" y2="8.40089" gradientUnits="userSpaceOnUse">
//                             <stop offset="0.4233" stop-color="#FABD09"></stop>
//                             <stop offset="0.8292" stop-color="#FA6B00"></stop>
//                         </linearGradient>
//                         <linearGradient id="paint2_linear07dfd500-efdf-4633-8826-4fd337e086b2" x1="6.8682" y1="14.1738" x2="25.405" y2="4.84055" gradientUnits="userSpaceOnUse">
//                             <stop stop-color="#BAFF8E"></stop>
//                             <stop offset="0.6287" stop-color="#008EBB"></stop>
//                         </linearGradient>
//                         <linearGradient id="paint3_linear07dfd500-efdf-4633-8826-4fd337e086b2" x1="25.2522" y1="6.08799" x2="3.87697" y2="27.836" gradientUnits="userSpaceOnUse">
//                             <stop stop-color="#BAFF8E"></stop>
//                             <stop offset="0.6287" stop-color="#008EBB"></stop>
//                         </linearGradient>
//                         <clipPath id="clip0">
//                             <rect width="24" height="24" fill="white"></rect>
//                         </clipPath>
//                     </defs>
//                 </svg>
//                 5
//             </span>
//         </span>
//     </div>
//     <div class="livestream-comment__body">
//         <div class="channel-thumbnail channel-thumbnail--xsmall"><img class="channel-thumbnail__custom" loading="lazy" src="https://thumbnails.odycdn.com/optimize/s:64:0/quality:95/plain/https://spee.ch/3/ecd2cbf1b977016d.jpg" style="visibility: visible;"></div>
//         <div class="livestream-comment__info">
//             <div class="livestream-comment__meta-information"><button aria-expanded="false" aria-haspopup="true" aria-controls="menu--24646" class="button--uri-indicator comment__author" data-reach-menu-button="" type="button" id="menu-button--menu--24646">Mad at the Internet</button><span class="date_time" title="September 5, 2023 11:37 AM">1 minute ago</span></div>
//             <div class="livestream-comment__text">
//                 <div dir="auto" class="notranslate markdown-preview">
//                     <p>Testing an Odysee integration.</p>
//                 </div>
//             </div>
//         </div>
//     </div>
//     <div class="livestream-comment__menu">
//         <button aria-expanded="false" aria-haspopup="true" aria-controls="menu--24647" class="menu__button" data-reach-menu-button="" type="button" id="menu-button--menu--24647">
//             <svg size="18" class="icon icon--MoreVertical" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <g>
//                     <circle cx="12" cy="5" r="1"></circle>
//                     <circle cx="12" cy="12" r="1"></circle>
//                     <circle cx="12" cy="19" r="1"></circle>
//                 </g>
//             </svg>
//         </button>
//     </div>
// </li>
