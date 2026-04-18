/* pay.html — creates Stripe Checkout via /api/create-deposit-session */
(function () {
  "use strict";

  async function loadComponents() {
    const slots = document.querySelectorAll("[data-include]");
    await Promise.all(
      Array.from(slots).map(async (el) => {
        const src = el.getAttribute("data-include");
        try {
          const res = await fetch(src);
          if (!res.ok) throw new Error(res.statusText);
          el.outerHTML = await res.text();
        } catch (e) {
          console.warn("Component failed:", src, e);
        }
      })
    );
  }

  function header() {
    const h = document.querySelector(".site-header");
    if (!h) return;
    const setState = () => h.classList.toggle("is-scrolled", window.scrollY > 8);
    setState();
    window.addEventListener("scroll", setState, { passive: true });
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => menu.classList.toggle("open"));
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
    }
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path) a.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadComponents();
    header();

    const form = document.querySelector("#pay-form");
    const err = document.querySelector("#pay-error");
    const btn = document.querySelector("#pay-submit");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      btn.disabled = true;
      btn.textContent = "Redirecting to Stripe…";

      const fd = new FormData(form);
      const body = {
        plan: fd.get("plan"),
        email: fd.get("email"),
        name: fd.get("name"),
      };

      try {
        const res = await fetch("/api/create-deposit-session", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        if (!data.url) throw new Error("No checkout URL returned");
        window.location.href = data.url;
      } catch (ex) {
        err.textContent =
          (ex && ex.message) ||
          "Could not start payment. Deploy this site on Vercel with STRIPE_SECRET_KEY set, or try again.";
        btn.disabled = false;
        btn.textContent = "Continue to secure payment";
      }
    });
  });
})();
