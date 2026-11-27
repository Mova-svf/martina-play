'use strict';
/* ============ MASCOTA: cuidado, salud, emociones + COCINA ============ */

function screenPetSetup(after, back) {
  let type = 'dog', color = PET_TYPES.dog.color;
  const my = render(`<div class="scroll pad setup"><h2>¡Elige tu mascota!</h2>
    <div class="pick-row">${Object.entries(PET_TYPES).map(([k, t]) => `<button class="pick ${k === type ? 'sel' : ''}" data-t="${k}">${t.emoji}<small>${t.en}</small></button>`).join('')}</div>
    <div class="setup-pet" id="prev"></div>
    <div class="pick-row">${PET_COLORS.map((c) => `<button class="pick col" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
    <button class="btn-big" id="ok">¡Listo! ✓</button></div>`, { title: '🐾 Mi mascota', back, home: true });
  const prev = () => { $('#prev').innerHTML = petSVG({ type, color, outfit: {} }, { mood: 'giggle' }); };
  prev();
  $$('.pick[data-t]').forEach((b) => tapify(b, () => { type = b.dataset.t; color = PET_TYPES[type].color; $$('.pick[data-t]').forEach((x) => x.classList.toggle('sel', x === b)); prev(); Voice.say([['en', PET_TYPES[type].en], ['es', PET_TYPES[type].es]]); }));
  $$('.pick.col').forEach((b) => tapify(b, () => { color = b.dataset.c; prev(); }));
  tapify($('#ok'), () => {
    S.pet = { type, color, name: 'Coco', hunger: 60, clean: 40, energy: 80, happy: 80, outfit: {}, t: Date.now() };
    save(); after();
  });
  later(() => alive(my) && sayEs('¡Elige tu mascota y su color!', 'Choose your pet!'), 300);
}

function screenPet() {
  if (!S.pet) return screenPetSetup(() => screenPet(), () => screenHome());
  const p = S.pet;
  const dirt = p.clean < 35 ? DIRT.slice(0, 5) : p.clean < 65 ? DIRT.slice(0, 2) : [];
  const stat = (ic, v) => `<div class="stat"><span>${ic}</span><i><b style="width:${v}%;background:${v < 35 ? '#EF4444' : v < 65 ? '#FACC15' : '#22C55E'}"></b></i></div>`;
  const acts = [
    ['bath', '🛁', 'Bañar', 'Bath'], ['teeth', '🪥', 'Dientes', 'Teeth'], ['feed', '🍎', 'Comer', 'Eat'], ['dress', '👕', 'Vestir', 'Dress up'],
    ['emotions', '😊', 'Emociones', 'Feelings'], ['sleep', '🌙', 'Dormir', 'Sleep'], ['cook', '🍳', 'Cocinar', 'Cook'],
  ];
  const my = render(`<div class="pet-home">
    <div class="stats">${stat('🍎', p.hunger)}${stat('🛁', p.clean)}${stat('⚡', p.energy)}${stat('❤️', p.happy)}</div>
    <button class="pet-stage" id="pet">${petSVG(p, { dirt, mood: 'happy' })}</button>
    <div class="pet-name">${p.name}</div>
    <div class="acts">${acts.map((a) => `<button class="act" data-a="${a[0]}"><span>${a[1]}</span><b>${a[2]}</b><small>${a[3]}</small></button>`).join('')}</div>
  </div>`, { title: `${petEmoji()} ${p.name}`, back: () => screenHome(), home: true, cls: 'room' });
  const stage = $('#pet');
  tapify(stage, () => {
    Sfx.squeak(); setMood(stage, 'giggle'); stage.classList.remove('jump'); void stage.offsetWidth; stage.classList.add('jump'); petStat('happy', 2);
    Voice.say([['en', pick(['Hee hee!', 'I love you, {name}!', 'That tickles!', 'Hello, {name}!'])]]);
    later(() => setMood(stage, 'happy'), 1500);
  });
  $$('.act').forEach((b) => tapify(b, () => {
    const a = b.dataset.a;
    startActivity(a === 'cook' ? { type: 'cook', recipe: pick(Object.keys(RECIPES)) } : { type: a }, () => screenPet());
  }));
  const low = [['hunger', 'sad', "I'm hungry!", '¡Tengo hambre! Dame comida.'], ['clean', 'sad', "I'm dirty! Bath time!", '¡Estoy sucio! ¿Me bañas?'], ['energy', 'sleepy', "I'm sleepy...", 'Tengo sueño...']]
    .filter((x) => p[x[0]] < 35).sort((a, b) => p[a[0]] - p[b[0]])[0];
  later(() => {
    if (!alive(my)) return;
    if (low) { setMood(stage, low[1]); sayEn(low[2], low[3]); }
    else sayEn("Hi {name}! Let's play!", '¡Hola {name}! ¡Juguemos!');
  }, 400);
}

/* ---------- Bañar ---------- */
const DIRT = [{ x: 110, y: 78, r: 16 }, { x: 200, y: 92, r: 14 }, { x: 92, y: 228, r: 17 }, { x: 208, y: 232, r: 16 }, { x: 150, y: 58, r: 13 }, { x: 128, y: 245, r: 13 }, { x: 228, y: 160, r: 12 }, { x: 72, y: 165, r: 12 }];
function careLayout(cls, tools, hint) {
  return `<div class="care ${cls}"><div class="care-stage" id="stage"><div class="pet-box" id="petBox"></div><div class="fx" id="fx"></div></div>
    <div class="hint" id="hint">${hint}</div><div class="tools">${tools}</div></div>`;
}
function screenBath(done, back) {
  const p = S.pet;
  const my = render(careLayout('bath', '<div class="tool" id="sponge">🧽</div><div class="tool hidden" id="shower">🚿</div>', 'Arrastra la esponja sobre la mascota 🧽'), { title: '🛁 Bath time', back, cls: 'bathroom' });
  $('#petBox').innerHTML = petSVG(p, { dirt: DIRT, mood: 'sad' }) + '<div class="tub"></div>';
  const fx = $('#fx'), box = $('#petBox');
  const spots = $$('.dirt', box).map((el) => ({ el, hp: 5 }));
  let bubbles = [], phase = 1, lastT = 0, said = false;
  const local = (x, y) => { const r = fx.getBoundingClientRect(); return [x - r.left, y - r.top]; };
  const addBubble = (x, y) => {
    if (bubbles.length > 70) return;
    const [lx, ly] = local(x, y); const b = document.createElement('i');
    b.className = 'soap'; const s = rand(18, 42); b.style.cssText = `left:${lx - s / 2 + rand(-20, 20)}px;top:${ly - s / 2 + rand(-20, 20)}px;width:${s}px;height:${s}px`;
    fx.appendChild(b); bubbles.push(b);
  };
  dragTool($('#sponge'), {
    onMove: (x, y) => {
      const t = performance.now(); if (t - lastT < 70) return; lastT = t;
      if (!near(box, x, y)) return;
      addBubble(x, y); Sfx.scrub();
      if (!said) { said = true; setMood(box, 'giggle'); Voice.say([['en', 'Scrub, scrub, scrub!']]); }
      spots.forEach((d) => { if (d.hp > 0 && near(d.el, x, y, 28)) { d.hp--; d.el.style.opacity = (d.hp / 5) * 0.85; if (!d.hp) { Sfx.pop(); burst(x, y, ['✨'], 4); } } });
      if (spots.every((d) => !d.hp) && phase === 1) rinse();
    },
  });
  function rinse() {
    phase = 2;
    $('#sponge').classList.add('hidden'); $('#shower').classList.remove('hidden'); $('#shower').classList.add('pulse');
    $('#hint').textContent = 'Ahora enjuaga con la ducha 🚿';
    const r = box.getBoundingClientRect();
    while (bubbles.length < 25) addBubble(r.left + rand(r.width * 0.2, r.width * 0.8), r.top + rand(r.height * 0.15, r.height * 0.8));
    Voice.say([['en', 'Now rinse!'], ['es', '¡Ahora enjuaga con la ducha!']]);
    const startN = bubbles.length;
    dragTool($('#shower'), {
      onMove: (x, y) => {
        const t = performance.now(); if (t - lastT < 60) return; lastT = t;
        const [lx, ly] = local(x, y);
        for (let k = 0; k < 3; k++) { const d = document.createElement('i'); d.className = 'drop'; d.style.left = lx + rand(-30, 30) + 'px'; d.style.top = ly + 20 + 'px'; fx.appendChild(d); setTimeout(() => d.remove(), 700); }
        Sfx.splash();
        bubbles = bubbles.filter((b) => { if (near(b, x, y + 40, 50)) { b.remove(); return false; } return true; });
        if (phase === 2 && bubbles.length <= startN * 0.2) finish();
      },
    });
  }
  function finish() {
    phase = 3; bubbles.forEach((b) => b.remove()); bubbles = [];
    $('#shower').classList.add('hidden'); $('#hint').textContent = '¡Quedó brillante! ✨';
    setMood(box, 'giggle'); Sfx.win(); burstEl(box, ['✨', '🫧', '⭐'], 16);
    petStat('clean', 100); petStat('happy', 10);
    Voice.say([['en', 'So clean! Thank you, {name}!'], ['es', '¡{pet} quedó brillante! Bañarse nos mantiene sanos.']]).then(() => alive(my) && done(3));
  }
  later(() => alive(my) && sayEs('¡Oh! {pet} está sucio. ¡Vamos a bañarlo! Arrastra la esponja.', 'Bath time!'), 300);
}

/* ---------- Lavar dientes ---------- */
function teethSVG(p) {
  const dk = shade(p.color, -50);
  let up = '', lo = '';
  for (let k = 0; k < 6; k++) {
    const off = Math.abs(k - 2.5) * 8;
    up += `<rect x="${101 + k * 33}" y="${72 + off}" width="30" height="58" rx="11" fill="#fff" stroke="#E5E7EB" stroke-width="2"/>`;
    lo += `<rect x="${101 + k * 33}" y="${182 - off}" width="30" height="44" rx="11" fill="#fff" stroke="#E5E7EB" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 400 300" class="teeth-svg"><rect width="400" height="300" rx="40" fill="${p.color}"/>
    <ellipse cx="200" cy="150" rx="172" ry="126" fill="${dk}"/><ellipse cx="200" cy="150" rx="155" ry="110" fill="#5B1520"/>
    <ellipse cx="200" cy="232" rx="95" ry="42" fill="#F472B6"/>${up}${lo}</svg>`;
}
function screenTeeth(done, back) {
  const p = S.pet;
  const my = render(careLayout('teeth', '<div class="tool" id="brush">🪥</div>', 'Cepilla los bichitos 🦠'), { title: '🪥 Brush teeth', back, cls: 'bathroom' });
  const box = $('#petBox'); box.classList.add('mouth'); box.innerHTML = teethSVG(p);
  const fx = $('#fx');
  const G = [[0, 1], [2, 1], [4, 1], [1, 0], [3, 0], [5, 0]];
  const germs = G.map(([k, up]) => {
    const off = Math.abs(k - 2.5) * 8;
    const cx = 101 + k * 33 + 15, cy = up ? 72 + off + 29 : 182 - off + 22;
    const el = document.createElement('span'); el.className = 'germ'; el.textContent = '🦠';
    el.style.left = (cx / 400 * 100) + '%'; el.style.top = (cy / 300 * 100) + '%';
    box.appendChild(el); return { el, hp: 5 };
  });
  let lastT = 0, said = false;
  dragTool($('#brush'), {
    onMove: (x, y) => {
      const t = performance.now(); if (t - lastT < 70) return; lastT = t;
      if (!near(box, x, y)) return;
      Sfx.scrub();
      const r = fx.getBoundingClientRect(); const f = document.createElement('i'); f.className = 'soap'; const s = rand(14, 26);
      f.style.cssText = `left:${x - r.left - s / 2 + rand(-15, 15)}px;top:${y - r.top - s / 2 + rand(-10, 10)}px;width:${s}px;height:${s}px`; fx.appendChild(f); setTimeout(() => f.remove(), 1800);
      if (!said) { said = true; Voice.say([['en', 'Brush, brush, brush your teeth!']]); }
      germs.forEach((g) => { if (g.hp > 0 && near(g.el, x, y, 22)) { g.hp--; g.el.style.transform = `translate(-50%,-50%) scale(${0.4 + g.hp * 0.12})`; if (!g.hp) { g.el.remove(); Sfx.pop(); burst(x, y, ['✨', '⭐'], 6); } } });
      if (germs.every((g) => !g.hp) && !box.dataset.done) {
        box.dataset.done = 1; $('#brush').classList.add('hidden'); $('#hint').textContent = '¡Dientes brillantes! ✨';
        Sfx.win(); burstEl(box, ['✨', '🦷', '⭐'], 16); petStat('clean', 15); petStat('happy', 10);
        Voice.say([['en', 'Sparkling clean teeth!'], ['es', '¡Dientes súper limpios! Hay que lavarse los dientes después de comer y antes de dormir.']]).then(() => alive(my) && done(3));
      }
    },
  });
  later(() => alive(my) && sayEs('¡Oh no! Los dientes de {pet} tienen bichitos. ¡Ayúdame a cepillarlos!', "Let's brush our teeth!"), 300);
}

/* ---------- Dar de comer ---------- */
function screenFeed(done, back) {
  const p = S.pet;
  let eaten = 0; const NEED = 4;
  const foods = shuffle(FOODS.filter((f) => f.ok)).slice(0, 5).concat(shuffle(FOODS.filter((f) => !f.ok)).slice(0, 1));
  const my = render(careLayout('feed', `<div class="tray">${shuffle(foods).map((f, k) => `<div class="tool food" data-k="${foods.indexOf(f)}">${f.e}</div>`).join('')}</div>`, ''), { title: '🍎 Yummy!', back, cls: 'kitchen-bg' });
  const box = $('#petBox'); box.innerHTML = petSVG(p, { mood: p.hunger < 50 ? 'sad' : 'happy' });
  const bar = () => { $('#hint').innerHTML = `<span class="belly">${Array.from({ length: NEED }, (_, k) => k < eaten ? '🟢' : '⚪').join('')}</span>`; };
  bar();
  let busy = false;
  $$('.food').forEach((el) => dragTool(el, {
    onMove: (x, y) => { if (!busy) setMood(box, near($('.pet-head', box), x, y, 30) ? 'open' : 'happy'); },
    onEnd: (x, y, g) => {
      if (busy || !near($('.pet-head', box), x, y, 30)) { setMood(box, 'happy'); return; }
      busy = true;
      const f = foods[el.dataset.k];
      const [hx, hy] = center($('.pet-head', box));
      g.style.transition = 'transform .35s ease-in, opacity .35s'; g.style.transform = `translate(${hx - 30}px,${hy}px) scale(.2)`; g.style.opacity = '0';
      setTimeout(() => g.remove(), 400);
      let n = 0; const chew = setInterval(() => { if (!alive(my)) return clearInterval(chew); setMood(box, n % 2 ? 'open' : 'chew'); Sfx.chew(); if (++n > 5) { clearInterval(chew); setMood(box, 'giggle'); } }, 220);
      const parts = f.ok ? [['en', `Yummy! ${f.en}!`], ['es', f.es]] : [['en', `${f.en}! Mmm, just a little bit.`], ['es', 'Los dulces, solo un poquito. ¡Así cuidamos los dientes!', 'force']];
      if (f.ok) { eaten++; petStat('hunger', 20); }
      bar();
      Voice.say(parts).then(() => {
        if (!alive(my)) return; busy = false;
        if (eaten >= NEED) { Sfx.win(); burstEl(box, ['💖', '⭐'], 12); petStat('hunger', 100);
          Voice.say([['en', "I'm full! Thank you, {name}!"], ['es', '¡Estoy lleno! ¡Gracias! Las frutas y verduras nos hacen crecer fuertes.']]).then(() => alive(my) && done(3)); }
      });
    },
  }));
  later(() => alive(my) && sayEs('{pet} tiene hambre. Arrastra la comida a su boca.', "I'm hungry!"), 300);
}

/* ---------- Vestir ---------- */
function screenDress(done, back) {
  const p = S.pet; let tab = 'hat';
  const my = render(`<div class="dress"><div class="pet-box sm" id="petBox"></div>
    <div class="tabs">${Object.entries(WARDROBE).map(([k, w]) => `<button class="tab ${k === tab ? 'sel' : ''}" data-t="${k}">${w.icon}<small>${w.es}</small></button>`).join('')}</div>
    <div class="wardrobe" id="ward"></div><button class="btn-big" id="ok">¡Listo! ✓</button></div>`, { title: '👕 Dress up', back, cls: 'room' });
  const box = $('#petBox');
  const draw = (mood = 'happy') => { box.innerHTML = petSVG(p, { mood }); };
  const items = () => {
    const W = WARDROBE[tab];
    $('#ward').innerHTML = `<button class="wear none" data-k="-1">🚫</button>` + W.items.map((it, k) => {
      const lock = it.cost > S.stars, on = p.outfit[tab] === (it.color || it.e);
      return `<button class="wear ${on ? 'on' : ''} ${lock ? 'locked' : ''}" data-k="${k}">${it.color ? `<span class="swatch sm" style="background:${it.color}"></span>` : it.e}${lock ? `<small>🔒${it.cost}⭐</small>` : ''}</button>`;
    }).join('');
    $$('.wear').forEach((b) => tapify(b, () => {
      const k = +b.dataset.k;
      if (k < 0) { delete p.outfit[tab]; save(); draw(); items(); return; }
      const it = WARDROBE[tab].items[k];
      if (it.cost > S.stars) { Sfx.oops(); return sayEs(`Necesitas ${it.cost} estrellas para esto. ¡Sigue jugando para ganar más!`); }
      const v = it.color || it.e;
      if (p.outfit[tab] === v) delete p.outfit[tab]; else p.outfit[tab] = v;
      save(); draw('giggle'); items(); Sfx.good(); burstEl(box, ['✨'], 6);
      Voice.say([['en', `${it.en}!`], ['es', it.es]]);
      later(() => alive(my) && setMood(box, 'happy'), 1500);
    }));
  };
  draw(); items();
  $$('.tab').forEach((b) => tapify(b, () => { tab = b.dataset.t; $$('.tab').forEach((x) => x.classList.toggle('sel', x === b)); items(); Voice.say([['es', WARDROBE[tab].es, 'force']]); }));
  tapify($('#ok'), () => { Voice.say([['en', 'I look great!'], ['es', '¡Me veo genial!']]).then(() => alive(my) && done(2)); });
  later(() => alive(my) && sayEs('¡Vamos a vestir a {pet}! Elige ropa y accesorios.', 'Dress up time!'), 300);
}

/* ---------- Emociones ---------- */
function screenEmotions(done, back) {
  const p = S.pet; const seen = new Set();
  const my = render(`<div class="emo-screen"><div class="pet-box sm" id="petBox">${petSVG(p, { mood: 'happy' })}</div>
    <button class="prompt" id="prompt">😊 ¿Cómo se siente?</button><div class="emo-grid" id="grid"></div><button class="btn-big hidden" id="play">🎯 ¡A jugar!</button></div>`, { title: '😊 Feelings', back, cls: 'room' });
  const box = $('#petBox');
  const grid = (list, fn) => { $('#grid').innerHTML = list.map((e, k) => `<button class="emo-btn pop-in" style="animation-delay:${k * 50}ms" data-k="${k}"><span>${e.e}</span><b>${e.en}</b></button>`).join(''); $$('.emo-btn').forEach((b) => tapify(b, () => fn(list[b.dataset.k], b))); };
  grid(EMOTIONS, (e) => {
    setMood(box, e.id); seen.add(e.id);
    Voice.say([['en', `${e.en}! I feel ${e.en.toLowerCase()}.`], ['es', `${p.name} se siente ${e.es}.`], ...(e.tip ? [['es', e.tip, 'force']] : [])]);
    if (seen.size >= 3) $('#play').classList.remove('hidden');
  });
  let round = 0, mistakes = 0;
  const qs = shuffle(EMOTIONS).slice(0, 4);
  function quiz() {
    $('#play').classList.add('hidden');
    if (round >= qs.length) return done(mistakes < 2 ? 3 : 2);
    const e = qs[round];
    setMood(box, e.id);
    const opts = shuffle([e, ...shuffle(EMOTIONS.filter((x) => x !== e)).slice(0, 2)]);
    $('#prompt').textContent = '🔊 ' + fill(e.story.en);
    const ask = () => Voice.say([['en', e.story.en], ['es', e.story.es], ['en', 'How does {pet} feel?']]);
    ask(); $('#prompt').onclick = ask;
    let locked = false;
    grid(opts, async (o, b) => {
      if (locked) return;
      if (o === e) { locked = true; b.classList.add('right'); Sfx.good(); burstEl(b); await Voice.say([['en', `Yes! ${e.en}!`], ['es', e.es]]); if (alive(my)) { round++; later(quiz, 400); } }
      else { mistakes++; b.classList.add('shake'); Sfx.oops(); later(() => b.classList.remove('shake'), 500); Voice.say([['en', `Hmm, look at ${p.name}'s face!`]]); }
    });
  }
  tapify($('#play'), () => sayEs('Escucha la historia y adivina cómo se siente.').then(() => alive(my) && quiz()));
  later(() => alive(my) && sayEs('Toca una carita para ver cómo se siente {pet}.', 'How do you feel?'), 300);
}

/* ---------- Dormir ---------- */
function screenSleep(done, back) {
  const p = S.pet;
  const my = render(`<div class="sleep" id="room"><div class="window" id="win">☀️</div><div class="pet-box sm bed-pet" id="petBox">${petSVG(p, { mood: 'sleepy' })}</div><div class="bed"></div>
    <div class="night-stars">✨ ⭐ ✨ ⭐ ✨</div><button class="btn-round lamp pulse" id="lamp">💡</button></div>`, { title: '🌙 Good night', back, cls: 'bedroom' });
  const box = $('#petBox'), room = $('#room');
  let stage = 0;
  tapify($('#lamp'), async () => {
    if (stage === 0) {
      stage = 1; room.classList.add('night'); $('#win').textContent = '🌙'; $('#lamp').classList.remove('pulse'); $('#lamp').textContent = '🌙';
      await Voice.say([['en', 'Good night, {pet}! Sweet dreams!'], ['es', '¡Buenas noches! ¡Dulces sueños! Dormir nos da energía.']]);
      if (!alive(my)) return;
      const t = Sfx.lullaby();
      later(() => { stage = 2; $('#lamp').textContent = '☀️'; $('#lamp').classList.add('pulse'); sayEs('¡Ya es de día! Toca el sol para despertar a {pet}.'); }, t * 1000 + 500);
    } else if (stage === 2) {
      stage = 3; room.classList.remove('night'); $('#win').textContent = '☀️'; $('#lamp').classList.remove('pulse');
      setMood(box, 'giggle'); box.classList.add('jump'); Sfx.win(); petStat('energy', 100);
      await Voice.say([['en', 'Good morning, {name}!'], ['es', '¡Buenos días! ¡Tengo mucha energía!']]);
      if (alive(my)) done(2);
    }
  });
  later(() => alive(my) && sayEs('{pet} tiene sueño. Apaga la luz.', 'Time for bed!'), 300);
}

/* ---------- Cocina ---------- */
function screenCook(key, done, back) {
  const R = RECIPES[key];
  const my = render(`<div class="cook"><div class="recipe-card">${R.e} <b>${R.en}</b>${S.settings.spanish ? ` <small>${R.es}</small>` : ''}</div>
    <div class="cook-stage" id="stage"><div class="vessel ${R.base}" id="vessel"><div class="v-fill" id="vfill"></div></div></div>
    <div class="tray" id="tray">${R.ings.map((g, k) => `<div class="tool ing" data-k="${k}">${g.e}</div>`).join('')}</div>
    <button class="btn-big hidden" id="act">${R.act.e} ${R.act.es}</button></div>`, { title: `🍳 ${R.en}`, back, cls: 'kitchen-bg' });
  const vessel = $('#vessel'), vfill = $('#vfill');
  let added = 0;
  $$('.ing').forEach((el) => dragTool(el, {
    onEnd: (x, y) => {
      if (!near(vessel, x, y, 20)) return;
      const g = R.ings[el.dataset.k];
      el.classList.add('used'); added++; Sfx.pop();
      const copies = R.base === 'blender' ? 2 : 3;
      for (let c = 0; c < copies; c++) {
        const s = document.createElement('span'); s.className = 'piece-in pop-in'; s.textContent = g.e;
        const a = Math.random() * 6.28, d = Math.random() * 30;
        s.style.left = 50 + Math.cos(a) * d + '%'; s.style.top = (R.base === 'blender' ? 70 - added * 10 + rand(-5, 5) : 50 + Math.sin(a) * d) + '%';
        vfill.appendChild(s);
      }
      if (key === 'pizza' && g.en === 'Tomato') vessel.classList.add('sauce');
      Voice.say([['en', g.en], ['es', g.es]]);
      if (added === R.ings.length) { $('#act').classList.remove('hidden'); $('#act').classList.add('pulse'); later(() => Voice.say([['en', R.act.en], ['es', R.act.es]]), 1500); }
    },
  }));
  tapify($('#act'), async () => {
    $('#act').classList.add('hidden'); $('#tray').classList.add('hidden');
    vessel.classList.add('anim-' + R.act.anim);
    if (R.act.anim === 'bake') { $('#stage').insertAdjacentHTML('beforeend', '<div class="oven">🔥🔥🔥</div>'); }
    for (let k = 0; k < 6; k++) setTimeout(() => Sfx.tone(300 + k * 80, 0.15, 'triangle', 0.1), k * 300);
    await sleep(2200);
    if (!alive(my)) return;
    $('#stage').innerHTML = `<div class="dish pop-in">${R.e}</div>`; Sfx.win(); burstEl($('.dish'), ['✨', '⭐', '😋'], 14);
    await Voice.say([['en', `Yummy! ${R.en}!`], ['es', `¡Qué rico! ¡Hiciste ${R.es}!`]]);
    if (!alive(my)) return;
    $('#stage').insertAdjacentHTML('beforeend', `<button class="btn-big" id="serve">${petEmoji()} Darle a ${petName()}</button>`);
    tapify($('#serve'), async () => {
      if (!S.pet) return done(3);
      $('#stage').innerHTML = `<div class="pet-box sm" id="petBox">${petSVG(S.pet, { mood: 'open' })}</div><div class="dish small">${R.e}</div>`;
      const box = $('#petBox'); let n = 0;
      const chew = setInterval(() => { if (!alive(my)) return clearInterval(chew); setMood(box, n % 2 ? 'open' : 'chew'); Sfx.chew(); if (++n > 6) { clearInterval(chew); setMood(box, 'giggle'); $('.dish').remove(); } }, 230);
      petStat('hunger', 40);
      await Voice.say([['en', 'Delicious! Thank you, {name}!'], ['es', '¡Delicioso! ¡Gracias, {name}!']]);
      if (alive(my)) done(3);
    });
  });
  later(() => alive(my) && sayEs(`¡Vamos a preparar ${R.es}! Arrastra los ingredientes.`, `Let's make ${R.en.toLowerCase()}!`), 300);
}
