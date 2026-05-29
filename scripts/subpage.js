/* Villa Augflor subpages — load nav/footer, active nav */
(function () {
  "use strict";

  async function loadComponents() {
    const slots = document.querySelectorAll("[data-include]");
    await Promise.all(Array.from(slots).map(async (el) => {
      const src = el.getAttribute("data-include");
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.statusText);
        el.outerHTML = await res.text();
      } catch (e) {
        console.warn("Component failed:", src, e);
      }
    }));
  }

  function activeNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("#nav .nav-links a").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("#")[0];
      if (href === path) a.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadComponents();
    activeNav();
  });
})();
