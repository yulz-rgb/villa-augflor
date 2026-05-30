/* =====================================================
   Villa Augflor — Booking Agent Widget  v2
   Claude-powered chat + urgency bar + exit intent
   Pre-mortem upgrades: FR language, mobile exit intent,
   per-person pricing, June special, GA4 events, CORS fix
   ===================================================== */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────
  const WA_NUMBER = "33623777333";
  // Detect French / Italian / German visitors
  const LANG = (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr"
             : (navigator.language || "en").toLowerCase().startsWith("it") ? "it"
             : "en";
  const PAGE = location.pathname.split("/").pop() || "index.html";
  const SUMMER_WEEKS = (function () {
    const now = new Date();
    const aug31 = new Date(2026, 7, 31);
    const ms = aug31 - now;
    return Math.max(0, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
  })();
  const JUNE_DAYS = (function () {
    const now = new Date();
    const jun1 = new Date(2026, 5, 1);
    const diff = Math.ceil((jun1 - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, diff);
  })();

  // Quick-reply sets — bilingual
  const QUICK_REPLIES = {
    welcome: LANG === "fr"
      ? ["Vérifier juin", "Juillet ou août", "La villa", "Les tarifs ?"]
      : ["Check June dates", "July or August", "Tell me about the villa", "What are the rates?"],
    dates: LANG === "fr"
      ? ["Juin 2026", "Juillet 2026", "Août 2026", "Septembre 2026"]
      : ["June 2026", "July 2026", "August 2026", "September 2026"],
    guests: ["2 guests", "4 guests", "6 guests"],
    cta: LANG === "fr"
      ? ["Contacter Lana sur WhatsApp", "Voir les tarifs"]
      : ["Message Lana on WhatsApp", "Show me the rates page"],
  };

  // June special: waive cleaning fee to push the narrow June window
  const JUNE_SPECIAL = JUNE_DAYS <= 14 && JUNE_DAYS > 0;

  // ── State ────────────────────────────────────────────
  let messages = [];     // { role: "user"|"assistant", content: string }
  let isOpen = false;
  let proactiveDismissed = false;
  let exitShown = false;

  // ── DOM Build ─────────────────────────────────────────
  function buildWidget() {
    // --- Urgency Bar ---
    const bar = document.createElement("div");
    bar.className = "urgency-bar";
    bar.id = "va-urgency-bar";
    bar.innerHTML = `
      <span class="urgency-bar__pulse"></span>
      <span id="va-urgency-text">${urgencyText()}</span>
      <a class="urgency-bar__cta" id="va-urgency-cta">Check availability →</a>
      <button class="urgency-bar__close" id="va-urgency-close" aria-label="Close">✕</button>`;
    document.body.prepend(bar);

    // --- Exit Intent Overlay ---
    const exit = document.createElement("div");
    exit.id = "va-exit-intent";
    exit.innerHTML = `
      <div class="va-exit-modal" role="dialog" aria-modal="true" aria-labelledby="va-exit-title">
        <button class="va-exit-modal__close" id="va-exit-close" aria-label="Close">✕</button>
        <div style="font-size:2.2rem;margin-bottom:.6rem">🌊</div>
        ${LANG === "fr"
          ? `<h2 id="va-exit-title">Attendez — les semaines d'été s'envolent</h2>
             <p>Laissez votre email et Lana vous envoie les disponibilités + le tarif direct dans l'heure. Aucun spam.</p>
             <form class="va-exit-form" id="va-exit-form">
               <input type="text"  name="name"  placeholder="Votre prénom" autocomplete="given-name" required>
               <input type="email" name="email" placeholder="Votre email" autocomplete="email" required>
               <input type="text"  name="dates" placeholder="Dates envisagées (facultatif)">
               <button type="submit" class="va-exit-submit">Envoyer mes dates à Lana</button>
               <button type="button" class="va-exit-skip" id="va-exit-skip">Non merci, je vais voir Airbnb</button>
             </form>
             <p class="va-exit-success" id="va-exit-success">✓ Envoyé ! Lana vous répond dans l'heure.</p>`
          : `<h2 id="va-exit-title">Wait — summer weeks are going fast</h2>
             <p>Leave your email and Lana will send you live availability + a direct-booking rate within the hour. No spam, ever.</p>
             <form class="va-exit-form" id="va-exit-form">
               <input type="text"  name="name"  placeholder="Your first name" autocomplete="given-name" required>
               <input type="email" name="email" placeholder="Your email address" autocomplete="email" required>
               <input type="text"  name="dates" placeholder="Dates you're interested in (optional)">
               <button type="submit" class="va-exit-submit">Send me Lana's availability</button>
               <button type="button" class="va-exit-skip" id="va-exit-skip">No thanks, I'll check Airbnb</button>
             </form>
             <p class="va-exit-success" id="va-exit-success">✓ Sent! Lana will be in touch within the hour.</p>`
        }
      </div>`;
    document.body.appendChild(exit);

    // --- Chat Widget ---
    const widget = document.createElement("div");
    widget.id = "va-chat-widget";
    widget.innerHTML = `
      <div class="va-proactive-bubble" id="va-proactive" style="display:none">
        <button class="va-proactive-bubble__close" id="va-proactive-close" aria-label="Dismiss">✕</button>
        <p id="va-proactive-text">👋 <strong>A few summer weeks</strong> left — can I check June or July availability for you?</p>
      </div>
      <div class="va-chat-panel" id="va-chat-panel" role="dialog" aria-label="Booking assistant">
        <div class="va-chat-header">
          <div class="va-chat-header__avatar">🏡</div>
          <div class="va-chat-header__info">
            <div class="va-chat-header__name">Villa Augflor · Lana's assistant</div>
            <div class="va-chat-header__status">
              <span class="va-chat-header__dot"></span> Online now
            </div>
          </div>
          <button class="va-chat-close" id="va-chat-close" aria-label="Close chat">✕</button>
        </div>
        <div class="va-chat-messages" id="va-chat-messages"></div>
        <div class="va-quick-replies" id="va-quick-replies"></div>
        <div class="va-chat-input-area">
          <textarea class="va-chat-input" id="va-chat-input"
            placeholder="Type a message…" rows="1"
            aria-label="Your message"></textarea>
          <button class="va-chat-send" id="va-chat-send" aria-label="Send" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="va-chat-trigger" id="va-chat-trigger" aria-label="Open booking chat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="va-chat-trigger__badge" id="va-trigger-badge" style="display:none">1</span>
      </button>`;
    document.body.appendChild(widget);
  }

  function urgencyText() {
    if (LANG === "fr") {
      return JUNE_DAYS > 0
        ? `☀️ Été 2026 — Juin dans ${JUNE_DAYS} jours · Quelques semaines restantes · Devis écrit avant paiement`
        : `☀️ Haute saison — Quelques semaines d'été restantes · Réservation directe sans frais plateforme`;
    }
    return JUNE_DAYS > 0
      ? `☀️ Summer 2026 — June starts in ${JUNE_DAYS} days · A few weeks left · Written quote before payment`
      : `☀️ Peak season — A few summer weeks remaining · Book direct with clarity`;
  }

  // ── Urgency Bar Logic ─────────────────────────────────
  function initUrgencyBar() {
    document.getElementById("va-urgency-close")?.addEventListener("click", () => {
      document.getElementById("va-urgency-bar").style.display = "none";
    });
    document.getElementById("va-urgency-cta")?.addEventListener("click", () => {
      openChat();
      addAgentMessage(
        `Hi! I can check our live availability right now. Which month are you thinking — June, July, or August?`,
        QUICK_REPLIES.dates
      );
    });
  }

  // ── Chat Core ─────────────────────────────────────────
  function openChat() {
    isOpen = true;
    document.getElementById("va-chat-panel").classList.add("is-open");
    document.getElementById("va-proactive").style.display = "none";
    document.getElementById("va-trigger-badge").style.display = "none";
    proactiveDismissed = true;
    setTimeout(() => document.getElementById("va-chat-messages")?.scrollTo(0, 9999), 50);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById("va-chat-panel").classList.remove("is-open");
  }

  function addAgentMessage(text, quickReplies) {
    messages.push({ role: "assistant", content: text });
    renderMessages(quickReplies);
  }

  function renderMessages(quickReplies) {
    const container = document.getElementById("va-chat-messages");
    if (!container) return;
    container.innerHTML = messages.map(m => `
      <div class="va-msg va-msg--${m.role === "user" ? "user" : "agent"}">${escHtml(m.content)}</div>
    `).join("");
    container.scrollTop = container.scrollHeight;

    // Quick replies
    const qr = document.getElementById("va-quick-replies");
    if (qr) {
      qr.innerHTML = (quickReplies || []).map(r =>
        `<button class="va-qr-btn">${escHtml(r)}</button>`
      ).join("");
      qr.querySelectorAll(".va-qr-btn").forEach(btn => {
        btn.addEventListener("click", () => sendUserMessage(btn.textContent));
      });
    }
  }

  function showTyping() {
    const container = document.getElementById("va-chat-messages");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "va-msg va-msg--typing";
    el.id = "va-typing";
    el.innerHTML = `<div class="va-typing-dots"><span></span><span></span><span></span></div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("va-typing")?.remove();
  }

  async function sendUserMessage(text) {
    text = text.trim();
    if (!text) return;

    // Clear input
    const input = document.getElementById("va-chat-input");
    if (input) { input.value = ""; autoResize(input); }
    document.getElementById("va-chat-send").disabled = true;
    document.getElementById("va-quick-replies").innerHTML = "";

    messages.push({ role: "user", content: text });
    renderMessages();
    showTyping();

    // Try AI agent
    let reply = null;
    let action = null;
    try {
      const res = await fetch("/api/booking-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          metadata: { page: PAGE }
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.reply;
        action = data.action;
      }
    } catch { /* fallback below */ }

    hideTyping();

    if (!reply) {
      // Graceful fallback
      reply = "I'd love to help — let me connect you to Lana directly on WhatsApp so she can answer in minutes.";
      action = "whatsapp";
    }

    messages.push({ role: "assistant", content: reply });

    // Determine quick replies for next turn
    let nextQR = [];
    if (action === "whatsapp") {
      nextQR = [];
    } else if (messages.length <= 3) {
      nextQR = QUICK_REPLIES.welcome;
    } else if (reply.toLowerCase().includes("june") || reply.toLowerCase().includes("july") || reply.toLowerCase().includes("august")) {
      nextQR = QUICK_REPLIES.guests;
    } else {
      nextQR = QUICK_REPLIES.cta;
    }

    renderMessages(nextQR);

    // Inject WhatsApp CTA if agent triggered it
    if (action === "whatsapp") {
      injectWhatsAppCTA();
    }

    document.getElementById("va-chat-send").disabled = false;
  }

  function injectWhatsAppCTA() {
    const container = document.getElementById("va-chat-messages");
    if (!container) return;
    // Build pre-filled message from conversation context
    const context = messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .join(" | ");
    const waText = encodeURIComponent(
      `Hi Lana! I'm interested in booking Villa Augflor. ${context.slice(0, 200)}`
    );
    const btn = document.createElement("button");
    btn.className = "va-chat-action-btn";
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Chat with Lana on WhatsApp →`;
    btn.onclick = () => {
      trackEvent("whatsapp_click", { page: PAGE, conversation_turns: messages.length });
      window.open(`https://wa.me/${WA_NUMBER}?text=${waText}`, "_blank");
    };
    container.appendChild(btn);
    container.scrollTop = container.scrollHeight;
  }

  // ── Proactive Trigger ─────────────────────────────────
  function scheduleProactive() {
    if (sessionStorage.getItem("va_chat_opened")) return;
    const delay = PAGE === "last-minute-villa.html" ? 4000 : 9000;
    setTimeout(() => {
      if (!isOpen && !proactiveDismissed) {
        showProactive();
      }
    }, delay);
  }

  function showProactive() {
    const el = document.getElementById("va-proactive");
    const badge = document.getElementById("va-trigger-badge");
    if (!el || !badge) return;
    const textSets = {
      fr: [
        `👋 <strong>Quelques semaines d'été</strong> restantes — puis-je vérifier juin ou juillet pour vous ?`,
        `🌊 Encore hésitant·e ? Les semaines de juillet partent vite — je peux vérifier les dispo.`,
        `☀️ Juin dans ${JUNE_DAYS} jours — Lana a encore quelques semaines libres.`,
      ],
      en: [
        `👋 <strong>A few summer weeks left</strong> — can I check June or July for you?`,
        `🌊 Still deciding? July weeks fill up fast — I can check live availability.`,
        `☀️ June starts in ${JUNE_DAYS} days — Lana has a few open weeks. Want to check?`,
      ],
    };
    const texts = textSets[LANG] || textSets.en;
    const t = texts[Math.floor(Math.random() * texts.length)];
    el.querySelector("#va-proactive-text").innerHTML = t;
    el.style.display = "block";
    badge.style.display = "flex";
    trackEvent("proactive_bubble_shown", { page: PAGE });
  }

  // ── Exit Intent ───────────────────────────────────────
  function triggerExitIntent() {
    if (exitShown || isOpen) return;
    if (sessionStorage.getItem("va_exit_shown")) return;
    exitShown = true;
    sessionStorage.setItem("va_exit_shown", "1");
    trackEvent("exit_intent_shown", { page: PAGE });
    document.getElementById("va-exit-intent").classList.add("is-visible");
  }

  function initExitIntent() {
    let triggered = false;

    // Desktop: mouseleave top edge
    document.addEventListener("mouseleave", (e) => {
      if (e.clientY > 10 || triggered || isOpen) return;
      triggered = true;
      triggerExitIntent();
    });

    // Mobile fallback: user scrolls back up quickly (sign they're leaving)
    let lastScrollY = window.scrollY;
    let mobileTriggered = false;
    window.addEventListener("scroll", () => {
      if (mobileTriggered || isOpen) return;
      const current = window.scrollY;
      const scrolledUp = lastScrollY - current > 60;
      const pastFold = lastScrollY > 400;
      if (scrolledUp && pastFold) {
        mobileTriggered = true;
        triggerExitIntent();
      }
      lastScrollY = current;
    }, { passive: true });

    document.getElementById("va-exit-close")?.addEventListener("click", dismissExit);
    document.getElementById("va-exit-skip")?.addEventListener("click", () => {
      // Gentle last-chance WhatsApp offer when they click "No thanks"
      dismissExit();
      setTimeout(() => openChatWithMessage(
        "Still thinking? No problem at all — if you change your mind, just message Lana. She usually replies within minutes.",
        QUICK_REPLIES.cta
      ), 400);
    });

    document.getElementById("va-exit-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const name  = form.name.value.trim();
      const email = form.email.value.trim();
      const dates = form.dates.value.trim();

      trackEvent("exit_lead_submitted", { page: PAGE, has_dates: !!dates });
      // Send to Lana via mailto — opens in default email client
      const mailtoLink = `mailto:villa.augflor@gmail.com?subject=${encodeURIComponent("New lead: " + name)}&body=${encodeURIComponent(`Hi Lana,\n\nNew direct lead from the Villa Augflor website:\n\nName: ${name}\nEmail: ${email}\nDates interested in: ${dates || "not specified"}\nPage: ${PAGE}\n\nReply to this email to follow up.`)}`;
      window.open(mailtoLink);

      document.getElementById("va-exit-form").style.display = "none";
      document.getElementById("va-exit-success").style.display = "block";
      setTimeout(dismissExit, 3000);
    });

    // Close on backdrop click
    document.getElementById("va-exit-intent")?.addEventListener("click", (e) => {
      if (e.target.id === "va-exit-intent") dismissExit();
    });
  }

  function dismissExit() {
    document.getElementById("va-exit-intent")?.classList.remove("is-visible");
  }

  // ── GA4 Event Tracking ────────────────────────────────
  function trackEvent(name, params) {
    try {
      if (typeof gtag === "function") {
        gtag("event", name, params || {});
      }
    } catch { /* GA4 not loaded */ }
  }

  // ── Input Helpers ─────────────────────────────────────
  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }

  function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/\n/g, "<br>");
  }

  // ── Event Wiring ──────────────────────────────────────
  function wireEvents() {
    // Trigger button
    document.getElementById("va-chat-trigger")?.addEventListener("click", () => {
      if (isOpen) { closeChat(); return; }
      sessionStorage.setItem("va_chat_opened", "1");
      openChat();
      if (messages.length === 0) {
        trackEvent("chat_opened", { page: PAGE });
        const juneSpecialNote = JUNE_SPECIAL
          ? (LANG === "fr" ? " 🎁 Offre juin : frais de ménage offerts (€150 d'économie) pour toute réservation cette semaine." : " 🎁 June special: cleaning fee waived (save €150) for bookings made this week.")
          : "";

        const greetings = {
          fr: {
            "last-minute-villa.html": `Bonjour ! 🌊 Juin commence dans ${JUNE_DAYS} jours. Je peux vérifier les disponibilités maintenant — quelles dates vous intéressent ?${juneSpecialNote}`,
            "rates.html": `Bonjour ! Pour 6 personnes, la villa revient à ~€80/personne/nuit en haute saison. Devis écrit avant paiement — taxe de séjour au tarif 4 étoiles (2,53 €/adulte/nuit). Quel mois vous intéresse ?`,
            "family-villa.html": `Bonjour ! Villa Augflor est idéale pour les familles — chambre au rez-de-chaussée, piscine privée, grand espace. Quelles dates pour votre famille ?`,
            "anniversary-getaway.html": `Quel beau projet ! 🌹 Les soirées au bord de la piscine, le jardin au coucher du soleil, l'intimité totale... Quelles dates envisagez-vous ?`,
            default: `Bonjour ! 👋 Je suis l'assistante de Lana pour Villa Augflor. Quelques semaines d'été restantes — puis-je vérifier juin, juillet ou août pour vous ?${juneSpecialNote}`,
          },
          en: {
            "last-minute-villa.html": `Hi! 🌊 June is just ${JUNE_DAYS} days away. I can check live availability right now — what dates are you looking at?${juneSpecialNote}`,
            "rates.html": `Hi! For 6 guests that's ~€80/person/night in peak summer. You get a written quote before payment — taxe de séjour at the 4-star rate (€2.53/adult/night). Which month are you considering?`,
            "family-villa.html": `Hi! Villa Augflor is a wonderful family choice — ground-floor bedroom, private pool, and loads of space. What dates work for your family?`,
            "anniversary-getaway.html": `How lovely — anniversaries at Villa Augflor are magical. 🌹 Pool evenings, sunset garden, total privacy. What dates are you thinking?`,
            default: `Hi! 👋 I'm Lana's assistant for Villa Augflor. A few summer weeks remaining — can I check June, July, or August availability for you?${juneSpecialNote}`,
          },
        };
        const langGreetings = greetings[LANG] || greetings.en;
        const msg = langGreetings[PAGE] || langGreetings.default;
        addAgentMessage(msg, QUICK_REPLIES.dates);
      }
    });

    // Close button
    document.getElementById("va-chat-close")?.addEventListener("click", closeChat);

    // Proactive bubble
    document.getElementById("va-proactive")?.addEventListener("click", (e) => {
      if (e.target.id !== "va-proactive-close") {
        openChat();
        addAgentMessage(
          `Great — which month works best for you: June, July, or August?`,
          QUICK_REPLIES.dates
        );
      }
    });
    document.getElementById("va-proactive-close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      proactiveDismissed = true;
      document.getElementById("va-proactive").style.display = "none";
    });

    // Input
    const input = document.getElementById("va-chat-input");
    const send  = document.getElementById("va-chat-send");
    if (input && send) {
      input.addEventListener("input", () => {
        autoResize(input);
        send.disabled = !input.value.trim();
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (!send.disabled) sendUserMessage(input.value);
        }
      });
      send.addEventListener("click", () => sendUserMessage(input.value));
    }
  }

  function openChatWithMessage(msg, qr) {
    openChat();
    addAgentMessage(msg, qr);
  }

  // ── Boot ──────────────────────────────────────────────
  function init() {
    buildWidget();
    initUrgencyBar();
    wireEvents();
    scheduleProactive();
    initExitIntent();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
