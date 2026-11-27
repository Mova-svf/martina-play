'use strict';
/* ============ PANTALLAS PRINCIPALES ============ */
const app = document.getElementById('app');

function render(inner, { title = '', back = null, home = false, cls = '', bar = true, gear = false } = {}) {
  screenId++; clearTimers(); Voice.stop();
  if (typeof Rec !== 'undefined') Rec.release();
  $$('.ghost,.burst').forEach((g) => g.remove());
  const left = back ? `<button class="btn-round" id="btnBack" aria-label="Volver">${home ? '🏠' : '⬅️'}</button>`
    : gear ? `<button class="btn-round small" id="btnGear" aria-label="Padres">⚙️</button>` : '<span class="bar-sp"></span>';
  app.innerHTML = `<div class="screen ${cls}">${bar ? `<header class="bar">${left}<div class="bar-title">${title}</div><div class="stars-pill">⭐ <b id="starCount">${S.stars}</b></div></header>` : ''}<main class="content">${inner}</main></div>`;
  if (back) $('#btnBack').onclick = () => { Sfx.tap(); back(); };
  if (gear) setupParentGate($('#btnGear'));
  return screenId;
}
const alive = (my) => my === screenId;
function tapify(el, fn) { el.addEventListener('click', (e) => { Sfx.unlock(); Sfx.tap(); fn(e); }); }

/* ---------- Actividades ---------- */
const ACTIVITIES = {
  lesson: (p, done, back) => screenLesson(p.topic, done, back),
  chat: (p, done, back) => screenChat(p.dialog, done, back),
  bath: (p, done, back) => needPet(() => screenBath(done, back), back),
  teeth: (p, done, back) => needPet(() => screenTeeth(done, back), back),
  feed: (p, done, back) => needPet(() => screenFeed(done, back), back),
  dress: (p, done, back) => needPet(() => screenDress(done, back), back),
  emotions: (p, done, back) => needPet(() => screenEmotions(done, back), back),
  sleep: (p, done, back) => needPet(() => screenSleep(done, back), back),
  cook: (p, done, back) => screenCook(p.recipe || 'pizza', done, back),
  memory: (p, done, back) => screenMemory(p.topic, done, back),
  bubbles: (p, done, back) => screenBubbles(done, back),
  shadows: (p, done, back) => screenShadows(done, back),
  counting: (p, done, back) => screenCounting(done, back),
  draw: (p, done, back) => screenDraw(done, back),
  friends: (p, done, back) => screenSituations(done, back),
  piano: (p, done, back) => screenPiano(done, back),
  band: (p, done, back) => screenBand(done, back),
  guess: (p, done, back) => screenGuess(done, back),
  calm: (p, done, back) => screenCalm(done, back),
};
function activityInfo(sp) {
  if (sp.type === 'lesson') { const t = TOPICS[sp.topic]; return { icon: t.icon, es: t.es }; }
  if (sp.type === 'chat') { const d = DIALOGS[sp.dialog]; return { icon: '💬', es: 'Hablar: ' + d.es, sub: d.icon }; }
  if (sp.type === 'cook') { const r = RECIPES[sp.recipe]; return { icon: r.e, es: 'Cocinar ' + r.es }; }
  const m = { bath: ['🛁', 'Bañar'], teeth: ['🪥', 'Dientes'], feed: ['🍎', 'Comer'], dress: ['👕', 'Vestir'], emotions: ['😊', 'Emociones'],
    sleep: ['🌙', 'Dormir'], memory: ['🃏', 'Memoria'], bubbles: ['🫧', 'Burbujas'], shadows: ['👤', 'Sombras'], counting: ['🔢', 'Contar'], draw: ['🖍️', 'Dibujar'], friends: ['🤝', 'Amigos'], calm: ['🧘', 'Calma'], piano: ['🎹', 'Piano'], band: ['🥁', 'Mi banda'], guess: ['👂', '¿Qué suena?'] }[sp.type];
  return { icon: m[0], es: m[1] };
}
function startActivity(spec, back, onComplete) {
  const done = (stars = 3) => {
    const key = spec.type + (spec.topic ? '-' + spec.topic : '') + (spec.dialog ? '-' + spec.dialog : '') + (spec.recipe ? '-' + spec.recipe : '');
    S.done[key] = (S.done[key] || 0) + 1;
    S.stars += stars;
    let sticker = null;
    const left = STICKERS.filter((s) => !S.stickers.includes(s));
    if (left.length) { sticker = pick(left); S.stickers.push(sticker); }
    if (S.pet) S.pet.happy = clamp(S.pet.happy + 5, 0, 100);
    if (onComplete) onComplete();
    save();
    screenReward(stars, sticker, back);
  };
  ACTIVITIES[spec.type](spec, done, back);
}
function needPet(fn, back) { if (S.pet) fn(); else screenPetSetup(fn, back); }

/* ---------- Inicio ---------- */
function screenSplash() {
  render(`<div class="splash"><div class="lumi-wrap huge bob">${lumiSVG()}</div>
    <h1 class="logo">${fill('{name}')}<span>Play &amp; Learn</span></h1>
    <button class="btn-big pulse" id="go">▶ ¡Jugar!</button></div>`, { bar: false, cls: 'sky' });
  tapify($('#go'), () => { Voice.unlock(); screenHome(true); });
}

const ZONES = [
  { icon: '🎙️', es: 'Audios con Lumi', en: 'Voice chat', color: '#25D366', fn: () => screenTalk() },
  { icon: '🎵', es: 'Música', en: 'Music', color: '#F97316', fn: () => screenMusicMenu() },
  { icon: '🇧🇷', es: 'Português', en: 'Fala comigo!', color: '#16A34A', fn: () => screenTalk('pt') },
  { icon: '🤝', es: 'Amigos', en: 'Friends', color: '#FF8FAB', fn: () => screenFriendsMenu() },
  { icon: '🗺️', es: 'Aventura', en: 'Adventure', color: '#FFC83D', fn: () => screenAdventure() },
  { icon: '🔤', es: 'Inglés', en: 'English', color: '#FF6FAE', fn: () => screenEnglish() },
  { icon: 'PET', es: 'Mi mascota', en: 'My pet', color: '#3DDC84', fn: () => screenPet() },
  { icon: '💬', es: 'Hablar con Lumi', en: "Let's talk", color: '#4FC3F7', fn: () => screenChatMenu() },
  { icon: '🎮', es: 'Juegos', en: 'Games', color: '#7B4DFF', fn: () => screenGames() },
  { icon: '🍳', es: 'Cocina', en: 'Kitchen', color: '#FF9F43', fn: () => screenKitchen() },
  { icon: '📒', es: 'Mis stickers', en: 'Stickers', color: '#A78BFA', fn: () => screenStickers() },
];
function screenHome(greet) {
  const my = render(`<div class="home scroll">
    <div class="hero"><div class="lumi-wrap bob" id="lumi">${lumiSVG()}</div>
      <div class="bubble"><b>¡Hola, ${fill('{name}')}!</b><span>¿Qué quieres hacer hoy?</span></div></div>
    <div class="tiles">${ZONES.map((z, i) => `<button class="tile pop-in" style="--c:${z.color};animation-delay:${i * 60}ms" data-i="${i}">
      <span class="tile-ico">${z.icon === 'PET' ? petEmoji() : z.icon}</span><span class="tile-es">${z.es}</span><span class="tile-en">${z.en}</span></button>`).join('')}</div>
  </div>`, { title: 'Martina Play', gear: true });
  $$('.tile').forEach((t) => tapify(t, () => ZONES[t.dataset.i].fn()));
  tapify($('#lumi'), () => { $('#lumi').classList.add('jump'); later(() => $('#lumi') && $('#lumi').classList.remove('jump'), 600); Sfx.squeak();
    Voice.say(pick([[['en', "Hi {name}! I'm Lumi!"], ['es', '¡Hola! Soy Lumi.']], [['en', "Let's play!"], ['es', '¡Juguemos!']], [['en', 'You are my best friend!'], ['es', '¡Eres mi mejor amiga!']], [['en', 'Hee hee! That tickles!'], ['es', '¡Me haces cosquillas!']]])); });
  if (greet) later(() => alive(my) && Voice.say([['es', '¡Hola, {name}! ¿Qué quieres hacer hoy?', 'force'], ['en', "Hello, {name}! Let's play!"]]), 300);
}

/* ---------- Aventura ---------- */
function screenAdventure() {
  const N = ADVENTURE.length, GAP = 118, XS = [50, 78, 50, 22];
  const pts = ADVENTURE.map((_, i) => [XS[i % 4], 70 + i * GAP]);
  const H = 70 + (N - 1) * GAP + 140;
  const deco = ['🌳', '☁️', '🌷', '🍄', '🌲', '🦋', '🌻', '⛰️'];
  const my = render(`<div class="adv scroll" id="advScroll"><div class="adv-map" style="height:${H}px">
    <svg class="adv-path" viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px"><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity=".85"/><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#FFC83D" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>
    ${pts.map((p, i) => `<span class="adv-deco" style="left:${p[0] > 50 ? 12 : p[0] < 50 ? 80 : (i % 8 < 4 ? 14 : 82)}%;top:${p[1] + 10}px">${deco[i % deco.length]}</span>`).join('')}
    ${ADVENTURE.map((sp, i) => { const inf = activityInfo(sp); const st = i < S.adv ? 'done' : i === S.adv ? 'now' : 'locked';
      return `<button class="adv-node ${st}" data-i="${i}" style="left:${pts[i][0]}%;top:${pts[i][1]}px"><span class="adv-ico">${inf.icon}</span>${st === 'done' ? '<span class="adv-check">⭐</span>' : ''}${st === 'locked' ? '<span class="adv-lock">🔒</span>' : ''}<span class="adv-label">${inf.es}</span></button>`; }).join('')}
    <div class="adv-trophy" style="top:${H - 80}px">🏆 ${S.advLoops ? '×' + S.advLoops : ''}</div>
  </div></div>`, { title: '🗺️ Aventura', back: () => screenHome(), home: true });
  const sc = $('#advScroll'), cur = $('.adv-node.now');
  if (cur) sc.scrollTop = cur.offsetTop - sc.clientHeight / 2;
  $$('.adv-node').forEach((n) => tapify(n, () => {
    const i = +n.dataset.i;
    if (i > S.adv) { n.classList.add('shake'); later(() => n.classList.remove('shake'), 500); return sayEs('¡Primero termina la misión que salta!'); }
    startActivity(ADVENTURE[i], () => screenAdventure(), () => {
      if (i === S.adv) { S.adv++; if (S.adv >= ADVENTURE.length) { S.adv = 0; S.advLoops++; } }
    });
  }));
  later(() => alive(my) && sayEs(S.adv === 0 && S.advLoops ? '¡Completaste la aventura! ¡Vamos otra vez!' : '¡Sigue el camino, {name}! Toca la misión que salta.', "Let's go!"), 300);
}

/* ---------- Menús de zonas ---------- */
function menuGrid(items) {
  return `<div class="tiles menu">${items.map((it, i) => `<button class="tile pop-in" style="--c:${it.color};animation-delay:${i * 50}ms" data-i="${i}">
    <span class="tile-ico">${it.icon}</span><span class="tile-es">${it.es}</span><span class="tile-en">${it.en}</span>${it.badge ? `<span class="tile-badge">${it.badge}</span>` : ''}</button>`).join('')}</div>`;
}
function bindGrid(items, fn) { $$('.tile').forEach((t) => tapify(t, () => fn(items[t.dataset.i]))); }

function screenEnglish() {
  const items = Object.entries(TOPICS).map(([k, t]) => ({ k, icon: t.icon, es: t.es, en: t.en, color: t.color, badge: S.done['lesson-' + k] ? '⭐'.repeat(Math.min(3, S.done['lesson-' + k])) : '' }));
  const my = render(`<div class="scroll pad">${lumiTip('Elige qué quieres aprender')}${menuGrid(items)}</div>`, { title: '🔤 English', back: () => screenHome(), home: true });
  bindGrid(items, (it) => startActivity({ type: 'lesson', topic: it.k }, () => screenEnglish()));
  later(() => alive(my) && sayEs('¿Qué quieres aprender en inglés?', "Let's learn English!"), 300);
}
function screenGames() {
  const my = render(`<div class="scroll pad">${lumiTip('¿A qué jugamos?')}${menuGrid(GAMES)}</div>`, { title: '🎮 Games', back: () => screenHome(), home: true });
  bindGrid(GAMES, (g) => startActivity({ type: g.type, topic: pick(['animals', 'food', 'nature']) }, () => screenGames()));
  later(() => alive(my) && sayEs('¿A qué jugamos?', "Let's play a game!"), 300);
}
function screenKitchen() {
  const items = Object.entries(RECIPES).map(([k, r], i) => ({ k, icon: r.e, es: r.es[0].toUpperCase() + r.es.slice(1), en: r.en, color: ['#FF9F43', '#3DDC84', '#FF6FAE', '#FFC83D', '#A78BFA'][i] }));
  const my = render(`<div class="scroll pad">${lumiTip('¿Qué cocinamos hoy?')}${menuGrid(items)}</div>`, { title: '🍳 Kitchen', back: () => screenHome(), home: true });
  bindGrid(items, (it) => startActivity({ type: 'cook', recipe: it.k }, () => screenKitchen()));
  later(() => alive(my) && sayEs('¿Qué cocinamos hoy?', "Let's cook!"), 300);
}
function screenChatMenu() {
  const cols = ['#4FC3F7', '#FF6FAE', '#FFC83D', '#3DDC84', '#FF9F43', '#7B4DFF', '#22C55E', '#A78BFA'];
  const items = Object.entries(DIALOGS).map(([k, d], i) => ({ k, icon: d.icon, es: d.es, en: d.en, color: cols[i % cols.length], badge: S.done['chat-' + k] ? '⭐' : '' }));
  const my = render(`<div class="scroll pad">${lumiTip('¿De qué quieres conversar conmigo?')}${menuGrid(items)}</div>`, { title: '💬 Talk with Lumi', back: () => screenHome(), home: true });
  bindGrid(items, (it) => startActivity({ type: 'chat', dialog: it.k }, () => screenChatMenu()));
  later(() => alive(my) && sayEs('¿De qué quieres conversar conmigo?', "Let's talk!"), 300);
}
function lumiTip(text) { return `<div class="tip"><div class="lumi-wrap sm bob">${lumiSVG()}</div><div class="bubble"><span>${fill(text)}</span></div></div>`; }

/* ---------- Premio ---------- */
function screenReward(stars, sticker, next) {
  const my = render(`<div class="reward"><div class="lumi-wrap big jump-loop">${lumiSVG()}</div>
    <h2>${fill(pick(PRAISE_ES))}</h2>
    <div class="reward-stars">${'<span>⭐</span>'.repeat(stars)}</div>
    ${sticker ? `<div class="new-sticker"><small>¡Nuevo sticker!</small><span>${sticker}</span></div>` : ''}
    <button class="btn-big" id="cont">Seguir ➡</button></div>`, { bar: false, cls: 'sky' });
  confetti(); Sfx.win();
  later(() => alive(my) && Voice.say([['en', pick(PRAISE_EN)], ['es', pick(PRAISE_ES), 'force']]), 400);
  tapify($('#cont'), () => next());
}

/* ---------- Stickers ---------- */
function screenStickers() {
  const my = render(`<div class="scroll pad"><div class="sticker-head">⭐ ${S.stars} estrellas · 📒 ${S.stickers.length}/${STICKERS.length} stickers${S.advLoops ? ` · 🏆 ${S.advLoops}` : ''}</div>
    <div class="sticker-book">${STICKERS.map((s) => S.stickers.includes(s) ? `<button class="stk">${s}</button>` : '<span class="stk empty">?</span>').join('')}</div></div>`,
    { title: '📒 Mis stickers', back: () => screenHome(), home: true });
  $$('.stk:not(.empty)').forEach((b) => tapify(b, () => { b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump'); burstEl(b, ['✨'], 5); }));
  later(() => alive(my) && sayEs(S.stickers.length ? '¡Mira todos tus stickers! Completa misiones para ganar más.' : 'Juega y completa misiones para ganar stickers.'), 300);
}

/* ---------- Zona de padres ---------- */
function setupParentGate(btn) {
  let t = null;
  const start = (e) => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(() => { btn.classList.remove('holding'); screenParents(); }, 2500); };
  const stop = () => { clearTimeout(t); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', stop); btn.addEventListener('pointerleave', stop); btn.addEventListener('pointercancel', stop);
  btn.addEventListener('click', () => { if (!btn.dataset.told) { btn.dataset.told = 1; toast('Adultos: mantén presionado ⚙️ por 3 segundos'); } });
}
function toast(msg) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
function screenParents() {
  const s = S.settings;
  render(`<div class="scroll pad parents">
    <h2>Zona de padres</h2>
    <label>Nombre de la niña<input id="pName" value="${s.name}" maxlength="20"></label>
    <label>Nombre de la mascota<input id="pPet" value="${petName()}" maxlength="20"></label>
    <label class="row"><input type="checkbox" id="pEs" ${s.spanish ? 'checked' : ''}> Traducir al español (ayuda)</label>
    <label class="row"><input type="checkbox" id="pSlow" ${s.slow ? 'checked' : ''}> Inglés más lento</label>
    <label class="row"><input type="checkbox" id="pRec" ${s.recVoice ? 'checked' : ''}> Grabar su voz para que se escuche</label>
    <p class="small">Apagado: la app usa el dictado del iPhone y no pide permisos. Encendido: Martina puede escuchar sus propios audios, pero Safari pedirá permiso del micrófono cada vez que se abra la app (salvo que en Ajustes › Apps › Safari › Micrófono elijas “Permitir”).</p>
    <button class="btn" id="pTest">🔊 Probar voces</button>
    <p class="small">Voz inglés: <b>${Voice.en ? Voice.en.name : 'por defecto'}</b> · Voz español: <b>${Voice.es ? Voice.es.name : 'por defecto'}</b><br>
    Tip: en el iPhone, en Ajustes › Accesibilidad › Contenido leído › Voces, puedes descargar voces “Mejoradas” (Samantha, Paulina) para que suenen más naturales. Recuerda quitar el modo silencio.</p>
    <p class="small">Progreso: ⭐ ${S.stars} estrellas · misión ${S.adv + 1}/${ADVENTURE.length} · ${S.stickers.length} stickers</p>
    <h3>💡 Ideas de ${s.name} (${(S.ideas || []).length})</h3>
    <div id="ideas">${(S.ideas || []).length ? S.ideas.map((it) => `<div class="idea" data-id="${it.id}"><small>${new Date(it.t).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</small><span>“${it.text}”</span>${it.audio ? '<button class="mini ip">▶</button>' : ''}<button class="mini idel">🗑️</button></div>`).join('') : '<p class="small">Cuando diga en “Audios con Lumi” algo como “quiero un juego de dinosaurios”, su idea aparecerá aquí.</p>'}</div>
    ${(S.ideas || []).length ? '<button class="btn" id="pCopy">📋 Copiar ideas (para pegárselas a Claude)</button>' : ''}
    <label>Avisos al celular (opcional, app gratis “ntfy”)<input id="pNtfy" value="${s.ntfy || ''}" placeholder="nombre del canal, ej: martina-ideas-8k2x"></label>
    <p class="small">Instala la app <b>ntfy</b> en tu celular, toca “+” y suscríbete al mismo nombre de canal. Cada idea nueva te llegará como notificación. Usa un nombre difícil de adivinar: cualquiera que lo sepa podría leer los avisos. Déjalo vacío para no enviar nada.</p>
    <div class="row2"><button class="btn" id="pNtfyGen">🎲 Crear nombre</button><button class="btn" id="pNtfyTest">🔔 Probar aviso</button></div>
    <button class="btn" id="pPetNew">🐾 Cambiar mascota</button>
    <button class="btn danger" id="pReset">🗑️ Reiniciar todo el progreso</button>
    <button class="btn-big" id="pSave">Guardar ✓</button>
  </div>`, { title: '⚙️ Padres', back: () => screenHome(), home: true });
  $$('.idea .ip').forEach((b) => b.onclick = async () => { const blob = await IDB.get(b.parentNode.dataset.id); if (blob) { const a = new Audio(URL.createObjectURL(blob)); a.play().catch(() => {}); } else toast('No encontré el audio'); });
  $$('.idea .idel').forEach((b) => b.onclick = () => { const id = b.parentNode.dataset.id; S.ideas = S.ideas.filter((x) => x.id !== id); IDB.del(id); save(); b.parentNode.style.display = 'none'; });
  if ($('#pCopy')) $('#pCopy').onclick = () => { const txt = 'Ideas de ' + s.name + ' para la app:\n' + S.ideas.map((x) => '- ' + x.text).join('\n'); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('¡Copiado!'), () => prompt('Copia este texto:', txt)); };
  $('#pNtfyGen').onclick = () => { $('#pNtfy').value = 'martina-ideas-' + Math.random().toString(36).slice(2, 10); };
  $('#pNtfyTest').onclick = () => { const ch = $('#pNtfy').value.trim(); if (!ch) return toast('Primero escribe un nombre de canal'); fetch('https://ntfy.sh/' + encodeURIComponent(ch), { method: 'POST', body: '✅ Los avisos de ideas funcionan', headers: { Title: 'Martina Play' } }).then(() => toast('Aviso enviado'), () => toast('No se pudo enviar')); };
  $('#pTest').onclick = () => { S.settings.slow = $('#pSlow').checked; Voice.say([['en', 'Hello! I am Lumi.'], ['es', '¡Hola! Soy Lumi.', 'force']]); };
  $('#pSave').onclick = () => {
    S.settings.name = $('#pName').value.trim() || 'Martina';
    S.settings.ntfy = $('#pNtfy').value.trim();
    S.settings.spanish = $('#pEs').checked; S.settings.slow = $('#pSlow').checked; S.settings.recVoice = $('#pRec').checked;
    if (S.pet) S.pet.name = $('#pPet').value.trim() || 'Coco';
    save(); screenHome();
  };
  $('#pPetNew').onclick = () => { if (confirm('¿Elegir otra mascota? (se mantiene el progreso)')) { S.pet = null; save(); screenPet(); } };
  $('#pReset').onclick = () => { if (confirm('¿Seguro? Se borrarán estrellas, stickers, mascota y misiones.')) { const n = S.settings; S = JSON.parse(JSON.stringify(DEFAULT_STATE)); S.settings = n; save(); screenHome(); } };
}
