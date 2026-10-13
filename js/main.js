/* Vimmi — chování prezentačního webu */
(() => {
  'use strict';

  const root = document.documentElement;
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Světlý a tmavý vzhled
     ------------------------------------------------------------------------ */

  const THEME_KEY = 'vimmi-theme';
  const THEME_COLORS = { light: '#F7F7F5', dark: '#111111' };
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themeMetas = document.querySelectorAll('meta[name="theme-color"]');

  const currentTheme = () => root.dataset.theme || (darkScheme.matches ? 'dark' : 'light');

  const syncTheme = () => {
    const theme = currentTheme();
    themeMetas.forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Přepnout na světlý vzhled' : 'Přepnout na tmavý vzhled'
      );
    }
  };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* Úložiště nemusí být dostupné (např. anonymní okno). */
    }
    syncTheme();
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      if (document.startViewTransition && !reducedMotion.matches) {
        document.startViewTransition(() => setTheme(next));
      } else {
        setTheme(next);
      }
    });
  }

  darkScheme.addEventListener('change', syncTheme);
  syncTheme();

  /* Záhlaví při posunu
     ------------------------------------------------------------------------ */

  const header = document.querySelector('[data-header]');

  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* Mobilní menu — otevírání řeší nativní popover, tady jen zavírání
     ------------------------------------------------------------------------ */

  const menu = document.querySelector('[data-mobile-menu]');

  if (menu && typeof menu.hidePopover === 'function') {
    const isOpen = () => menu.matches(':popover-open');
    const menuToggle = document.querySelector('[popovertarget="' + menu.id + '"]');

    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menu.addEventListener('toggle', (event) => {
        menuToggle.setAttribute('aria-expanded', String(event.newState === 'open'));
      });
    }

    menu.addEventListener('click', (event) => {
      if (event.target.closest('a') && isOpen()) menu.hidePopover();
    });

    window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
      if (event.matches && isOpen()) menu.hidePopover();
    });
  }

  /* Zvýraznění aktuální sekce v navigaci
     ------------------------------------------------------------------------ */

  const navLinks = document.querySelectorAll('[data-nav-link]');
  const sections = [...document.querySelectorAll('[data-section]')];

  if ('IntersectionObserver' in window && navLinks.length && sections.length) {
    const visible = new Set();

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });

        const active = sections.find((section) => visible.has(section));
        const key = active ? active.dataset.section : null;

        navLinks.forEach((link) => {
          if (link.dataset.navLink === key) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-45% 0px -54% 0px' }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* Jemné odhalení obsahu při posunu
     ------------------------------------------------------------------------ */

  const revealItems = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    // Co je vidět hned po načtení, zůstane na místě bez animace.
    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-visible');
      else revealer.observe(item);
    });

    root.classList.add('reveal-ready');
  }

  /* Propojený prostor: výběr položky ukáže její souvislosti
     ------------------------------------------------------------------------ */

  const web = document.querySelector('[data-web]');

  if (web) {
    const nodes = [...web.querySelectorAll('[data-node]')];
    const status = web.querySelector('[data-web-status]');
    const byId = new Map(nodes.map((node) => [node.dataset.node, node]));

    const WORDS = {
      poznamka: ['poznámka', 'poznámky', 'poznámek'],
      ukol: ['úkol', 'úkoly', 'úkolů'],
      podklad: ['podklad', 'podklady', 'podkladů'],
    };

    // Mezi číslem a slovem je nezlomitelná mezera, aby se nerozdělily na dva řádky.
    const count = (n, [one, few, many]) => {
      if (n === 1) return `${n}\u00a0${one}`;
      return `${n}\u00a0${n >= 2 && n <= 4 ? few : many}`;
    };

    const joinCzech = (parts) =>
      parts.length > 1 ? `${parts.slice(0, -1).join(', ')} a\u00a0${parts[parts.length - 1]}` : parts[0];

    const highlight = (source) => {
      const links = source.dataset.links.split(' ');
      nodes.forEach((node) => {
        node.classList.toggle('is-active', node === source);
        node.classList.toggle('is-linked', links.includes(node.dataset.node));
      });
      web.classList.add('has-selection');
    };

    let selected = byId.get('n1');

    const select = (node) => {
      selected = node;
      highlight(node);
      nodes.forEach((item) => item.setAttribute('aria-pressed', String(item === node)));

      const totals = {};
      node.dataset.links.split(' ').forEach((id) => {
        const kind = byId.get(id).dataset.kind;
        totals[kind] = (totals[kind] || 0) + 1;
      });
      const parts = Object.keys(WORDS)
        .filter((kind) => totals[kind])
        .map((kind) => count(totals[kind], WORDS[kind]));

      const title = document.createElement('strong');
      title.textContent = node.querySelector('.web__title').textContent;
      status.replaceChildren(title, ` — propojení: ${joinCzech(parts)}`);
    };

    nodes.forEach((node) => {
      node.disabled = false;
      node.addEventListener('click', () => select(node));
      node.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse') highlight(node);
      });
    });

    web.querySelector('.web__columns').addEventListener('pointerleave', () => highlight(selected));

    select(selected);
  }
})();
