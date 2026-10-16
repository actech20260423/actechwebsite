(() => {
    "use strict";

    if (document.documentElement.dataset.acChatMounted) return;
    document.documentElement.dataset.acChatMounted = "true";

    const script = document.currentScript;
    const scriptUrl = script && script.src ? new URL(script.src, document.baseURI) : new URL("ac-chat.js", document.baseURI);
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("ac-chat.css", scriptUrl).href;
    document.head.append(stylesheet);

    const widgetId = "ac-chat-panel";
    const mount = document.createElement("div");
    mount.innerHTML = `
        <button class="ac-chat-toggle" type="button" aria-controls="${widgetId}" aria-expanded="false">
            <span class="ac-chat-toggle__dot" aria-hidden="true"></span>
            Chat with AC
        </button>
        <section class="ac-chat-panel" id="${widgetId}" aria-label="Chat with AC" aria-hidden="true">
            <header class="ac-chat-header">
                <div>
                    <h2 class="ac-chat-title">AC · Artificial Clone</h2>
                    <span class="ac-chat-status">● Online to help</span>
                </div>
                <button class="ac-chat-close" type="button" aria-label="Close AC chat">×</button>
            </header>
            <div class="ac-chat-messages" aria-live="polite" aria-relevant="additions text"></div>
            <form class="ac-chat-form">
                <textarea class="ac-chat-input" rows="1" maxlength="1000" aria-label="Your message to AC" placeholder="Ask AC anything about ACTech…"></textarea>
                <button class="ac-chat-send" type="submit">Send</button>
            </form>
            <p class="ac-chat-privacy">Please do not share passwords, payment details, or private data.</p>
        </section>`;
    document.body.append(mount);

    const toggle = mount.querySelector(".ac-chat-toggle");
    const panel = mount.querySelector(".ac-chat-panel");
    const closeButton = mount.querySelector(".ac-chat-close");
    const messagesElement = mount.querySelector(".ac-chat-messages");
    const form = mount.querySelector(".ac-chat-form");
    const input = mount.querySelector(".ac-chat-input");
    const sendButton = mount.querySelector(".ac-chat-send");
    const storageKey = "ac-chat-history-v1";
    const endpoint = new URL("api/chat", scriptUrl).href;
    let history = loadHistory();
    let lastFocusedElement = null;

    if (history.length) {
        history.forEach(({ role, text }) => addMessage(role, text));
    } else {
        addMessage("assistant", "Hi! I’m AC, ACTech’s virtual assistant. I can help you with ACTech’s services, projects, or AI vision.");
    }

    toggle.addEventListener("click", () => {
        panel.classList.contains("is-open") ? closeChat() : openChat();
    });
    closeButton.addEventListener("click", closeChat);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.classList.contains("is-open")) closeChat();
    });
    form.addEventListener("submit", sendMessage);
    input.addEventListener("input", resizeInput);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });

    function openChat() {
        lastFocusedElement = document.activeElement;
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        input.focus();
    }

    function closeChat() {
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
    }

    async function sendMessage(event) {
        event.preventDefault();
        const text = input.value.trim();
        if (!text || sendButton.disabled) return;

        history.push({ role: "user", text });
        history = history.slice(-12);
        persistHistory();
        addMessage("user", text);
        input.value = "";
        resizeInput();
        sendButton.disabled = true;
        input.disabled = true;
        const pending = addMessage("assistant", "AC is thinking…", true);
        let failureMessage = "AC is temporarily unavailable. Please try again later.";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    messages: history,
                    page: window.location.pathname,
                    pageContext: getCurrentPageContext()
                })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || typeof data.reply !== "string") {
                if (response.status === 504) {
                    failureMessage = "AC is taking longer than expected. Please try again.";
                    throw new Error("AC is taking longer than expected. Please try again.");
                }
                const diagnostic = data.code ? ` [${data.code}]` : "";
                throw new Error(`${data.error || "The chat service is unavailable."}${diagnostic}`);
            }

            pending.remove();
            const reply = data.reply.trim();
            history.push({ role: "assistant", text: reply });
            history = history.slice(-12);
            persistHistory();
            addMessage("assistant", reply);
        } catch (error) {
            pending.remove();
            addMessage("assistant", failureMessage);
            console.error("AC chat request failed:", error);
        } finally {
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    function addMessage(role, text, isPending = false) {
        const message = document.createElement("div");
        message.className = `ac-chat-message ac-chat-message--${role}${isPending ? " ac-chat-message--pending" : ""}`;
        message.textContent = text;
        messagesElement.append(message);
        messagesElement.scrollTop = messagesElement.scrollHeight;
        return message;
    }

    function resizeInput() {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 104)}px`;
    }

    function getCurrentPageContext() {
        // Send only public, visible page text—not form values, scripts, or the chat itself.
        const page = document.body.cloneNode(true);
        page.querySelectorAll("script, style, noscript, iframe, .ac-chat-toggle, .ac-chat-panel").forEach((element) => element.remove());
        return (page.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 6000);
    }

    function loadHistory() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(storageKey));
            if (!Array.isArray(saved)) return [];
            return saved
                .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.text === "string")
                .map((item) => ({ role: item.role, text: item.text.slice(0, 1000) }))
                .slice(-12);
        } catch {
            return [];
        }
    }

    function persistHistory() {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(history));
        } catch {
            // The widget still works when browser storage is unavailable.
        }
    }
})();
