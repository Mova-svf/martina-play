'use strict';
/* ============ AUDIOS CON LUMI (estilo WhatsApp) ============ */

/* ---------- Entender lo que dijo ---------- */
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function hasKey(t, toks, k) { return k.includes(' ') ? (' ' + t + ' ').includes(' ' + k.trim() + ' ') || (k.endsWith(' ') && (' ' + t + ' ').includes(' ' + k)) : toks.some((w) => w.startsWith(k)); }
const findNav = (t, toks) => NAV.find((n) => n.k.some((k) => hasKey(t, toks, k)));
const vocabItems = () => ['animals', 'colors', 'food', 'body', 'nature', 'shapes'].flatMap((k) => TOPICS[k].items);

function brain(text) {
  const t = norm(text);
  if (!t) return { parts: [['es', pick(TALK.noText)]] };
  const toks = t.split(' ');
  const exact = (w) => toks.includes(w) || (w.includes(' ') && (' ' + t + ' ').includes(' ' + w + ' '));
  const hasVerb = CMD_VERBS.some(exact);
  const ideaish = toks.length >= 3 && IDEA_WORDS.some((w) => hasKey(t, toks, w));
  // 1. Cariño
  const love = BRAIN[0];
  if (love.k.some((k) => hasKey(t, toks, k))) return { parts: [['es', pick(love.r)]] };
  // 2. Ir a una parte de la app
  const nav = findNav(t, toks);
  if (nav && (hasVerb || toks.length <= 3)) return { parts: [['es', nav.r], ['es', TALK.navOk]], nav };
  // 3. Una idea nueva para papá
  if (ideaish) return { parts: [['es', pick(TALK.idea)]], idea: true };
  if (NAV_GAMES.k.some((k) => hasKey(t, toks, k)) && toks.length <= 4) return { parts: [['es', NAV_GAMES.r], ['es', TALK.navOk]], nav: NAV_GAMES };
  // 4. Conversación
  const b = BRAIN.slice(1).find((x) => x.k.some((k) => hasKey(t, toks, k)));
  if (b) return { parts: [['es', pick(b.r)]] };
  // 5. Palabras que sabe: enseñar inglés
  const plural = (w) => [w, w + 's', w + 'es'];
  const enW = vocabItems().find((it) => toks.includes(norm(it.en)) && norm(it.en).length > 2);
  if (enW) return { parts: [['es', TALK.english[0]], ['en', enW.en], ['es', TALK.english[1]], ['es', enW.es]] };
  const esW = vocabItems().find((it) => { const w = norm(it.es); return w.length > 2 && plural(w).some((p) => toks.includes(p)); });
  if (esW) return { parts: [['es', esW.es], ['es', TALK.vocab[0]], ['en', esW.en], ['es', TALK.vocab[1]]] };
  // 6. Seguir la conversación
  return { parts: [['es', pick(TALK.fallback)], ['es', pick(TALK.ask)]] };
}

/* ---------- Grabar (micrófono + reconocimiento de voz del teléfono) ---------- */
const Rec = {
  /* IMPORTANTE: llamar directo desde el toque (el iPhone bloquea el micrófono si se enciende después) */
  async start(lang = 'es-CL') {
    this.chunks = []; this.text = ''; this.sr = null; this.mr = null; this.stream = null; this.t0 = Date.now();
    if (Listen.SR) {
      try {
        const r = new Listen.SR();
        r.lang = lang; r.continuous = true; r.interimResults = true;
        r.onresult = (e) => { this.text = [...e.results].map((x) => x[0].transcript).join(' ').trim(); };
        r.onerror = (e) => { this.srError = e.error; }; r.onend = () => { this.srDone = true; this.srEnd && this.srEnd(); };
        this.srDone = false; this.srEnd = null; this.srError = null; r.start(); this.sr = r;
      } catch (e) { this.sr = null; }
    }
    try { this.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { this.stream = null; }
    if (this.stream && window.MediaRecorder) {
      try {
        const mt = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((x) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x));
        this.mr = new MediaRecorder(this.stream, mt ? { mimeType: mt } : undefined);
        this.mr.ondataavailable = (e) => e.data && e.data.size && this.chunks.push(e.data);
        this.mr.start();
      } catch (e) { this.mr = null; }
    }
    if (this.sr && this.srDone && this.srError) this.sr = null;
    return !!(this.mr || this.sr);
  },
  async stop() {
    const secs = (Date.now() - this.t0) / 1000;
    let blob = null;
    if (this.mr && this.mr.state !== 'inactive') {
      blob = await new Promise((res) => { this.mr.onstop = () => res(new Blob(this.chunks, { type: this.mr.mimeType || 'audio/mp4' })); try { this.mr.stop(); } catch (e) { res(null); } });
    }
    if (this.sr && !this.srDone) await new Promise((res) => { this.srEnd = res; try { this.sr.stop(); } catch (e) { res(); } setTimeout(res, 2000); });
    if (this.stream) this.stream.getTracks().forEach((tr) => tr.stop());
    return { blob: blob && blob.size > 800 ? blob : null, text: this.text || '', secs };
  },
};

/* ---------- Ideas guardadas (texto en el estado, audio en IndexedDB) ---------- */
const IDB = {
  db: null,
  open() { return this.db || (this.db = new Promise((res, rej) => { const r = indexedDB.open('martina', 1); r.onupgradeneeded = () => r.result.createObjectStore('audios'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); },
  async run(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('audios', mode); const q = fn(tx.objectStore('audios')); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); }); },
  put(k, v) { return this.run('readwrite', (s) => s.put(v, k)).catch(() => {}); },
  get(k) { return this.run('readonly', (s) => s.get(k)).catch(() => null); },
  del(k) { return this.run('readwrite', (s) => s.delete(k)).catch(() => {}); },
};
async function saveIdea(text, blob) {
  const id = 'idea-' + Date.now();
  S.ideas = S.ideas || [];
  S.ideas.unshift({ id, t: Date.now(), text: text || '(audio sin texto)', audio: !!blob });
  save();
  if (blob) IDB.put(id, blob);
  if (S.settings.ntfy) {
    fetch('https://ntfy.sh/' + encodeURIComponent(S.settings.ntfy), { method: 'POST', body: `💡 ${S.settings.name} propone: "${text || 'mandó una idea por audio (escúchala en la Zona de padres)'}"`, headers: { Title: 'Nueva idea para la app', Tags: 'bulb' } }).catch(() => {});
  }
}

/* ---------- Pantalla ---------- */
const TALK_LOG = []; // conversación de esta sesión
const fmtSecs = (s) => `0:${String(Math.max(1, Math.round(s))).padStart(2, '0')}`;
function screenTalk() {
  const my = render(`<div class="talk"><div class="talk-list" id="list"></div>
    <div class="talk-bar"><div class="rec-hint" id="hint">Mantén apretado 🎤 para hablar</div><button class="rec-btn" id="rec" aria-label="Grabar"><span>🎤</span></button></div></div>`,
    { title: '🎙️ Audios con Lumi', back: () => screenHome(), home: true, cls: 'chatbg' });
  const list = $('#list');
  const scrollDown = () => { list.scrollTop = list.scrollHeight; };
  const waveHTML = '<span class="wave">' + Array.from({ length: 14 }, (_, i) => `<i style="height:${6 + ((i * 37) % 17)}px"></i>`).join('') + '</span>';
  function draw(m) {
    const el = document.createElement('div');
    if (m.who === 'me') {
      el.className = 'msg me pop-in';
      el.innerHTML = `<div class="mb">${m.url ? `<button class="playb">▶</button>${waveHTML}<span class="dur">${fmtSecs(m.secs)}</span>` : '<span class="emo-big">🎤</span>'}${m.text ? `<div class="mt">“${m.text}”</div>` : ''}</div><div class="av kid">👧</div>`;
      if (m.url) {
        const a = new Audio(m.url); const b = $('.playb', el);
        tapify(b, () => { Voice.stop(); if (!a.paused) { a.pause(); return; } a.currentTime = 0; a.play().catch(() => {}); el.classList.add('playing'); b.textContent = '⏸'; });
        a.onended = a.onpause = () => { el.classList.remove('playing'); b.textContent = '▶'; };
      }
    } else {
      el.className = 'msg lumi pop-in';
      const text = m.parts.map((p) => { const t = fill(p[1]); return /^[\wáéíóúñü]+$/i.test(t) ? `¡${t[0].toUpperCase()}${t.slice(1)}!` : t; }).join(' ');
      el.innerHTML = `<div class="av">${lumiSVG()}</div><div class="mb"><button class="playb">▶</button>${waveHTML}<div class="mt">${text}</div>${m.nav ? `<button class="nav-card">${m.nav.icon} ¡Vamos!</button>` : ''}${m.idea ? '<div class="idea-tag">💡 Idea enviada a papá</div>' : ''}</div>`;
      const play = () => { el.classList.add('playing'); Voice.say(m.parts).then(() => el.classList.remove('playing')); };
      tapify($('.playb', el), play);
      m.play = play;
      if (m.nav) tapify($('.nav-card', el), () => goNav(m.nav));
    }
    list.appendChild(el); scrollDown();
    return el;
  }
  function lumiSay(m) { TALK_LOG.push(m); const el = draw(m); m.play(); return el; }
  function goNav(n) {
    const back = () => screenTalk();
    if (n.spec) return startActivity(n.spec, back);
    ({ kitchen: screenKitchen, stickers: screenStickers, adventure: screenAdventure, pet: screenPet, english: screenEnglish, chat: screenChatMenu, games: screenGames })[n.screen]();
  }
  TALK_LOG.forEach(draw);
  if (!TALK_LOG.length) later(() => alive(my) && lumiSay({ who: 'lumi', parts: [['es', TALK.hello]] }), 300);

  /* Botón de grabar: mantener apretado (o tocar para empezar y tocar para enviar) */
  const btn = $('#rec'), hint = $('#hint');
  let recording = false, starting = false, downAt = 0, mode = null, maxT = null;
  async function begin() {
    if (recording || starting) return;
    starting = true; Voice.stop(); Sfx.unlock(); Sfx.tone(880, 0.08, 'sine', 0.12);
    btn.classList.add('rec'); hint.textContent = 'Te escucho... 👂';
    const ok = await Rec.start();
    starting = false;
    if (!alive(my)) return Rec.stop();
    if (!ok) { btn.classList.remove('rec'); hint.textContent = 'No puedo usar el micrófono 😢'; return Voice.say([['es', TALK.noMic, 'force']]); }
    recording = true;
    if (mode === 'released') finish();
    maxT = later(finish, 25000);
  }
  async function finish() {
    if (!recording) return;
    recording = false; clearTimeout(maxT);
    btn.classList.remove('rec'); hint.textContent = 'Mantén apretado 🎤 para hablar';
    const r = await Rec.stop();
    if (!alive(my)) return;
    Sfx.tone(660, 0.08, 'sine', 0.12);
    if (r.secs < 0.8 && !r.text) { hint.textContent = '¡Mantén apretado más rato! 🎤'; return Voice.say([['es', TALK.hold, 'force']]); }
    const me = { who: 'me', url: r.blob ? URL.createObjectURL(r.blob) : null, secs: r.secs, text: r.text };
    TALK_LOG.push(me); draw(me);
    const typing = document.createElement('div'); typing.className = 'msg lumi'; typing.innerHTML = `<div class="av">${lumiSVG()}</div><div class="mb typing"><i></i><i></i><i></i></div>`;
    list.appendChild(typing); scrollDown();
    await sleep(900);
    typing.remove();
    if (!alive(my)) return;
    const ans = brain(r.text);
    if (!r.text && r.blob) ans.parts = [['es', pick(TALK.noText)]];
    if (ans.idea) saveIdea(r.text, r.blob);
    lumiSay({ who: 'lumi', ...ans });
    S.done.talk = (S.done.talk || 0) + 1;
    if (S.done.talk % 5 === 0) { S.stars++; $('#starCount').textContent = S.stars; Sfx.good(); burstEl(btn, ['⭐'], 6); }
    save();
  }
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); downAt = Date.now();
    if (recording) { mode = 'tap'; return finish(); }
    mode = 'hold'; begin();
  });
  const up = () => {
    if (mode !== 'hold') return;
    if (Date.now() - downAt < 350) { mode = 'toggle'; hint.textContent = 'Te escucho... toca 🎤 para enviar'; return; } // toque corto: sigue grabando
    mode = 'released'; finish();
  };
  btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('pointerleave', up);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
