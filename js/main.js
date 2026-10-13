// Vimmi website: theme toggle, screenshot tour, install tabs, copy button, scroll effects.
(() => {
  const root = document.documentElement;
  root.classList.add("js");

  // Theme: follow the system until the visitor picks one.
  const toggle = document.querySelector(".theme-toggle");
  toggle?.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try {
      localStorage.setItem("vimmi-theme", root.dataset.theme);
    } catch {
      /* private mode */
    }
  });

  // Nav border once the page scrolls, and highlight the current section.
  const nav = document.querySelector(".nav");
  const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => spy.observe(s));

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            reveal.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

  // Close the mobile menu after choosing a link.
  const menu = document.getElementById("mobile-menu");
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.hidePopover?.()));

  // Accessible tabs with arrow-key navigation.
  function tabs(list, onSelect) {
    const buttons = [...list.querySelectorAll('[role="tab"]')];
    const select = (btn, focus) => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      onSelect(btn);
    };
    buttons.forEach((b, i) => {
      b.tabIndex = b.getAttribute("aria-selected") === "true" ? 0 : -1;
      b.addEventListener("click", () => select(b, false));
      b.addEventListener("keydown", (e) => {
        const next = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!next) return;
        e.preventDefault();
        select(buttons[(i + next + buttons.length) % buttons.length], true);
      });
    });
  }

  const tourList = document.querySelector(".tour-tabs");
  const tourImg = document.querySelector(".tour-shot img");
  if (tourList && tourImg) {
    // Preload the other screenshots once the tour is near.
    const preload = () => tourList.querySelectorAll("[data-shot]").forEach((b) => (new Image().src = `assets/screenshots/${b.dataset.shot}.png`));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((e) => {
        if (e[0].isIntersecting) {
          preload();
          io.disconnect();
        }
      }, { rootMargin: "400px" });
      io.observe(tourList);
    }
    tabs(tourList, (btn) => {
      const src = `assets/screenshots/${btn.dataset.shot}.png`;
      if (tourImg.getAttribute("src") === src) return;
      tourImg.classList.add("fading");
      setTimeout(() => {
        tourImg.src = src;
        tourImg.alt = btn.dataset.alt || "";
        tourImg.decode?.().catch(() => {}).finally(() => tourImg.classList.remove("fading"));
        if (!tourImg.decode) tourImg.classList.remove("fading");
      }, 180);
    });
  }

  const osList = document.querySelector(".os-tabs");
  if (osList) {
    tabs(osList, (btn) => {
      document.querySelectorAll(".os-panel").forEach((p) => (p.hidden = p.id !== btn.getAttribute("aria-controls")));
    });
    // Preselect the visitor's platform.
    const ua = navigator.userAgent;
    const id = /Mac/.test(ua) && !/iPhone|iPad/.test(ua) ? "tab-mac" : /Windows/.test(ua) ? "tab-win" : null;
    if (id) document.getElementById(id)?.click();
  }

  // Copy the install command.
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.querySelector(btn.dataset.copy)?.textContent?.trim() ?? "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(document.querySelector(btn.dataset.copy));
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        document.execCommand("copy");
      }
      const label = btn.querySelector("span");
      btn.classList.add("copied");
      if (label) label.textContent = "Zkopírováno";
      setTimeout(() => {
        btn.classList.remove("copied");
        if (label) label.textContent = "Kopírovat";
      }, 2000);
    });
  });
})();
