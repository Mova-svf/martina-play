'use strict';
/* ============ MOTOR: estado, voz, sonidos, arrastre, personajes ============ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- Estado guardado ---------- */
const STORE_KEY = 'martina-app-v1';
let S;
function loadState() {
  const base = JSON.parse(JSON.stringify(DEFAULT_STATE));
  try { S = Object.assign(base, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { S = base; }
  S.settings = Object.assign({}, DEFAULT_STATE.settings, S.settings || {});
  if (S.pet) {
    S.pet.outfit = S.pet.outfit || {};
    const h = (Date.now() - (S.pet.t || Date.now())) / 3600000;
    if (h > 0) {
      S.pet.hunger = clamp(S.pet.hunger - h * 6, 10, 100);
      S.pet.clean = clamp(S.pet.clean - h * 4, 10, 100);
      S.pet.energy = clamp(S.pet.energy - h * 3, 10, 100);
      S.pet.happy = clamp(S.pet.happy - h * 3, 20, 100);
    }
    S.pet.t = Date.now();
  }
}
function save() { if (S.pet) S.pet.t = Date.now(); try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }
function petStat(k, d) { if (S.pet) { S.pet[k] = clamp((S.pet[k] || 0) + d, 0, 100); save(); } }

const petName = () => (S.pet && S.pet.name) || 'Coco';
const fill = (s) => String(s || '').replace(/\{name\}/g, S.settings.name || 'Martina').replace(/\{pet\}/g, petName());

/* ---------- Voz (Text to Speech) ---------- */
const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Deranged|Hysterical|Junior|Ralph|Fred|Kathy|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley/i;
const Voice = {
  en: null, es: null, token: 0, supported: 'speechSynthesis' in window,
  init() {
    if (!this.supported) return;
    const load = () => {
      const vs = speechSynthesis.getVoices().filter((v) => !NOVELTY.test(v.name));
      if (!vs.length) return;
      this.en = this.best(vs, ['en-US', 'en-GB', 'en-AU', 'en'], ['Samantha', 'Ava', 'Allison', 'Google US English', 'Karen', 'Susan', 'Zira', 'Aria', 'Jenny']);
      this.es = this.best(vs, ['es-CL', 'es-MX', 'es-US', 'es-419', 'es-ES', 'es'], ['Paulina', 'Mónica', 'Monica', 'Google español de Estados Unidos', 'Google español', 'Sabina', 'Helena', 'Dalia']);
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  best(vs, langs, names) {
    for (const l of langs) {
      const c = vs.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(l.toLowerCase()));
      if (!c.length) continue;
      const premium = c.find((v) => /premium|enhanced|mejorad/i.test(v.name) && names.some((n) => v.name.includes(n)));
      if (premium) return premium;
      for (const n of names) { const f = c.find((v) => v.name.includes(n)); if (f) return f; }
      return c[0];
    }
    return null;
  },
  unlock() { if (!this.supported) return; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {} },
  one(text, lang, o = {}) {
    return new Promise((res) => {
      if (!this.supported || !text) return res();
      const u = new SpeechSynthesisUtterance(text);
      const v = lang === 'en' ? this.en : this.es;
      if (v) u.voice = v;
      u.lang = v ? v.lang : (lang === 'en' ? 'en-US' : 'es-MX');
      u.rate = (lang === 'en' ? (S.settings.slow ? 0.7 : 0.85) : 0.98) * (o.rate || 1);
      u.pitch = o.pitch || 1.1;
      let fin = false;
      const t = setTimeout(() => done(), 2000 + text.length * 120);
      const done = () => { if (fin) return; fin = true; clearTimeout(t); res(); };
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    });
  },
  /* parts: [['en','Hello'], ['es','Hola'], ['pause',300]] */
  async say(parts) {
    this.stop();
    const my = ++this.token;
    await sleep(80);
    if (my !== this.token) return false;
    document.body.classList.add('speaking');
    for (const [lang, text, o] of parts) {
      if (my !== this.token) return false;
      if (lang === 'pause') { await sleep(text); continue; }
      if (lang === 'es' && o !== 'force' && !S.settings.spanish && parts.some((p) => p[0] === 'en')) continue;
      await this.one(fill(text), lang, typeof o === 'object' ? o : {});
    }
    if (my === this.token) document.body.classList.remove('speaking');
    return my === this.token;
  },
  stop() { this.token++; if (this.supported) speechSynthesis.cancel(); document.body.classList.remove('speaking'); },
};
const sayEn = (en, es) => Voice.say(es ? [['en', en], ['es', es]] : [['en', en]]);
const sayEs = (es, en) => Voice.say(en ? [['es', es, 'force'], ['en', en]] : [['es', es, 'force']]);
const sayLearn = (en, es) => Voice.say([['en', en], ['pause', 200], ['es', es], ['pause', 200], ['en', en]]);

/* ---------- Reconocimiento de voz (opcional) ---------- */
const Listen = {
  SR: window.SpeechRecognition || window.webkitSpeechRecognition,
  get ok() { return !!this.SR; },
  hear(lang = 'en-US', ms = 6000) {
    return new Promise((res) => {
      if (!this.SR) return res(null);
      Voice.stop();
      let r; try { r = new this.SR(); } catch (e) { return res(null); }
      r.lang = lang; r.interimResults = false; r.maxAlternatives = 3;
      let fin = false;
      const done = (v) => { if (fin) return; fin = true; clearTimeout(t); document.body.classList.remove('listening'); try { r.stop(); } catch (e) {} res(v); };
      r.onresult = (e) => done([...e.results[0]].map((a) => a.transcript.toLowerCase()).join(' | '));
      r.onerror = () => done(null);
      r.onend = () => done(null);
      const t = setTimeout(() => done(null), ms);
      document.body.classList.add('listening');
      try { r.start(); } catch (e) { done(null); }
    });
  },
};

/* ---------- Efectos de sonido (sintetizados, sin archivos) ---------- */
const Sfx = {
  ctx: null,
  unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(f, d = 0.15, type = 'sine', vol = 0.2, when = 0, slide) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.05);
  },
  tap() { this.tone(520, 0.08, 'triangle', 0.15); },
  pop() { this.tone(500 + Math.random() * 300, 0.12, 'sine', 0.25, 0, 1400); },
  good() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.2, i * 0.09)); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.22, i * 0.12)); this.tone(1319, 0.6, 'sine', 0.15, 0.5); },
  oops() { this.tone(330, 0.22, 'sine', 0.18, 0, 220); },
  squeak() { this.tone(900, 0.1, 'sine', 0.14, 0, 1500); this.tone(1200, 0.1, 'sine', 0.1, 0.1, 1800); },
  chew() { this.tone(180, 0.06, 'square', 0.06); },
  scrub() { this.tone(300 + Math.random() * 200, 0.05, 'triangle', 0.05); },
  splash() { for (let i = 0; i < 3; i++) this.tone(800 + Math.random() * 900, 0.06, 'sine', 0.06, i * 0.03, 300); },
  lullaby() { // melodía de cuna (tradicional, dominio público)
    const n = [262, 262, 392, 392, 440, 440, 392, 349, 349, 330, 330, 294, 294, 262];
    const d = [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2]; let t = 0;
    n.forEach((f, i) => { this.tone(f, d[i] * 0.42, 'sine', 0.12, t); this.tone(f * 2, d[i] * 0.42, 'sine', 0.03, t); t += d[i] * 0.48; });
    return t;
  },
};

/* ---------- Ayudas de pantalla ---------- */
let screenId = 0;
const timers = new Set();
function later(fn, ms) { const my = screenId; const id = setTimeout(() => { timers.delete(id); if (my === screenId) fn(); }, ms); timers.add(id); return id; }
function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
function near(el, x, y, pad = 0) { const r = el.getBoundingClientRect(); return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; }
function center(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

/* Arrastrar con el dedo: crea una copia que sigue al dedo */
function dragTool(el, { onStart, onMove, onEnd, lift = 30 } = {}) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', (e) => {
    if (el.classList.contains('used')) return;
    e.preventDefault();
    Sfx.unlock();
    const r = el.getBoundingClientRect();
    const g = el.cloneNode(true);
    g.removeAttribute('id');
    g.classList.add('ghost');
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    document.body.appendChild(g);
    el.classList.add('drag-src');
    const pos = (ev) => { g.style.transform = `translate(${ev.clientX - r.width / 2}px, ${ev.clientY - r.height / 2 - lift}px) scale(1.15)`; };
    const move = (ev) => { pos(ev); onMove && onMove(ev.clientX, ev.clientY - lift, g); };
    const up = (ev) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      el.classList.remove('drag-src');
      const keep = onEnd && onEnd(ev.clientX, ev.clientY - lift, g);
      if (keep !== 'keep') g.remove();
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    pos(e); onStart && onStart();
  });
}

/* Explosión de brillitos */
function burst(x, y, emojis = ['⭐', '✨', '💖'], n = 10) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst'; s.textContent = pick(emojis);
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 1000);
  }
}
function burstEl(el, emojis, n) { const [x, y] = center(el); burst(x, y, emojis, n); }
function confetti(n = 60) {
  const cols = ['#FF6FAE', '#FFC83D', '#3DDC84', '#4FC3F7', '#7B4DFF', '#FF9F43'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'confetti';
    s.style.left = Math.random() * 100 + 'vw'; s.style.background = pick(cols);
    s.style.animationDelay = Math.random() * 0.8 + 's'; s.style.animationDuration = 1.8 + Math.random() * 1.5 + 's';
    s.style.setProperty('--r', rand(-720, 720) + 'deg');
    document.body.appendChild(s); setTimeout(() => s.remove(), 4200);
  }
}

/* ---------- Visual de cada palabra ---------- */
const SHAPES = {
  circle: '<circle cx="50" cy="50" r="42"/>',
  square: '<rect x="10" y="10" width="80" height="80" rx="8"/>',
  triangle: '<polygon points="50,8 94,90 6,90" stroke-linejoin="round"/>',
  star: '<polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"/>',
  heart: '<path d="M50 88 C20 65 5 48 5 30 C5 15 17 5 30 5 C40 5 47 11 50 18 C53 11 60 5 70 5 C83 5 95 15 95 30 C95 48 80 65 50 88Z"/>',
  diamond: '<polygon points="50,4 92,50 50,96 8,50"/>',
};
function itemVisual(it) {
  if (it.color) return `<span class="swatch" style="background:${it.color}"></span>`;
  if (it.num) return `<span class="numvis"><b>${it.num}</b><span class="numdots">${'🍎'.repeat(it.num)}</span></span>`;
  if (it.shape) return `<svg class="shape" viewBox="0 0 100 100" fill="${it.fill}" stroke="rgba(0,0,0,.18)" stroke-width="3">${SHAPES[it.shape]}</svg>`;
  return `<span class="emo">${it.emoji}</span>`;
}

/* ---------- Lumi, la mascota guía (personaje original) ---------- */
function lumiSVG() {
  return `<svg class="lumi" viewBox="0 0 200 210" aria-label="Lumi">
  <g class="lumi-body">
    <line x1="100" y1="44" x2="100" y2="16" stroke="#5B2EE0" stroke-width="7" stroke-linecap="round"/>
    <polygon class="lumi-star" points="100,0 106,11 118,12 109,20 112,32 100,26 88,32 91,20 82,12 94,11" fill="#FFC83D" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="30" cy="140" rx="16" ry="24" fill="#7B4DFF" transform="rotate(25 30 140)"/>
    <ellipse class="lumi-wave" cx="170" cy="140" rx="16" ry="24" fill="#7B4DFF" transform="rotate(-25 170 140)"/>
    <path d="M100 40 C152 40 182 80 182 126 C182 174 146 200 100 200 C54 200 18 174 18 126 C18 80 48 40 100 40Z" fill="#8B5CF6"/>
    <path d="M100 40 C152 40 182 80 182 126 C170 90 140 62 100 62 C60 62 30 90 18 126 C18 80 48 40 100 40Z" fill="#A78BFA" opacity=".5"/>
    <ellipse cx="100" cy="158" rx="50" ry="36" fill="#C4B5FD"/>
    <g class="lumi-eyes">
      <ellipse cx="74" cy="110" rx="18" ry="21" fill="#fff"/><circle cx="77" cy="113" r="10" fill="#2D1B69"/><circle cx="81" cy="108" r="3.5" fill="#fff"/>
      <ellipse cx="126" cy="110" rx="18" ry="21" fill="#fff"/><circle cx="129" cy="113" r="10" fill="#2D1B69"/><circle cx="133" cy="108" r="3.5" fill="#fff"/>
    </g>
    <circle cx="50" cy="140" r="10" fill="#F472B6" opacity=".6"/><circle cx="150" cy="140" r="10" fill="#F472B6" opacity=".6"/>
    <path class="lumi-mouth" d="M84 140 Q100 160 116 140 Z" fill="#4C1D95"/>
    <ellipse cx="78" cy="198" rx="20" ry="9" fill="#6D28D9"/><ellipse cx="122" cy="198" rx="20" ry="9" fill="#6D28D9"/>
  </g></svg>`;
}

/* ---------- La mascota (personaje original dibujado en SVG) ---------- */
function shade(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
let uid = 0;
const INK = '#3B2320';
const eye = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r / 3}" cy="${y - r / 3}" r="${r / 3}" fill="#fff"/>`;
const line = (d, w = 5) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const happyEyes = line('M102 120 Q115 104 128 120') + line('M172 120 Q185 104 198 120');
function petFace(pet, mood) {
  let eyes = eye(115, 115) + eye(185, 115), mouth = '', extra = '';
  switch (mood) {
    case 'sad':
      eyes = eye(115, 120, 11) + eye(185, 120, 11) + line('M98 102 L128 94', 4) + line('M202 102 L172 94', 4);
      mouth = line('M132 180 Q150 164 168 180');
      extra = '<path class="tear" d="M108 134 Q101 147 108 154 Q115 147 108 134Z" fill="#60A5FA"/>'; break;
    case 'angry':
      eyes = eye(115, 120, 10) + eye(185, 120, 10) + line('M98 96 L130 108', 6) + line('M202 96 L170 108', 6);
      mouth = line('M132 178 Q150 168 168 178'); extra = '<circle cx="92" cy="155" r="14" fill="#EF4444" opacity=".35"/><circle cx="208" cy="155" r="14" fill="#EF4444" opacity=".35"/>'; break;
    case 'surprised':
      eyes = eye(115, 113, 15) + eye(185, 113, 15) + line('M100 88 Q115 78 130 88', 4) + line('M170 88 Q185 78 200 88', 4);
      mouth = `<ellipse cx="150" cy="176" rx="12" ry="15" fill="#7A2E2E"/>`; break;
    case 'sleepy':
      eyes = line('M102 118 Q115 128 128 118') + line('M172 118 Q185 128 198 118');
      mouth = `<ellipse cx="150" cy="174" rx="8" ry="6" fill="#7A2E2E"/>`;
      extra = '<g class="zzz"><text x="225" y="60" font-size="34">z</text><text x="245" y="35" font-size="26">z</text><text x="262" y="15" font-size="20">z</text></g>'; break;
    case 'scared':
      eyes = `<circle cx="115" cy="115" r="16" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="115" cy="117" r="6" fill="${INK}"/><circle cx="185" cy="115" r="16" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="185" cy="117" r="6" fill="${INK}"/>`;
      mouth = line('M128 178 l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6', 4);
      extra = '<path d="M222 80 Q214 95 222 102 Q230 95 222 80Z" fill="#93C5FD"/>'; break;
    case 'open':
      eyes = happyEyes; mouth = `<ellipse cx="150" cy="176" rx="22" ry="20" fill="#7A2E2E"/><ellipse cx="150" cy="186" rx="13" ry="8" fill="#F87171"/>`; break;
    case 'chew':
      eyes = happyEyes; mouth = line('M128 172 Q150 184 172 172'); break;
    case 'giggle':
      eyes = happyEyes; mouth = `<path d="M126 164 Q150 198 174 164 Z" fill="#7A2E2E"/><path d="M138 176 Q150 190 162 176 Q150 180 138 176Z" fill="#F87171"/>`; break;
    default:
      mouth = `<path d="M128 164 Q150 194 172 164 Z" fill="#7A2E2E"/><path d="M138 175 Q150 188 162 175 Q150 179 138 175Z" fill="#F87171"/>`;
  }
  const nose = pet.type === 'cat' ? '<path d="M140 143 L160 143 L150 154 Z" fill="#F472B6" stroke-linejoin="round"/>' : `<ellipse cx="150" cy="147" rx="13" ry="9" fill="${INK}"/>`;
  const whisk = pet.type === 'cat' ? line('M110 158 L70 150', 2.5) + line('M110 166 L72 170', 2.5) + line('M190 158 L230 150', 2.5) + line('M190 166 L228 170', 2.5) : '';
  return `<circle cx="92" cy="155" r="12" fill="#F472B6" opacity=".45"/><circle cx="208" cy="155" r="12" fill="#F472B6" opacity=".45"/>${eyes}${nose}${whisk}${mouth}${extra}`;
}
function petSVG(pet, o = {}) {
  const c = pet.color, dk = shade(c, -50), lt = shade(c, 40), id = 'pc' + (++uid);
  const of = o.outfit || pet.outfit || {};
  const st = `stroke="${dk}" stroke-width="4"`;
  let back = '', front = '';
  if (pet.type === 'cat') back = `<polygon points="74,98 88,18 140,60" fill="${c}" ${st} stroke-linejoin="round"/><polygon points="90,80 95,42 122,62" fill="#F9A8D4"/><polygon points="226,98 212,18 160,60" fill="${c}" ${st} stroke-linejoin="round"/><polygon points="210,80 205,42 178,62" fill="#F9A8D4"/>`;
  if (pet.type === 'bunny') back = `<g transform="rotate(-10 112 50)"><ellipse cx="112" cy="20" rx="23" ry="62" fill="${c}" ${st}/><ellipse cx="112" cy="24" rx="11" ry="45" fill="#F9A8D4"/></g><g transform="rotate(10 188 50)"><ellipse cx="188" cy="20" rx="23" ry="62" fill="${c}" ${st}/><ellipse cx="188" cy="24" rx="11" ry="45" fill="#F9A8D4"/></g>`;
  if (pet.type === 'bear') back = `<circle cx="82" cy="58" r="32" fill="${c}" ${st}/><circle cx="82" cy="58" r="16" fill="${lt}"/><circle cx="218" cy="58" r="32" fill="${c}" ${st}/><circle cx="218" cy="58" r="16" fill="${lt}"/>`;
  if (pet.type === 'dog') front = `<ellipse cx="70" cy="122" rx="26" ry="56" fill="${dk}" transform="rotate(18 70 122)"/><ellipse cx="230" cy="122" rx="26" ry="56" fill="${dk}" transform="rotate(-18 230 122)"/>`;
  const shirt = of.shirt ? `<clipPath id="${id}"><ellipse cx="150" cy="245" rx="82" ry="66"/></clipPath><rect x="60" y="170" width="180" height="118" fill="${of.shirt}" clip-path="url(#${id})"/><text x="150" y="262" font-size="34" text-anchor="middle">⭐</text>` : `<ellipse cx="150" cy="258" rx="50" ry="42" fill="${lt}"/>`;
  const sleeve = of.shirt || c;
  const dirt = (o.dirt || []).map((d, i) => `<g class="dirt" data-i="${i}" style="opacity:${d.op ?? 0.85}"><circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="#8B5A2B"/><circle cx="${d.x + d.r * 0.7}" cy="${d.y - d.r * 0.4}" r="${d.r * 0.6}" fill="#8B5A2B"/><circle cx="${d.x - d.r * 0.6}" cy="${d.y + d.r * 0.5}" r="${d.r * 0.5}" fill="#7A4A22"/></g>`).join('');
  const em = (e, x, y, s) => e ? `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central">${e}</text>` : '';
  return `<svg class="pet-svg" viewBox="0 -45 300 375" xmlns="http://www.w3.org/2000/svg">
  <g class="pet-all">
    ${back}
    <ellipse cx="150" cy="245" rx="82" ry="66" fill="${c}" ${st}/>
    ${shirt}
    <ellipse cx="72" cy="240" rx="20" ry="32" fill="${sleeve}" ${st} transform="rotate(25 72 240)"/>
    <ellipse cx="228" cy="240" rx="20" ry="32" fill="${sleeve}" ${st} transform="rotate(-25 228 240)"/>
    <ellipse cx="108" cy="305" rx="30" ry="17" fill="${c}" ${st}/><ellipse cx="192" cy="305" rx="30" ry="17" fill="${c}" ${st}/>
    ${pet.type === 'bunny' ? `<circle cx="232" cy="290" r="18" fill="#fff" ${st}/>` : ''}
    <circle class="pet-head" cx="150" cy="125" r="88" fill="${c}" ${st}/>
    <ellipse cx="150" cy="162" rx="44" ry="31" fill="${lt}"/>
    ${front}
    <g class="face">${petFace(pet, o.mood || 'happy')}</g>
    ${dirt}
    ${em(of.neck, 150, 226, 48)}
    ${em(of.glasses, 150, 116, 104)}
    ${em(of.hat, 150, 30, 100)}
  </g></svg>`;
}
function setMood(container, mood) { const f = container.querySelector('.face'); if (f && S.pet) f.innerHTML = petFace(S.pet, mood); }
function petEmoji() { return S.pet ? PET_TYPES[S.pet.type].emoji : '🐶'; }
