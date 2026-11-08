/* berke.sh — ortak davranışlar: saat, kısayollar, komut paleti, sahne efektleri */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- yıl + saat ---------- */
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
  const clock = $('[data-clock]');
  if (clock) {
    const tick = () => {
      clock.textContent = new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'
      }).format(new Date()) + ' İzmir';
    };
    tick();
    setInterval(tick, 30000);
  }

  /* ---------- komutlar ---------- */
  const go = url => () => { window.location.href = url; return null; };
  const open = url => () => { window.open(url, '_blank', 'noopener'); return ['ok', `açılıyor: ${url}`]; };

  const commands = {
    yardim: () => ['out',
`kullanılabilir komutlar:
  whoami       kısa tanıtım
  ls           sayfaları listele
  projeler     projeler sayfasına git
  hakkimda     hakkımda bölümüne git
  deneyim      deneyim bölümüne git
  iletisim     iletişim sayfasına git
  cv           CV'yi aç (PDF)
  github       GitHub profilini aç
  linkedin     LinkedIn profilini aç
  eposta       e-posta yaz
  temizle      ekranı temizle
  cikis        paleti kapat`],
    whoami: () => ['out',
`Berke Erenç
junior backend developer, İzmir
.NET, Node.js ve PostgreSQL ile servis yazıyor;
React ve Angular ile uçtan uca ürüne çeviriyor.
remote / hybrid pozisyonlara açık.`],
    ls: () => ['out', 'index.html   projects.html   contact.html   blog.html   Berke-Erenc-CV.pdf'],
    projeler: go('projects.html'),
    hakkimda: go('index.html#hakkimda'),
    deneyim: go('index.html#deneyim'),
    iletisim: go('contact.html'),
    blog: go('blog.html'),
    anasayfa: go('index.html'),
    cv: open('Berke-Erenc-CV.pdf'),
    github: open('https://github.com/berkeerenc'),
    linkedin: open('https://linkedin.com/in/berke-erenc'),
    eposta: () => { window.location.href = 'mailto:berkeerenc@outlook.com'; return ['ok', 'e-posta istemcisi açılıyor…']; },
    sudo: () => ['err', 'izin reddedildi. root yetkisi işe alım sonrası verilir.'],
    temizle: () => 'clear',
    cikis: () => 'close'
  };
  const aliases = {
    help: 'yardim', yardım: 'yardim', '?': 'yardim', projects: 'projeler', about: 'hakkimda', hakkımda: 'hakkimda',
    contact: 'iletisim', iletişim: 'iletisim', mail: 'eposta', email: 'eposta', 'e-posta': 'eposta',
    clear: 'temizle', exit: 'cikis', çıkış: 'cikis', q: 'cikis', home: 'anasayfa', cd: 'anasayfa'
  };

  /* ---------- komut paleti ---------- */
  const palette = $('#palette');
  const log = palette && $('.palette-log', palette);
  const input = palette && $('input', palette);
  let lastFocus = null;

  const print = (cls, text) => {
    const line = document.createElement('div');
    line.className = cls;
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  };

  const openPalette = () => {
    if (!palette) return;
    lastFocus = document.activeElement;
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    if (!log.childElementCount) print('out', "berke.sh'a hoş geldin. komutları görmek için 'yardim' yaz.");
    input.focus();
  };
  const closePalette = () => {
    if (!palette) return;
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  };

  if (palette) {
    $('form', palette).addEventListener('submit', e => {
      e.preventDefault();
      const raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      print('echo', raw);
      const name = raw.toLocaleLowerCase('tr-TR').split(/\s+/)[0];
      const key = commands[name] ? name : aliases[name];
      if (!key) { print('err', `komut bulunamadı: ${name}. 'yardim' yazarak listeye bakabilirsin.`); return; }
      const res = commands[key]();
      if (res === 'clear') log.textContent = '';
      else if (res === 'close') closePalette();
      else if (Array.isArray(res)) print(res[0], res[1]);
    });
    palette.addEventListener('click', e => { if (e.target === palette) closePalette(); });
  }
  $$('[data-open-palette]').forEach(b => b.addEventListener('click', openPalette));

  /* ---------- klavye kısayolları ---------- */
  const shortcuts = {};
  $$('[data-key]').forEach(el => (shortcuts[el.dataset.key] = el));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && palette && palette.classList.contains('open')) { closePalette(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
    const t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === '/') { e.preventDefault(); openPalette(); return; }
    const k = e.key.toLocaleLowerCase('tr-TR');
    const target = shortcuts[k];
    if (target) { e.preventDefault(); target.click(); }
  });

  /* ---------- hero: genişleyen isim ---------- */
  const name = $('[data-stretch]');
  if (name) {
    const text = name.textContent;
    name.setAttribute('aria-label', text.trim());
    name.textContent = '';
    const letters = [];
    let afterSpace = false;
    [...text.trim()].forEach((ch, i) => {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      if (ch === ' ') afterSpace = true;
      s.className = ch === ' ' ? 'ch sp' : (afterSpace ? 'ch last' : 'ch');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.setProperty('--i', i);
      name.appendChild(s);
      if (ch !== ' ') letters.push(s);
    });

    if (!reduce) {
      requestAnimationFrame(() => setTimeout(() => name.classList.add('in'), 650));
      setTimeout(() => name.classList.add('settled'), 650 + 1000 + letters.length * 55);

      // imlece yakın harfler genişler
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (fine) {
        let raf = 0, mx = -9999, my = -9999;
        const apply = () => {
          raf = 0;
          letters.forEach(l => {
            const r = l.getBoundingClientRect();
            const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
            const f = Math.max(0, 1 - d / 260);
            l.style.setProperty('--w', (100 + f * 12.5).toFixed(1));
            l.style.setProperty('--wg', (800 - f * 300).toFixed(0));
          });
        };
        name.parentElement.addEventListener('pointermove', e => {
          mx = e.clientX; my = e.clientY;
          if (!raf) raf = requestAnimationFrame(apply);
        });
        name.parentElement.addEventListener('pointerleave', () => {
          mx = my = -9999;
          if (!raf) raf = requestAnimationFrame(apply);
        });
      }
    } else {
      name.classList.add('in');
    }
  }

  /* ---------- hero: yazılan komut ---------- */
  const typed = $('[data-type]');
  if (typed) {
    const full = typed.dataset.type;
    if (reduce) typed.textContent = full;
    else {
      let i = 0;
      const step = () => {
        typed.textContent = full.slice(0, ++i);
        if (i < full.length) setTimeout(step, 55 + Math.random() * 60);
      };
      setTimeout(step, 250);
    }
  }

  /* ---------- git log: kaydırınca satır satır ---------- */
  const logList = $('[data-gitlog]');
  if (logList) {
    if (reduce || !('IntersectionObserver' in window)) logList.classList.add('shown');
    else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) { logList.classList.add('shown'); io.disconnect(); }
        });
      }, { threshold: 0.2 });
      io.observe(logList);
    }
  }

  /* ---------- proje filtresi ---------- */
  const filters = $$('[data-filter]');
  if (filters.length) {
    const cards = $$('[data-cat]');
    const groups = $$('[data-group]');
    const count = $('[data-count]');
    const run = f => {
      let n = 0;
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
        c.hidden = !show;
        if (show) n++;
      });
      groups.forEach(g => (g.hidden = !$$('[data-cat]', g).some(c => !c.hidden)));
      if (count) count.textContent = `${n} proje listelendi`;
    };
    filters.forEach(b => b.addEventListener('click', () => {
      filters.forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      run(b.dataset.filter);
    }));
  }
})();
