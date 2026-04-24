const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const navContainer = document.querySelector(".nav-container");
const mobileBreakpoint = window.matchMedia("(max-width: 820px)");

// Remove any legacy marquee ribbon that may persist from older cached scripts.
document.querySelectorAll(".marquee").forEach((el) => el.remove());

if (navToggle && navPanel) {
  const setMenuState = (isOpen) => {
    navPanel.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  };

  navToggle.addEventListener("click", () => {
    setMenuState(!navPanel.classList.contains("is-open"));
  });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileBreakpoint.matches) {
        setMenuState(false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (
      mobileBreakpoint.matches &&
      navPanel.classList.contains("is-open") &&
      navContainer &&
      !navContainer.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navPanel.classList.contains("is-open")) {
      setMenuState(false);
      navToggle.focus();
    }
  });

  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) {
      setMenuState(false);
    }
  });
}

const CHAT_STORAGE_KEY = "thrive_chat_history_v1";
const CHATBOT_CONFIG = window.CHATBOT_CONFIG || {};
const CHAT_API_URL =
  CHATBOT_CONFIG.apiUrl ||
  window.CHATBOT_API_URL ||
  (window.CHATBOT_API_BASE ? `${window.CHATBOT_API_BASE}/api/chat` : null);
const CHAT_HEADERS = CHATBOT_CONFIG.headers || {};
const WHATSAPP_PHONE_RAW =
  (window.WHATSAPP_CONFIG && window.WHATSAPP_CONFIG.phone) ||
  window.WHATSAPP_PHONE ||
  CHATBOT_CONFIG.whatsappPhone ||
  "+256774292922";
const WHATSAPP_PHONE = String(WHATSAPP_PHONE_RAW).replace(/\D/g, "");
const WHATSAPP_TEXT = encodeURIComponent(
  (window.WHATSAPP_CONFIG && window.WHATSAPP_CONFIG.message) ||
    "Hello Thrive Path, I would like to learn more about the program."
);

const chatbotStyles = `
.chatbot-launcher{
  position:fixed;
  right:1rem;
  bottom:4.35rem;
  z-index:1200;
  border:none;
  border-radius:999px;
  padding:.9rem 1.1rem;
  min-height:48px;
  background:linear-gradient(135deg,var(--secondary-2),var(--primary-deep));
  color:#fff;
  font-weight:800;
  letter-spacing:.02em;
  box-shadow:0 14px 28px rgba(128,15,47,.24);
  cursor:pointer;
}
.whatsapp-launcher{
  position:fixed;
  right:1rem;
  bottom:1rem;
  z-index:1201;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:50px;
  min-height:50px;
  padding:0;
  border-radius:50%;
  text-decoration:none;
  color:#ffffff;
  border:1px solid rgba(255,255,255,.35);
  background:linear-gradient(135deg,#25D366,#128C7E);
  box-shadow:0 14px 28px rgba(18,140,126,.26), inset 0 0 0 1px rgba(255,255,255,.12);
  transition:transform .2s ease, box-shadow .2s ease, filter .2s ease;
}
.whatsapp-launcher .whatsapp-icon{
  width:22px;
  height:22px;
  display:block;
}
.whatsapp-launcher:hover{
  transform:translateY(-2px);
  filter:saturate(1.06);
  box-shadow:0 18px 34px rgba(18,140,126,.33), inset 0 0 0 1px rgba(255,255,255,.15);
}
.whatsapp-launcher:focus-visible{
  outline:none;
  box-shadow:0 0 0 3px rgba(255,255,255,.95),0 0 0 6px rgba(37,211,102,.45),0 14px 28px rgba(18,140,126,.26);
}
.chatbot-panel{
  position:fixed;
  right:1rem;
  bottom:4.75rem;
  width:min(380px,calc(100vw - 2rem));
  height:520px;
  z-index:1200;
  display:none;
  flex-direction:column;
  border-radius:20px;
  overflow:hidden;
  border:1px solid rgba(164,19,60,.2);
  background:#fff;
  box-shadow:0 26px 60px rgba(0,0,0,.22);
}
.chatbot-panel.is-open{display:flex}
.chatbot-header{
  padding:.85rem 1rem;
  color:#fff;
  font-weight:800;
  background:linear-gradient(135deg,var(--secondary-2),var(--primary-deep));
}
.chatbot-sub{
  display:block;
  margin-top:.2rem;
  font-size:.78rem;
  font-weight:600;
  opacity:.9;
}
.chatbot-messages{
  flex:1;
  overflow:auto;
  padding:1rem;
  background:linear-gradient(180deg,#fff 0%,#fff3f6 100%);
}
.chatbot-empty{
  color:var(--muted);
  font-size:.92rem;
}
.chatbot-msg{
  max-width:88%;
  margin-bottom:.75rem;
  padding:.65rem .8rem;
  border-radius:14px;
  line-height:1.45;
  font-size:.92rem;
  white-space:pre-wrap;
}
.chatbot-msg.user{
  margin-left:auto;
  background:var(--primary-deep);
  color:#fff;
}
.chatbot-msg.assistant{
  margin-right:auto;
  background:#fff;
  color:#2b1b21;
  border:1px solid rgba(164,19,60,.18);
}
.chatbot-form{
  display:flex;
  gap:.55rem;
  padding:.75rem;
  border-top:1px solid rgba(164,19,60,.14);
  background:#fff;
}
.chatbot-input{
  flex:1;
  border:1px solid rgba(164,19,60,.24);
  border-radius:12px;
  padding:.7rem .75rem;
  font:inherit;
}
.chatbot-send{
  border:none;
  border-radius:12px;
  padding:.7rem .85rem;
  font-weight:700;
  background:var(--primary-deep);
  color:#fff;
  cursor:pointer;
}
@media (max-width:560px){
  .chatbot-panel{height:68vh;bottom:4.45rem}
  .chatbot-launcher{right:.8rem;bottom:4.1rem}
  .whatsapp-launcher{
    right:.8rem;
    bottom:.8rem;
  }
}
`;

function injectChatbotStyles() {
  if (document.getElementById("chatbot-inline-style")) return;
  const styleTag = document.createElement("style");
  styleTag.id = "chatbot-inline-style";
  styleTag.textContent = chatbotStyles;
  document.head.appendChild(styleTag);
}

function loadChatHistory() {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveChatHistory(history) {
  sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history.slice(-20)));
}

function createWhatsAppLauncher() {
  if (!WHATSAPP_PHONE) return;

  const existing = document.querySelector(".whatsapp-launcher");
  if (existing) return;

  const whatsapp = document.createElement("a");
  whatsapp.className = "whatsapp-launcher";
  whatsapp.href = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_TEXT}`;
  whatsapp.target = "_blank";
  whatsapp.rel = "noopener noreferrer";
  whatsapp.setAttribute("aria-label", "Chat with Thrive on WhatsApp");
  whatsapp.innerHTML =
    '<svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.11 17.2c-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.58.13-.17.26-.67.83-.82 1-.15.17-.31.2-.58.07-.26-.13-1.11-.41-2.11-1.31-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.41.11-.54.11-.11.26-.28.39-.41.13-.13.17-.22.26-.37.09-.15.04-.28-.02-.41-.07-.13-.58-1.4-.8-1.91-.21-.5-.43-.43-.58-.44-.15 0-.33-.01-.5-.01-.17 0-.46.07-.7.33-.24.26-.92.9-.92 2.2 0 1.3.94 2.55 1.07 2.72.13.17 1.84 2.81 4.46 3.94.62.27 1.11.44 1.49.57.63.2 1.2.17 1.66.1.51-.08 1.52-.62 1.73-1.22.22-.59.22-1.1.15-1.2-.06-.1-.24-.16-.5-.29z"/><path fill="currentColor" d="M16.03 3.2c-6.98 0-12.64 5.66-12.64 12.64 0 2.23.58 4.41 1.69 6.32L3.2 28.8l6.78-1.84a12.6 12.6 0 0 0 6.05 1.54h.01c6.98 0 12.64-5.66 12.64-12.64S23.01 3.2 16.03 3.2zm0 23.2h-.01a10.5 10.5 0 0 1-5.34-1.46l-.38-.23-4.02 1.09 1.07-3.92-.25-.4a10.5 10.5 0 1 1 8.93 4.92z"/></svg>';
  document.body.appendChild(whatsapp);
}

function createChatbot() {
  injectChatbotStyles();

  const launcher = document.createElement("button");
  launcher.className = "chatbot-launcher";
  launcher.type = "button";
  launcher.textContent = "Chat with Thrive";

  const panel = document.createElement("section");
  panel.className = "chatbot-panel";
  panel.setAttribute("aria-label", "Thrive chatbot");
  panel.innerHTML = `
    <div class="chatbot-header">
      Thrive Assistant
      <span class="chatbot-sub">Grounded answers from Thrive PDFs only</span>
    </div>
    <div class="chatbot-messages">
      <p class="chatbot-empty">Ask anything about Thrive Path. I only answer from uploaded PDFs.</p>
    </div>
    <form class="chatbot-form">
      <input class="chatbot-input" type="text" maxlength="500" placeholder="Ask a question..." required />
      <button class="chatbot-send" type="submit">Send</button>
    </form>
  `;

  document.body.append(launcher, panel);

  const messagesEl = panel.querySelector(".chatbot-messages");
  const formEl = panel.querySelector(".chatbot-form");
  const inputEl = panel.querySelector(".chatbot-input");
  const history = loadChatHistory();

  const drawMessage = (role, content) => {
    const empty = messagesEl.querySelector(".chatbot-empty");
    if (empty) empty.remove();
    const msg = document.createElement("div");
    msg.className = `chatbot-msg ${role}`;
    msg.textContent = content;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  history.forEach((item) => drawMessage(item.role, item.content));

  launcher.addEventListener("click", () => {
    panel.classList.toggle("is-open");
    if (panel.classList.contains("is-open")) inputEl.focus();
  });

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = inputEl.value.trim();
    if (!message) return;

    drawMessage("user", message);
    inputEl.value = "";

    const payloadHistory = loadChatHistory().concat([{ role: "user", content: message }]);
    saveChatHistory(payloadHistory);

    try {
      if (!CHAT_API_URL) {
        throw new Error("CHATBOT_API_URL is not configured");
      }

      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...CHAT_HEADERS,
        },
        body: JSON.stringify({
          message,
          input: message,
          history: payloadHistory,
          session_history: payloadHistory,
        }),
      });

      const data = await response.json();
      const answer =
        data.output_text ||
        data.message ||
        data.answer ||
        "I could not respond right now. Please try again in a moment.";
      drawMessage("assistant", answer);
      const nextHistory = payloadHistory.concat([{ role: "assistant", content: answer }]);
      saveChatHistory(nextHistory);
    } catch (_error) {
      const fallback =
        "I cannot reach the chatbot service right now. Please confirm the backend is running.";
      drawMessage("assistant", fallback);
      saveChatHistory(payloadHistory.concat([{ role: "assistant", content: fallback }]));
    }
  });
}

createWhatsAppLauncher();
createChatbot();

/* ============================================================
   MODERN ENHANCEMENTS — scroll reveal, count-up, smart navbar,
   scroll progress. Respects prefers-reduced-motion.
   ============================================================ */
(function modernEnhancements() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Auto-tag elements for scroll reveal --------------- */
  const revealSelectors = [
    ".section-heading",
    ".section .two-column > *",
    ".section .highlight-block > *",
    ".section .callout > *",
    ".panel-card",
    ".quote-card",
    ".table-card",
    ".timeline-card",
    ".image-card",
    ".media-frame",
    ".hero .hero-visual",
    ".page-hero .hero-copy > *",
  ];
  document.querySelectorAll(revealSelectors.join(",")).forEach((el) => {
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
  });

  const staggerSelectors = [
    ".card-grid",
    ".trust-grid",
    ".metric-grid",
    ".timeline-grid",
    ".logo-cloud",
    ".highlight-list",
    ".footer-grid",
  ];
  document.querySelectorAll(staggerSelectors.join(",")).forEach((el) => {
    if (!el.hasAttribute("data-reveal-stagger")) el.setAttribute("data-reveal-stagger", "");
  });

  /* ---------- IntersectionObserver reveal ----------------------- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document
      .querySelectorAll("[data-reveal], [data-reveal-stagger]")
      .forEach((el) => io.observe(el));
  } else {
    // Reduced motion / no IO: show everything immediately
    document
      .querySelectorAll("[data-reveal], [data-reveal-stagger]")
      .forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Smart navbar (scrolled + hide on scroll down) ----- */
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      navbar.classList.toggle("is-scrolled", y > 12);
      if (!prefersReducedMotion) {
        const delta = y - lastY;
        if (y > 220 && delta > 6) {
          navbar.classList.add("is-hidden");
        } else if (delta < -4 || y < 120) {
          navbar.classList.remove("is-hidden");
        }
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Scroll progress bar ------------------------------- */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.setProperty("--progress", pct + "%");
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Count-up for trust / metric numbers --------------- */
  const numberEls = document.querySelectorAll(".trust-item h2, .metric-card strong");
  const animateCount = (el) => {
    const raw = el.textContent.trim();
    // Match leading number (supports ranges like 16–30 → animate first)
    const match = raw.match(/^(\d+)/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    if (!Number.isFinite(target) || target < 1) return;
    const suffix = raw.slice(match[0].length);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    numberEls.forEach((el) => countIO.observe(el));
  }

  /* ---------- Subtle parallax on hero background (home only) ---- */
  const hero = document.querySelector(".home-page .hero");
  if (hero && !prefersReducedMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < 800) {
          hero.style.backgroundPosition = `center ${50 + y * 0.04}%`;
        }
      },
      { passive: true }
    );
  }
})();

/* ============================================================
   Scrollspy for sticky "On this page" anchor nav
   ============================================================ */
(function anchorNavScrollspy() {
  const nav = document.querySelector(".anchor-nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll("a[href^='#']"));
  if (!links.length) return;

  const sections = links
    .map((a) => {
      const id = a.getAttribute("href").slice(1);
      const el = id && document.getElementById(id);
      return el ? { link: a, el } : null;
    })
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const setActive = (activeEl) => {
    sections.forEach(({ link, el }) => {
      link.classList.toggle("is-active", el === activeEl);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target);
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.6] }
  );
  sections.forEach(({ el }) => io.observe(el));
})();

/* ============================================================
   SUPER POLISH — cursor spotlight + inject marquee ribbon
   ============================================================ */
(function polish() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Cursor-aware card spotlight ---------------------- */
  const spotlightSelector = [
    ".feature-card", ".audience-card", ".content-card",
    ".trust-item", ".metric-card", ".quote-card",
    ".timeline-card", ".panel-card", ".pricing-card",
    ".journey-card", ".benefit-card",
  ].join(",");

  if (!prefersReduced && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener(
      "pointermove",
      (e) => {
        const card = e.target.closest(spotlightSelector);
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      },
      { passive: true }
    );
  }

})();
