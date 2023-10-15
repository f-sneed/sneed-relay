const GET_CHAT_CONTAINER = () => {
    return document.querySelector(".mv_chat_messages .ui_scroll_content");
};

const GET_EXISTING_MESSAGES = () => {
    console.log("[SNEED] Checking for existing messages.");
    const nodes = document.querySelectorAll(".sneed-chat-container .mv_chat_message");

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
        message.platform = "VK";
        message.avatar = node.querySelector(".mv_chat_message_author_thumb_img").src ?? message.avatar;

        // VK does not have superchats as far as I'm aware.
        message.username = node.querySelector(".mv_chat_message_author_name_text").innerText;
        message.message = node.querySelector(".mv_chat_message_text").innerHTML;
        message.is_premium = false;

        // I don't think VK has badges either??

        messages.push(message);
    });

    return messages;
};

// jesus christ this is nice and easy
//
// <div class="mv_chat_message " id="mv_chat_msg-25380626_476098" data-msg-id="476098">
//   <a class="mv_chat_message_author_thumb" href="/podstanicky" target="_blank">
//     <img loading="lazy" class="mv_chat_message_author_thumb_img" src="https://sun6-23.userapi.com/s/v1/ig2/afVd5nKHKmQJXPSe8vexHvk4o0N-Q-jbF8khkMpJ2jwZ-EE3P_Hze4rP3yta9i3jYSNoDXKsRQrnS9sXl73VnAJ8.jpg?size=50x50&amp;quality=96&amp;crop=512,192,1536,1536&amp;ava=1">
//   </a>
//   <div class="mv_chat_message_content">
//     <a class="mv_chat_message_author_name" href="/podstanicky" target="_blank"><div class="mv_chat_message_author_name_text">Leo Podstanicky</div></a>
//     <div class="mv_chat_message_text">spasibo</div>
//   </div>
//   <div class="mv_chat_message_actions"><a class="mv_chat_message_action" onclick="VideoChat.showReportVideoChatCommentForm(-25380626, 476098)" aria-label="Report" onmouseover="showTooltip(this, {text:  'Report', black: 1, shift: [0, 8, 0], center: 1})">
//   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 10 5.5Zm-.9 8.4a.9.9 0 1 1 1.8 0 .9.9 0 0 1-1.8 0Z"></path><path fill-rule="evenodd" d="m17.33 14.81-2.52 2.52c-.43.43-.65.65-.9.8a2.5 2.5 0 0 1-.72.3c-.29.07-.6.07-1.2.07H8c-.6 0-.91 0-1.2-.07a2.5 2.5 0 0 1-.72-.3 5.29 5.29 0 0 1-.9-.8L2.66 14.8c-.43-.43-.65-.64-.8-.9a2.5 2.5 0 0 1-.3-.72c-.07-.29-.07-.6-.07-1.2V8c0-.6 0-.91.07-1.2a2.5 2.5 0 0 1 .3-.72c.15-.26.37-.47.8-.9L5.2 2.67c.43-.43.64-.65.9-.8a2.5 2.5 0 0 1 .72-.3c.29-.07.6-.07 1.2-.07h3.97c.61 0 .92 0 1.2.07a2.5 2.5 0 0 1 .73.3c.25.15.47.37.9.8l2.52 2.52c.43.43.64.64.8.9.14.22.24.46.3.72.07.29.07.6.07 1.2V12c0 .6 0 .91-.07 1.2a2.5 2.5 0 0 1-.3.72c-.16.26-.37.47-.8.9Zm-.48-1.7c-.06.1-.15.19-.32.36l-3.06 3.06c-.18.17-.26.26-.36.32a1 1 0 0 1-.3.12c-.1.03-.23.03-.47.03H7.66c-.24 0-.37 0-.48-.03a1 1 0 0 1-.29-.12c-.1-.06-.19-.15-.36-.32l-3.06-3.06a2.06 2.06 0 0 1-.32-.36 1 1 0 0 1-.12-.3c-.03-.1-.03-.23-.03-.47V7.66c0-.24 0-.36.03-.48a1 1 0 0 1 .12-.29c.06-.1.15-.19.32-.36l3.06-3.06c.17-.17.26-.26.36-.32a1 1 0 0 1 .3-.12c.1-.03.23-.03.47-.03h4.67c.25 0 .37 0 .49.03a1 1 0 0 1 .29.12c.1.06.18.15.36.32l3.06 3.06c.17.17.26.26.32.36.06.1.1.19.12.3.03.1.03.23.03.47v4.68c0 .24 0 .36-.03.48a1 1 0 0 1-.12.29Z" clip-rule="evenodd"></path></svg>
// </a></div>
// </div>
