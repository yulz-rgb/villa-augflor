const { useState, useEffect } = React;
const {
  ScrollProgress, Nav, Hero, Ticker, TrustBar, TheVilla, PullQuote,
  Gallery, ExperienceTimeline, Location, BookDirect, HowToBook,
  LanaSection, Availability, Reviews, InstagramGrid, FAQ,
  FinalCTA, Footer, StickyWidget, BackToTop,
} = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#B8924A",
  "heroImage": "pool",
  "showTimeline": true,
  "showLana": true
}/*EDITMODE-END*/;

function TweaksPanel({ show }) {
  const [vals, setVals] = useState(TWEAK_DEFAULTS);
  const heroImgs = {
    pool: 'https://www.villa-augflor.com/images/img_7247-3.jpg',
    terrace: 'https://www.villa-augflor.com/images/img_7245-3.jpg',
    garden: 'https://www.villa-augflor.com/images/img_7340-2.jpg',
    exterior: 'https://www.villa-augflor.com/images/airbnb-5bfc.jpg',
  };
  const update = (key, val) => {
    const next = { ...vals, [key]: val };
    setVals(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*');
    if (key === 'accentColor') {
      document.documentElement.style.setProperty('--gold', val);
    }
    if (key === 'heroImage') {
      const bg = document.querySelector('.hero-bg');
      if (bg) bg.style.backgroundImage = `url('${heroImgs[val]}')`;
    }
  };
  useEffect(() => {
    document.documentElement.style.setProperty('--gold', vals.accentColor);
  }, []);

  return (
    <div className={`tw-panel${show ? '' : ' hidden'}`}>
      <div className="tw-h">Tweaks</div>
      <div className="tw-row">
        <label>Accent Colour</label>
        <input type="color" value={vals.accentColor} onChange={e => update('accentColor', e.target.value)} />
      </div>
      <div className="tw-row">
        <label>Hero Image</label>
        <select value={vals.heroImage} onChange={e => update('heroImage', e.target.value)}>
          <option value="pool">Pool & Garden</option>
          <option value="terrace">Pool Terrace</option>
          <option value="garden">Mediterranean Garden</option>
          <option value="exterior">Villa Exterior</option>
        </select>
      </div>
      <div className="tw-row">
        <label>Show Timeline</label>
        <select value={vals.showTimeline ? 'yes' : 'no'} onChange={e => update('showTimeline', e.target.value === 'yes')}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="tw-row">
        <label>Show Lana Section</label>
        <select value={vals.showLana ? 'yes' : 'no'} onChange={e => update('showLana', e.target.value === 'yes')}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState('en');
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [showTweaks, setShowTweaks] = useState(false);
  const [tweakVals, setTweakVals] = useState(TWEAK_DEFAULTS);

  useEffect(() => {
    const handler = e => {
      if (e.data?.type === '__activate_edit_mode') setShowTweaks(true);
      if (e.data?.type === '__deactivate_edit_mode') setShowTweaks(false);
      if (e.data?.type === '__edit_mode_set_keys') setTweakVals(v => ({ ...v, ...e.data.edits }));
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <>
      <ScrollProgress />
      <Nav lang={lang} setLang={setLang} />
      <Hero lang={lang} heroImg={tweakVals.heroImage} />
      <Ticker />
      <TrustBar />
      <TheVilla lang={lang} onOpenImg={setLightboxIdx} />
      <PullQuote />
      <Gallery lang={lang} lightboxIdx={lightboxIdx} setLightboxIdx={setLightboxIdx} />
      {tweakVals.showTimeline && <ExperienceTimeline lang={lang} />}
      <Location lang={lang} />
      <BookDirect lang={lang} />
      <HowToBook lang={lang} />
      {tweakVals.showLana && <LanaSection lang={lang} />}
      <Availability lang={lang} />
      <Reviews lang={lang} />
      <InstagramGrid lang={lang} onOpenImg={setLightboxIdx} />
      <FAQ lang={lang} />
      <FinalCTA lang={lang} />
      <Footer />
      <StickyWidget lang={lang} />
      <BackToTop />
      <TweaksPanel show={showTweaks} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
