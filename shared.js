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

  /* ---------- dil + komutlar ---------- */
  const EN = document.documentElement.lang === 'en';
  const CV = EN ? '../Berke-Erenc-CV.pdf' : 'Berke-Erenc-CV.pdf';
  const T = EN ? {
    welcome: "welcome to berke.sh. type 'help' to see the commands.",
    help:
`available commands:
  whoami       short intro
  ls           list pages
  projects     go to projects
  about        jump to about
  experience   jump to experience
  contact      go to contact
  cv           open CV (PDF)
  github       open GitHub profile
  linkedin     open LinkedIn profile
  email        write an email
  tr           Türkçe sürüme geç
  clear        clear the screen
  exit         close the command line`,
    whoami:
`Berke Erenç
junior backend developer, İzmir, Türkiye
writes services with .NET, Node.js and PostgreSQL;
turns them into end-to-end products with React and Angular.
open to remote / hybrid roles.`,
    ls: 'index.html   projects.html   contact.html   blog.html   ../Berke-Erenc-CV.pdf',
    opening: u => `opening: ${u}`,
    mail: 'opening your email client…',
    sudo: 'permission denied. root access is granted after hiring.',
    notFound: n => `command not found: ${n}. type 'help' to see the list.`,
    count: n => `${n} project${n === 1 ? '' : 's'} listed`,
    about: 'index.html#about', experience: 'index.html#experience',
    other: '../index.html'
  } : {
    welcome: "berke.sh'a hoş geldin. komutları görmek için 'yardim' yaz.",
    help:
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
  en           switch to English
  temizle      ekranı temizle
  cikis        paleti kapat`,
    whoami:
`Berke Erenç
junior backend developer, İzmir
.NET, Node.js ve PostgreSQL ile servis yazıyor;
React ve Angular ile uçtan uca ürüne çeviriyor.
remote / hybrid pozisyonlara açık.`,
    ls: 'index.html   projects.html   contact.html   blog.html   Berke-Erenc-CV.pdf',
    opening: u => `açılıyor: ${u}`,
    mail: 'e-posta istemcisi açılıyor…',
    sudo: 'izin reddedildi. root yetkisi işe alım sonrası verilir.',
    notFound: n => `komut bulunamadı: ${n}. 'yardim' yazarak listeye bakabilirsin.`,
    count: n => `${n} proje listelendi`,
    about: 'index.html#hakkimda', experience: 'index.html#deneyim',
    other: 'en/index.html'
  };

  const go = url => () => { window.location.href = url; return null; };
  const open = url => () => { window.open(url, '_blank', 'noopener'); return ['ok', T.opening(url)]; };

  const commands = {
    help: () => ['out', T.help],
    whoami: () => ['out', T.whoami],
    ls: () => ['out', T.ls],
    projects: go('projects.html'),
    about: go(T.about),
    experience: go(T.experience),
    contact: go('contact.html'),
    blog: go('blog.html'),
    home: go('index.html'),
    lang: go(T.other),
    cv: open(CV),
    github: open('https://github.com/berkeerenc'),
    linkedin: open('https://linkedin.com/in/berke-erenc'),
    email: () => { window.location.href = 'mailto:berkeerenc@outlook.com'; return ['ok', T.mail]; },
    sudo: () => ['err', T.sudo],
    clear: () => 'clear',
    exit: () => 'close'
  };
  const aliases = {
    yardim: 'help', yardım: 'help', '?': 'help',
    projeler: 'projects', hakkimda: 'about', hakkımda: 'about', deneyim: 'experience',
    iletisim: 'contact', iletişim: 'contact', yazilar: 'blog', yazılar: 'blog', writing: 'blog',
    anasayfa: 'home', cd: 'home',
    eposta: 'email', 'e-posta': 'email', mail: 'email',
    temizle: 'clear', cikis: 'exit', çıkış: 'exit', q: 'exit',
    tr: EN ? 'lang' : null, turkce: EN ? 'lang' : null, türkçe: EN ? 'lang' : null,
    en: EN ? null : 'lang', english: EN ? null : 'lang', ingilizce: EN ? null : 'lang'
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
    if (!log.childElementCount) print('out', T.welcome);
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
      const name = raw.toLocaleLowerCase(EN ? 'en-US' : 'tr-TR').split(/\s+/)[0];
      const key = commands[name] ? name : aliases[name];
      if (!key) { print('err', T.notFound(name)); return; }
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
    if (document.querySelector('.boot')) return;
    const t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === '/') { e.preventDefault(); openPalette(); return; }
    const k = e.key.toLocaleLowerCase(EN ? 'en-US' : 'tr-TR');
    const target = shortcuts[k];
    if (target) { e.preventDefault(); target.click(); }
  });

  /* ---------- açılış: boot sekansı (oturum başına bir kez, sadece ana sayfa) ---------- */
  const root = document.documentElement;
  let bootDone = Promise.resolve();
  if (root.classList.contains('booting')) {
    bootDone = new Promise(resolve => {
      const lines = EN ? [
        ['CPU    Akdeniz University, B.Sc. Computer Engineering', 'OK'],
        ['MEM    4 internships, 4 teams', 'OK'],
        ['GPU    PhysioVision: MediaPipe + LSTM, ~82% accuracy', 'OK'],
        ['LOAD   .NET  Node.js  PostgreSQL  React  Angular', 'bar'],
        ['MOUNT  /projects', '9 found'],
        ['NET    İzmir, Türkiye  remote / hybrid', 'OK'],
        ['>      starting berke.sh', '']
      ] : [
        ['CPU    Akdeniz Üniversitesi, Bilgisayar Mühendisliği', 'OK'],
        ['MEM    4 staj, 4 ekip', 'OK'],
        ['GPU    PhysioVision: MediaPipe + LSTM, ~%82 doğruluk', 'OK'],
        ['LOAD   .NET  Node.js  PostgreSQL  React  Angular', 'bar'],
        ['MOUNT  /projeler', '9 bulundu'],
        ['NET    İzmir, Türkiye  remote / hybrid', 'OK'],
        ['>      berke.sh başlatılıyor', '']
      ];
      const el = document.createElement('div');
      el.className = 'boot';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML =
        `<div class="boot-head"><span><b>BERKE-BIOS</b> v26.11</span><span>© Berke Erenç</span></div>` +
        `<ol class="boot-lines"></ol>` +
        `<p class="boot-skip">${EN ? 'press any key to skip' : 'geçmek için bir tuşa bas'}</p>`;
      document.body.appendChild(el);
      const list = el.querySelector('.boot-lines');
      const timers = [];
      let finished = false;

      const finish = e => {
        if (e && e.type === 'keydown') e.preventDefault();
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        try { sessionStorage.setItem('berke-booted', '1'); } catch (e) {}
        root.classList.remove('booting');
        el.classList.add('off');
        setTimeout(() => { el.remove(); resolve(); }, 380);
        ['keydown', 'pointerdown', 'touchstart'].forEach(t => window.removeEventListener(t, finish));
      };
      window.addEventListener('keydown', finish);
      ['pointerdown', 'touchstart'].forEach(t => window.addEventListener(t, finish, { passive: true }));

      let t = 120;
      lines.forEach(([text, status]) => {
        timers.push(setTimeout(() => {
          const li = document.createElement('li');
          if (status === 'bar') {
            li.innerHTML = `${text}<span class="boot-bar"><i></i></span>`;
            list.appendChild(li);
            requestAnimationFrame(() => requestAnimationFrame(() => { li.querySelector('i').style.width = 'calc(100% - 2px)'; }));
          } else {
            li.textContent = text + (status ? '  ' : '');
            if (status) {
              const s = document.createElement('span');
              s.className = status === 'OK' ? 'ok' : 'hl';
              s.textContent = `[ ${status} ]`;
              li.appendChild(s);
            }
            list.appendChild(li);
          }
        }, t));
        t += status === 'bar' ? 620 : 190;
      });
      timers.push(setTimeout(finish, t + 280));
    });
  }

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
      const delay = root.classList.contains('booting') ? 60 : 650;
      bootDone.then(() => {
        requestAnimationFrame(() => setTimeout(() => name.classList.add('in'), delay));
        setTimeout(() => name.classList.add('settled'), delay + 1000 + letters.length * 55);
      });

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
      bootDone.then(() => setTimeout(step, 250));
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
      if (count) count.textContent = T.count(n);
    };
    filters.forEach(b => b.addEventListener('click', () => {
      filters.forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      run(b.dataset.filter);
    }));
  }
})();
