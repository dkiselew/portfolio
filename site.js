tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        accent: '#FF5A1A',
        mute: '#A3A3A3',
        wash: '#F4F4F5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
};

(() => {
  const isHome = (href) => /(?:^|\/)(?:index\.html)?$/.test(new URL(href, location.href).pathname);
  const tag = (vt, from, to) => {
    if (!vt) return;
    vt.types.add(isHome(to) && !isHome(from) ? 'back' : 'forward');
  };

  window.addEventListener('pageswap', (e) => {
    if (!e.viewTransition || !e.activation) return;
    tag(e.viewTransition, e.activation.from?.url || location.href, e.activation.entry.url);
  });

  window.addEventListener('pagereveal', (e) => {
    if (!e.viewTransition || typeof navigation === 'undefined' || !navigation.activation) return;
    const from = navigation.activation.from?.url || location.href;
    tag(e.viewTransition, from, location.href);
  });

  const previousIsOnSite = () => {
    if (typeof navigation !== 'undefined' && typeof navigation.entries === 'function') {
      const entries = navigation.entries();
      const index = navigation.currentEntry?.index ?? entries.length - 1;
      const prev = index > 0 ? entries[index - 1] : null;
      if (!prev) return false;
      try {
        return new URL(prev.url).origin === location.origin;
      } catch {
        return false;
      }
    }
    if (!document.referrer || history.length < 2) return false;
    try {
      return new URL(document.referrer).origin === location.origin;
    } catch {
      return false;
    }
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-back]');
    if (!link) return;
    if (!previousIsOnSite()) return;
    e.preventDefault();
    history.back();
  });
})();
