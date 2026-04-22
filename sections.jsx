const { useState, useEffect, useRef } = React;
const { WA, STRINGS, IMGS, CALENDAR, REVIEWS, FAQS, DESTS, TIMELINE, TICKER_ITEMS,
        useReveal, useScrollY, useCountUp } = window;

// ─── ScrollProgress ───────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return <div className="scroll-progress" style={{ width: pct + '%' }} />;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = STRINGS[lang];
  const langs = ['en', 'fr', 'de'];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const nextLang = langs[(langs.indexOf(lang) + 1) % langs.length];
  const close = () => setMobileOpen(false);

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a href="#" className="nav-logo" onClick={close}>Villa Augflor</a>
        <div className="nav-links">
          <a href="#about" className="nav-link">{t.villaLabel}</a>
          <a href="#gallery" className="nav-link">{t.galleryLabel}</a>
          <a href="#location" className="nav-link">Location</a>
          <a href="#rates" className="nav-link">{lang === 'fr' ? 'Tarifs' : lang === 'de' ? 'Preise' : 'Rates'}</a>
          <button className="lang-btn" onClick={() => setLang(nextLang)}>{nextLang.toUpperCase()}</button>
          <a href={WA} className="nav-link nav-cta" target="_blank">{t.book}</a>
        </div>
        <button
          className={`nav-hamburger${mobileOpen ? ' open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <a href="#about" onClick={close}>{t.villaLabel}</a>
        <a href="#gallery" onClick={close}>{t.galleryLabel}</a>
        <a href="#location" onClick={close}>Location</a>
        <a href="#rates" onClick={close}>{lang === 'fr' ? 'Tarifs' : lang === 'de' ? 'Preise' : 'Rates'}</a>
        <a href={WA} target="_blank" onClick={close} style={{ color: 'var(--gold)' }}>{t.book}</a>
        <div className="m-sub" onClick={() => { setLang(nextLang); }}>
          {lang.toUpperCase()} → {nextLang.toUpperCase()}
        </div>
      </div>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ lang, heroImg }) {
  const t = STRINGS[lang];
  const imgMap = {
    pool: IMGS[0].src, terrace: IMGS[1].src,
    garden: IMGS[6].src, exterior: IMGS[5].src,
  };
  return (
    <section className="hero" style={{ padding: 0 }} id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url('${imgMap[heroImg] || IMGS[0].src}')` }} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-label">{t.heroLabel}</div>
        <h1 className="hero-title">
          {t.heroTitle.filter(Boolean).map((line, i) => (
            <span className="line" key={i}><span>{line}</span></span>
          ))}
        </h1>
        <p className="hero-sub">{t.heroSub}</p>
        <div className="hero-actions">
          <a href={WA} className="btn-primary" target="_blank">{t.checkAvail}</a>
          <a href="#about" className="btn-ghost">{t.discover}</a>
        </div>
      </div>
      <div className="hero-scroll">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {TICKER_ITEMS.map((item, i) => (
          <span className="ticker-item" key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  const [ref, visible] = useReveal(0.5);
  const score = useCountUp(479, 1200, visible);
  const reviews = useCountUp(38, 1000, visible);
  const items = [
    { num: (score / 100).toFixed(2) + '★', label: 'Guest Rating' },
    { num: reviews, label: 'Verified Reviews' },
    { num: '15\'', label: 'Nice Airport' },
    { num: '–20%', label: 'vs. Airbnb Price' },
    { num: '4★', label: 'Gîtes de France' },
  ];
  return (
    <div className="trust-bar" ref={ref}>
      {items.map(it => (
        <div className="trust-item" key={it.label}>
          <span className="trust-num">{it.num}</span>
          <span className="trust-label">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── The Villa ────────────────────────────────────────────────────────────────
function TheVilla({ lang, onOpenImg }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  const features = [
    'Private pool & sun terraces', '3 bedrooms · sleeps up to 6',
    'Partial sea & valley views', 'Designer Mediterranean garden',
    'Fully equipped kitchen', 'Outdoor BBQ dining',
    'Air conditioning', 'High-speed wifi',
    'Key-locker self check-in', 'Hosted by Lana · 10+ years',
  ];
  return (
    <section id="about">
      <div className="container">
        <div className="villa-grid">
          <div className={`villa-text reveal${visible ? ' visible' : ''}`} ref={ref}>
            <span className="section-label">{t.villaLabel}</span>
            <h2 className="section-title"><em>{t.villaH1}</em><br />{t.villaH2}</h2>
            <p className="villa-copy">
              Tucked into the peaceful hills above Cagnes-sur-Mer, Villa Augflor is a family home distinguished by its <strong>uniquely designed Mediterranean garden</strong> — a curated landscape of jasmine, bougainvillea, fruit trees and fragrant Provençal planting that transforms every outdoor hour into something special.
            </p>
            <p className="villa-copy">
              The architecture and interiors carry the same distinctive eye: thoughtfully styled bedrooms, a luminous open-plan living area, and terraces oriented for morning coffee, afternoon sunbathing, and starlit dinners alike. <strong>This is not a standard rental.</strong>
            </p>
            <div className="villa-features">
              {features.map(f => <div className="feat" key={f}><span className="feat-dot" />{f}</div>)}
            </div>
            <div className="villa-note">
              Bed sizes: 200×220 · 180×200 · 160×200 cm · Upper loft floor with character — ground-floor rooms available on request.
            </div>
          </div>
          <div className="villa-img-stack">
            <img className="villa-img villa-img-main" src={IMGS[0].src} alt="Pool and garden" onClick={() => onOpenImg(0)} loading="lazy" />
            <img className="villa-img villa-img-side" src={IMGS[2].src} alt="Living area" onClick={() => onOpenImg(2)} loading="lazy" />
            <img className="villa-img villa-img-side" src={IMGS[4].src} alt="Bedroom" onClick={() => onOpenImg(4)} loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pull Quote ───────────────────────────────────────────────────────────────
function PullQuote() {
  const [ref, visible] = useReveal();
  return (
    <div className="pullquote">
      <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
        <div className="pq-stars">★★★★★</div>
        <p className="pq-text">"The villa is a small paradise to escape to — one place safe and beautiful. We didn't want to leave."</p>
        <div className="pq-author">Maxim R. · Belgium · Summer 2025</div>
      </div>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ lang, lightboxIdx, setLightboxIdx }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  useEffect(() => {
    const fn = e => {
      if (lightboxIdx === null) return;
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % IMGS.length);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i - 1 + IMGS.length) % IMGS.length);
      if (e.key === 'Escape') setLightboxIdx(null);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lightboxIdx]);

  return (
    <section id="gallery" style={{ background: 'var(--cream2)', paddingBottom: 80 }}>
      <div className="container">
        <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
          <span className="section-label">{t.galleryLabel}</span>
          <h2 className="section-title"><em>{t.galleryH1}</em> {t.galleryH2}</h2>
        </div>
        <div className="gallery-grid">
          {IMGS.map((img, i) => (
            <div className="gallery-wrap" key={i} onClick={() => setLightboxIdx(i)}>
              <img className="gallery-img" src={img.src} alt={img.label} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
      {lightboxIdx !== null && (
        <div className="lightbox" onClick={() => setLightboxIdx(null)}>
          <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + IMGS.length) % IMGS.length); }}>‹</button>
          <img className="lb-img" src={IMGS[lightboxIdx].src} alt={IMGS[lightboxIdx].label} onClick={e => e.stopPropagation()} />
          <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % IMGS.length); }}>›</button>
          <button className="lb-close" onClick={() => setLightboxIdx(null)}>×</button>
          <div className="lb-label">{IMGS[lightboxIdx].label} · {lightboxIdx + 1} / {IMGS.length}</div>
        </div>
      )}
    </section>
  );
}

// ─── Experience Timeline ──────────────────────────────────────────────────────
function ExperienceTimeline({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  const [activeImg, setActiveImg] = useState(IMGS[1].src);
  return (
    <section className="tl-section">
      <div className="container">
        <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
          <span className="section-label">{t.tlLabel}</span>
          <h2 className="section-title"><em>{t.tlH1}</em><br />{t.tlH2}</h2>
        </div>
        <div className="tl-inner" style={{ marginTop: 52 }}>
          <div className="tl-items">
            {TIMELINE.map((item, i) => (
              <div
                className="tl-item"
                key={i}
                onMouseEnter={() => setActiveImg(IMGS[i % IMGS.length].src)}
              >
                <div className="tl-time">{item.time}</div>
                <div>
                  <div className="tl-title">{item.title}</div>
                  <div className="tl-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="tl-img-wrap">
            <img
              className="tl-img"
              src={activeImg}
              alt="Villa moment"
              style={{ transition: 'opacity .4s' }}
              key={activeImg}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Location ─────────────────────────────────────────────────────────────────
function LocationMap() {
  const cx = 240, cy = 240;
  const pts = [
    { name: 'Haut-de-Cagnes', time: '5 min', a: 320, r: 62 },
    { name: 'Nice Airport', time: '15 min', a: 90, r: 108 },
    { name: 'Cros-de-Cagnes Beach', time: '15 min', a: 195, r: 108 },
    { name: 'Saint-Paul-de-Vence', time: '15 min', a: 28, r: 108 },
    { name: 'Nice centre', time: '25 min', a: 112, r: 155 },
    { name: 'Antibes', time: '25 min', a: 185, r: 155 },
    { name: 'Cannes', time: '35 min', a: 215, r: 182 },
    { name: 'Monaco', time: '50 min', a: 60, r: 196 },
  ];
  return (
    <svg viewBox="0 0 480 480" style={{ width: '100%', maxWidth: 480 }}>
      {[62, 108, 155, 196].map(r => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      {pts.map((p, i) => {
        const rad = (p.a - 90) * Math.PI / 180;
        const x = cx + p.r * Math.cos(rad), y = cy + p.r * Math.sin(rad);
        const right = x > cx;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(184,146,74,.25)" strokeWidth="1" />
            <circle cx={x} cy={y} r={5} fill="#B8924A" opacity=".85" />
            <circle cx={x} cy={y} r={10} fill="none" stroke="#B8924A" strokeWidth="1" opacity=".25" />
            <text x={x + (right ? 13 : -13)} y={y - 3} textAnchor={right ? 'start' : 'end'} fontSize="11.5" fill="rgba(255,255,255,.75)" fontFamily="Jost,sans-serif" fontWeight="300">{p.name}</text>
            <text x={x + (right ? 13 : -13)} y={y + 13} textAnchor={right ? 'start' : 'end'} fontSize="11" fill="#B8924A" fontFamily="Jost,sans-serif" fontStyle="italic">{p.time}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={36} fill="none" stroke="#C4673A" strokeWidth="1" opacity=".2" />
      <circle cx={cx} cy={cy} r={22} fill="none" stroke="#C4673A" strokeWidth="1.5" opacity=".35" />
      <circle cx={cx} cy={cy} r={13} fill="#C4673A" />
      <text x={cx} y={cy + 46} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.6)" fontFamily="Jost,sans-serif" fontWeight="400" letterSpacing="1.5">VILLA AUGFLOR</text>
    </svg>
  );
}

function Location({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  return (
    <section id="location" className="loc-section">
      <div className="container">
        <div className="loc-inner">
          <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
            <span className="section-label">{t.locLabel}</span>
            <h2 className="section-title"><em>{t.locH1}</em><br />{t.locH2}</h2>
            <p className="loc-copy">{t.locCopy}</p>
            <div className="dest-list">
              {DESTS.map(d => (
                <div className="dest" key={d.name}>
                  <span className="dest-name">{d.name}</span>
                  <span className="dest-time">{d.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div><LocationMap /></div>
        </div>
      </div>
    </section>
  );
}

// ─── Book Direct ──────────────────────────────────────────────────────────────
function BookDirect({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  return (
    <section>
      <div className="container">
        <div className="bd-inner">
          <div className={`bd-card reveal${visible ? ' visible' : ''}`} ref={ref}>
            <div className="bd-saving">€700+</div>
            <div className="bd-saving-label">saved per week vs. Airbnb</div>
            <div className="bd-rows">
              <div className="bd-row"><span className="rl">Peak week direct (Jul/Aug)</span><span className="rv">€3,640</span></div>
              <div className="bd-row"><span className="rl">Airbnb + service fee (~17%)</span><span className="rv">€4,340+</span></div>
              <div className="bd-row tot"><span className="rl">You keep</span><span className="rv">€700+</span></div>
            </div>
            <div style={{ marginTop: 28 }}>
              <a href={WA} className="btn-primary" target="_blank" style={{ width: '100%', textAlign: 'center', display: 'block' }}>{t.checkAvail}</a>
            </div>
          </div>
          <div className={`bd-text reveal d2${visible ? ' visible' : ''}`}>
            <span className="section-label">{t.bdLabel}</span>
            <h2 className="section-title"><em>{t.bdH1}</em><br />{t.bdH2}</h2>
            <p className="section-body">{t.bdCopy}</p>
            <div className="bd-features">
              {['Best rate guaranteed — 20% below any platform', 'Direct communication with Lana from first message', 'Concierge: private chef, airport transfers, wine tastings', '€500 security deposit, refunded in full post-stay', 'Flexible, personal — not a faceless booking portal'].map(f => (
                <div className="bd-feat" key={f}><span className="bd-feat-icon">→</span>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How to Book ──────────────────────────────────────────────────────────────
function HowToBook({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  const steps = [
    { num: '01', title: 'Check availability', desc: 'Message Lana on WhatsApp with your dates and group size. She typically replies within 2 hours.' },
    { num: '02', title: 'Reserve your week', desc: 'Confirm your dates with a simple payment. No platform, no hidden fees — best rate guaranteed.' },
    { num: '03', title: 'Arrive & enjoy', desc: 'Self check-in from 15:00 via key locker. Lana\'s local guide, your stocked fridge suggestion, and the pool are waiting.' },
  ];
  return (
    <section className="htb-section">
      <div className="container">
        <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
          <span className="section-label">{t.htbLabel}</span>
          <h2 className="section-title" style={{ color: '#fff' }}><em>{t.htbH1}</em><br />{t.htbH2}</h2>
        </div>
        <div className="htb-steps">
          {steps.map((s, i) => (
            <div className={`htb-step reveal d${i + 1}${visible ? ' visible' : ''}`} key={i}>
              {i < steps.length - 1 && <span className="htb-step-arrow">→</span>}
              <div className="htb-num">{s.num}</div>
              <div className="htb-title">{s.title}</div>
              <div className="htb-desc">{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 52, textAlign: 'center' }}>
          <a href={WA} className="btn-white" target="_blank">{t.enquire}</a>
        </div>
      </div>
    </section>
  );
}

// ─── Lana Section ─────────────────────────────────────────────────────────────
function LanaSection({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  return (
    <section>
      <div className="container">
        <div className="lana-inner">
          <div className={`lana-img-col reveal${visible ? ' visible' : ''}`} ref={ref}>
            <img className="lana-img" src={IMGS[3].src} alt="Villa garden — your host Lana" loading="lazy" />
            <div className="lana-badge-float">
              <strong>Lana</strong>
              Host · 10+ years · Côte d'Azur
            </div>
          </div>
          <div className={`reveal d2${visible ? ' visible' : ''}`}>
            <span className="section-label">{t.lanaLabel}</span>
            <h2 className="section-title"><em>{t.lanaH1}</em><br />{t.lanaH2}</h2>
            <blockquote className="lana-quote">
              "I've been welcoming guests to this villa for over a decade. It's not just a rental — it's my home, and I want every stay to feel like yours."
            </blockquote>
            <p className="lana-copy">
              From the moment you enquire to the morning you leave, Lana handles everything personally — airport transfers, private chefs, wine tastings at estates not open to the public, local tips that no guidebook has. She knows every restaurant, every hidden beach, every shortcut.
            </p>
            <p className="lana-copy">
              When you book direct, you're not dealing with a platform. You're talking to the person who planted every flower in that garden.
            </p>
            <span className="lana-sig">Lana</span>
            <span className="lana-sig-title">Villa Augflor · Cagnes-sur-Mer</span>
            <div className="lana-badges">
              {['10+ Years Hosting', 'Gîtes de France ★★★★', '4.79★ Rating', 'Replies in 2 hrs'].map(b => (
                <span className="lana-badge-item" key={b}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Availability ─────────────────────────────────────────────────────────────
function Availability({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  const [sel, setSel] = useState(null);
  const [currency, setCurrency] = useState('EUR');
  const symbols = { EUR: '€', GBP: '£', USD: '$' };
  const rateKey = { EUR: 'rate', GBP: 'rateGBP', USD: 'rateUSD' };
  const sym = symbols[currency];
  const available = CALENDAR.flatMap(m => m.weeks).filter(w => w.status === 'av').length;

  const getRate = (m) => m[rateKey[currency]];

  return (
    <section id="rates" className="avail-section">
      <div className="container">
        <div className="avail-top">
          <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
            <div className="scarcity">
              <span className="scarcity-pulse" />
              Only {available} weeks available in 2026
            </div>
            <span className="section-label">{t.availLabel}</span>
            <h2 className="section-title"><em>{t.availH1}</em><br />{t.availH2}</h2>
          </div>
          <div>
            <div className="avail-note">
              7-night minimum · Up to 6 guests<br />Click any available week to enquire
            </div>
            <div className="currency-toggle">
              {['EUR', 'GBP', 'USD'].map(c => (
                <button key={c} className={`curr-btn${currency === c ? ' active' : ''}`} onClick={() => setCurrency(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="avail-grid">
          {CALENDAR.map((m, mi) => (
            <div className="avail-month" key={m.month}>
              <div className="avail-mname">{m.month}</div>
              <div className="avail-mrate">{sym}{getRate(m)}/night · {sym}{getRate(m) * 7}/week</div>
              <div className="avail-weeks">
                {m.weeks.map((w, wi) => {
                  const isSel = sel && sel.mi === mi && sel.wi === wi;
                  return (
                    <div
                      key={wi}
                      className={`avail-week ${w.status}${isSel ? ' sel' : ''}`}
                      onClick={() => w.status !== 'bk' && setSel(isSel ? null : { mi, wi })}
                    >
                      <span>{w.label}</span>
                      <span>{w.status === 'bk' ? 'Booked' : 'Available'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="avail-legend">
          <div className="legend-dot" style={{ background: '#EFF7F2', border: '1px solid rgba(42,107,70,.2)' }} /><span>Available</span>
          <div className="legend-dot" style={{ background: '#FAF0EE' }} /><span>Booked</span>
          <div className="legend-dot" style={{ background: 'var(--gold)' }} /><span>Selected</span>
        </div>
        {sel && (
          <div className="avail-panel">
            <div className="asp-week">{CALENDAR[sel.mi].weeks[sel.wi].label}</div>
            <div className="asp-price">{sym}{getRate(CALENDAR[sel.mi]) * 7}</div>
            <div className="asp-night">{sym}{getRate(CALENDAR[sel.mi])}/night · 7 nights · up to 6 guests · cleaning fee additional</div>
            <a href={`${WA}?text=Hi Lana, I'd like to enquire about ${CALENDAR[sel.mi].weeks[sel.wi].label}`} className="asp-cta" target="_blank">
              {t.enquire} — {CALENDAR[sel.mi].weeks[sel.wi].label} →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
function Reviews({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  return (
    <section>
      <div className="container">
        <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
          <span className="section-label">{t.reviewLabel}</span>
          <h2 className="section-title"><em>{t.reviewH1}</em><br />{t.reviewH2}</h2>
        </div>
        <div className="reviews-grid">
          {REVIEWS.map((r, i) => (
            <div className={`review-card reveal d${i + 1}${visible ? ' visible' : ''}`} key={i}>
              <div className="review-stars">{'★'.repeat(r.stars)}</div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">{r.author}</div>
            </div>
          ))}
        </div>
        <div className="reviews-agg">
          <div className="agg-score">4.79</div>
          <div className="agg-right">
            <div className="agg-stars">★★★★★</div>
            <div className="agg-label">out of 5.0</div>
            <div className="agg-sub">38 verified stays · Cleanliness, Location & Hospitality all rated 4.8+</div>
            <a href="https://www.airbnb.fr/rooms/26836386/reviews" className="agg-link" target="_blank">All reviews on Airbnb →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Instagram Grid ───────────────────────────────────────────────────────────
function InstagramGrid({ lang, onOpenImg }) {
  const t = STRINGS[lang];
  const igImgs = [IMGS[0], IMGS[6], IMGS[1], IMGS[3], IMGS[7], IMGS[10]];
  const [ref, visible] = useReveal();
  return (
    <section className="ig-section">
      <div className="container">
        <div className={`ig-header reveal${visible ? ' visible' : ''}`} ref={ref}>
          <div>
            <span className="section-label">{t.igLabel}</span>
            <div className="ig-handle">{t.igH1}</div>
          </div>
          <a href="https://www.instagram.com/villa_augflor_france/" target="_blank" className="btn-primary">Follow on Instagram</a>
        </div>
        <div className="ig-grid">
          {igImgs.map((img, i) => (
            <div className={`ig-cell reveal d${(i % 3) + 1}${visible ? ' visible' : ''}`} key={i} onClick={() => onOpenImg(IMGS.indexOf(img))}>
              <img src={img.src} alt={img.label} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ lang }) {
  const t = STRINGS[lang];
  const [open, setOpen] = useState(null);
  const [ref, visible] = useReveal();
  return (
    <section>
      <div className="container">
        <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
          <span className="section-label">{t.faqLabel}</span>
          <h2 className="section-title"><em>{t.faqH1}</em><br />{t.faqH2}</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <span className={`faq-icon${open === i ? ' open' : ''}`}>+</span>
              </div>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ lang }) {
  const t = STRINGS[lang];
  const [ref, visible] = useReveal();
  return (
    <section className="final-cta">
      <div className={`reveal${visible ? ' visible' : ''}`} ref={ref}>
        <span className="section-label">{t.ctaLabel}</span>
        <h2 className="section-title"><em>{t.ctaH1}</em><br />{t.ctaH2}</h2>
        <p className="fc-body">{t.ctaCopy}</p>
        <div className="fc-actions">
          <a href={WA} className="btn-white" target="_blank">{t.enquire}</a>
          <a href="https://www.airbnb.fr/rooms/26836386" className="btn-gold-outline" target="_blank">{t.viewAirbnb}</a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Villa Augflor</div>
            <p className="footer-tag">A private villa with pool and designer Mediterranean garden at the heart of the Côte d'Azur. Between Nice, Antibes and Cannes. 15 minutes from Nice Airport.</p>
            <div className="footer-contact">
              <div><a href="mailto:villa.augflor@gmail.com">villa.augflor@gmail.com</a></div>
              <div><a href="tel:+33623777333">+33 623 777 333</a></div>
              <div style={{ color: 'rgba(255,255,255,.25)', marginTop: 4 }}>26 Chemin des Collines<br />Cagnes-sur-Mer 06800, France</div>
            </div>
          </div>
          <div>
            <div className="footer-h">The Villa</div>
            <ul className="footer-links">
              {[['About & rooms', '#about'], ['Photo gallery', '#gallery'], ['Location', '#location'], ['Rates', '#rates'], ['FAQ', '#faq']].map(([l, h]) => (
                <li key={l}><a href={h}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-h">Book</div>
            <ul className="footer-links">
              {[['Book direct (WhatsApp)', WA], ['Airbnb listing', 'https://www.airbnb.fr/rooms/26836386'], ['Instagram', 'https://www.instagram.com/villa_augflor_france/'], ['Facebook', 'https://www.facebook.com/Villa-Augflor-French-Riviera-114028656961294']].map(([l, h]) => (
                <li key={l}><a href={h} target="_blank">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-h">Nearby</div>
            <ul className="footer-links">
              {['Nice — 25 min', 'Antibes — 25 min', 'Cannes — 35 min', 'Saint-Paul — 15 min', 'Monaco — 50 min'].map(l => (
                <li key={l}><a href="#location">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Villa Augflor · All rights reserved</div>
          <div className="footer-badges">Gîtes de France ★★★★ · Alpes-Maritimes, France</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Sticky Widget ────────────────────────────────────────────────────────────
function StickyWidget({ lang }) {
  const t = STRINGS[lang];
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div className={`sticky-widget${(!visible || dismissed) ? ' hidden' : ''}`}>
      <button className="sw-x" onClick={() => setDismissed(true)}>×</button>
      <div className="sw-avail">Summer 2026 · Limited dates remaining</div>
      <div className="sw-title">Book direct & save</div>
      <div className="sw-sub">€700+ back vs. Airbnb · Best rate guaranteed</div>
      <a href={WA} className="sw-btn" target="_blank">{t.enquire} →</a>
    </div>
  );
}

// ─── Back to Top ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <button className={`btt${visible ? ' visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
      ↑
    </button>
  );
}

Object.assign(window, {
  ScrollProgress, Nav, Hero, Ticker, TrustBar, TheVilla, PullQuote,
  Gallery, ExperienceTimeline, Location, BookDirect, HowToBook,
  LanaSection, Availability, Reviews, InstagramGrid, FAQ,
  FinalCTA, Footer, StickyWidget, BackToTop,
});
