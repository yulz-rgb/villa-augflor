(function () {
  'use strict';

  // ——— Section nav scroll spy ———
  const sectionNav = document.getElementById('sectionNav');
  if (sectionNav) {
    const links = sectionNav.querySelectorAll('a[data-section]');
    const sections = [...links].map((a) => document.getElementById(a.dataset.section)).filter(Boolean);

    const setActive = (id) => {
      links.forEach((l) => l.classList.toggle('active', l.dataset.section === id));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));

    links.forEach((link) => {
      link.addEventListener('click', (ev) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          ev.preventDefault();
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ——— Trip type tabs ———
  document.querySelectorAll('.trip-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.trip;
      document.querySelectorAll('.trip-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.trip-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('trip-' + id);
      if (panel) panel.classList.add('active');
    });
  });

  // ——— Gallery filter + render ———
  const grid = document.getElementById('galleryRoomGrid');
  const photos = window.VILLA_GALLERY || [];
  let activeRoom = 'all';
  let lightboxIdx = 0;
  let filteredPhotos = [...photos];

  function renderGallery(room) {
    if (!grid) return;
    activeRoom = room;
    filteredPhotos = room === 'all' ? photos : photos.filter((p) => p.room === room);
    grid.innerHTML = filteredPhotos
      .map(
        (p, i) => `
      <figure class="gallery-fig" data-idx="${i}" role="button" tabindex="0" aria-label="View ${p.title}">
        <img src="${p.src}" alt="${p.alt}" loading="lazy" decoding="async" width="400" height="267">
        <figcaption>
          <p class="cap-title">${p.title}</p>
          <p class="cap-meta">${p.meta}</p>
        </figcaption>
      </figure>`
      )
      .join('');

    grid.querySelectorAll('.gallery-fig').forEach((fig) => {
      const open = () => {
        lightboxIdx = parseInt(fig.dataset.idx, 10);
        if (typeof window.openLightbox === 'function') {
          window.openLightboxFromList(filteredPhotos, lightboxIdx);
        }
      };
      fig.addEventListener('click', open);
      fig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  document.querySelectorAll('.gf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.room);
    });
  });

  if (grid && photos.length) renderGallery('all');

  // ——— Lightbox extended for dynamic gallery ———
  window.openLightboxFromList = function (list, idx) {
    window._lbList = list.map((p) => p.src);
    window._lbAlts = list.map((p) => p.alt);
    window.currentImg = idx;
    const img = document.getElementById('lightboxImg');
    const lb = document.getElementById('lightbox');
    if (!img || !lb) return;
    img.src = window._lbList[idx];
    img.alt = window._lbAlts[idx] || 'Villa Augflor';
    document.getElementById('lightboxCounter').textContent = idx + 1 + ' / ' + window._lbList.length;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const origNav = window.lightboxNav;
  window.lightboxNav = function (dir) {
    const list = window._lbList || window.galleryImages;
    if (!list || !list.length) return;
    const cur = window.currentImg || 0;
    window.currentImg = (cur + dir + list.length) % list.length;
    const img = document.getElementById('lightboxImg');
    img.src = list[window.currentImg];
    if (window._lbAlts) img.alt = window._lbAlts[window.currentImg] || '';
    document.getElementById('lightboxCounter').textContent = window.currentImg + 1 + ' / ' + list.length;
  };

  // ——— Savings calculator ———
  const calcSelect = document.getElementById('savingsNights');
  const calcOut = document.getElementById('savingsOutput');
  if (calcSelect && calcOut) {
    const calc = () => {
      const nights = parseInt(calcSelect.value, 10);
      const peak = calcSelect.selectedOptions[0]?.dataset.peak === '1';
      const nightlyDirect = peak ? 480 : 420;
      const nightlyAirbnb = peak ? 520 : 450;
      const cleaningDirect = 120;
      const cleaningAirbnb = 150;
      const tax = 4 * nights;
      const guestFee = Math.round(nightlyAirbnb * nights * 0.12);
      const direct = nightlyDirect * nights + cleaningDirect + tax;
      const airbnb = nightlyAirbnb * nights + guestFee + cleaningAirbnb;
      const save = airbnb - direct;
      calcOut.innerHTML =
        'Direct total: <strong>€' +
        direct.toLocaleString('en') +
        '</strong> · Airbnb est.: €' +
        airbnb.toLocaleString('en') +
        ' · You save: <span>€' +
        save.toLocaleString('en') +
        '</span>';
    };
    calcSelect.addEventListener('change', calc);
    calc();
  }

  // ——— Inject ItemList schema for gallery ———
  if (photos.length && document.head) {
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Villa Augflor Photo Gallery',
      numberOfItems: photos.length,
      itemListElement: photos.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'ImageObject',
          contentUrl: 'https://villa-augflor.com/' + p.src,
          name: p.title,
          description: p.alt
        }
      }))
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(itemList);
    document.head.appendChild(s);
  }
})();
