'use strict';
/* ============ LECCIONES DE INGLÉS, CONVERSACIONES Y JUEGOS ============ */

/* ---------- Lección (aprender + quiz) ---------- */
function screenLesson(topicKey, done, back) {
  const T = TOPICS[topicKey];
  const items = shuffle(T.items).slice(0, 4);
  const my = render(`<div class="lesson"><div class="dots" id="dots"></div><div class="stage" id="stage"></div>
    <div class="lumi-wrap corner bob">${lumiSVG()}</div></div>`, { title: `${T.icon} ${T.en}`, back });
  const stage = $('#stage');
  const dots = (n, on) => { $('#dots').innerHTML = Array.from({ length: n }, (_, k) => `<span class="dot ${k < on ? 'on' : ''}"></span>`).join(''); };
  const extra = (it) => (it.sound ? [['pause', 250], ['en', it.sound]] : []);
  let i = 0;
  const speakItem = (it) => Voice.say([['en', it.en], ['pause', 200], ['es', it.es], ['pause', 200], ['en', it.en], ...extra(it)]);

  function learn() {
    if (i >= items.length) return quizIntro();
    dots(items.length, i + 1);
    const it = items[i];
    stage.innerHTML = `<button class="card-learn pop-in" id="card"><span class="vis xl">${itemVisual(it)}</span><span class="word-en">${it.en}</span>${S.settings.spanish ? `<span class="word-es">${it.es}</span>` : ''}</button>
      <div class="row-btns"><button class="btn-circle" id="rep">🔊</button>${Listen.ok || (navigator.mediaDevices && window.MediaRecorder) ? '<button class="btn-circle mic" id="mic">🎤</button>' : ''}<button class="btn-circle next" id="next">➡</button></div>`;
    speakItem(it).then((ok) => { if (ok && alive(my) && $('#next')) $('#next').classList.add('pulse'); });
    tapify($('#card'), () => { $('#card').classList.remove('wiggle'); void $('#card').offsetWidth; $('#card').classList.add('wiggle'); speakItem(it); });
    tapify($('#rep'), () => speakItem(it));
    tapify($('#next'), () => { i++; learn(); });
    if ($('#mic')) {
      const mic = $('#mic'); let on = false, stopT = null;
      const stopRec = async () => {
        if (!on) return; on = false; clearTimeout(stopT); mic.classList.remove('recording'); mic.textContent = '🎤';
        const r = await Rec.stop();
        if (!alive(my)) return;
        if (!r.blob && !r.text) {
          if (/not-allowed|service-not-allowed|audio-capture/.test(Rec.srError || '')) return Voice.say([['es', TALK.noMic, 'force']]);
          return Voice.say([['es', `Toca el micrófono y di: ${it.en}`, 'force']]);
        }
        if (r.blob) { await Voice.play(URL.createObjectURL(r.blob), 'es', {}); if (!alive(my)) return; }
        Sfx.good(); burstEl($('#card'));
        const heard = norm(r.text), word = norm(it.en).split(' ')[0];
        if (!heard || heard.includes(word)) Voice.say([['en', `Perfect! ${it.en}!`], ['es', '¡Perfecto!']]);
        else Voice.say([['en', `Good try! ${it.en}!`], ['es', '¡Buen intento!']]);
      };
      tapify(mic, () => {
        if (on) return stopRec();
        Voice.stop(); on = true; mic.classList.add('recording'); mic.textContent = '👂';
        Rec.start('en-US').then((ok) => { if (!ok && on) { on = false; mic.classList.remove('recording'); mic.textContent = '🎤'; Voice.say([['es', TALK.noMic, 'force']]); } });
        stopT = later(stopRec, 3500);
      });
    }
  }
  let round = 0, mistakes = 0, wrongHere = 0;
  const order = shuffle(items);
  function quizIntro() {
    stage.innerHTML = `<div class="big-msg pop-in">🎯</div>`;
    sayEs('¡Ahora juguemos! Escucha y toca el correcto.', "Let's play!").then(() => alive(my) && quiz());
  }
  function quiz() {
    if (round >= order.length) return done(mistakes === 0 ? 3 : mistakes < 3 ? 2 : 1);
    dots(order.length, round + 1);
    const it = order[round]; wrongHere = 0;
    const opts = shuffle([it, ...shuffle(items.filter((x) => x !== it)).slice(0, 2)]);
    const q = T.q.replace('{w}', it.en);
    stage.innerHTML = `<button class="prompt pop-in" id="prompt">🔊 ${q}</button><div class="options">${opts.map((o, k) => `<button class="opt pop-in" style="animation-delay:${k * 80}ms" data-k="${k}"><span class="vis lg">${itemVisual(o)}</span></button>`).join('')}</div>`;
    const ask = () => Voice.say([['en', q]]);
    ask(); tapify($('#prompt'), ask);
    let locked = false;
    $$('.opt').forEach((b) => tapify(b, async () => {
      if (locked) return;
      const o = opts[b.dataset.k];
      if (o === it) {
        locked = true; b.classList.add('right'); Sfx.good(); burstEl(b);
        await Voice.say([['en', `Yes! ${it.en}!`], ['es', it.es]]);
        if (!alive(my)) return; round++; later(quiz, 300);
      } else {
        mistakes++; wrongHere++; b.classList.add('shake'); Sfx.oops(); later(() => b.classList.remove('shake'), 500);
        const parts = [['en', `That's ${o.en}. Try again!`]];
        if (wrongHere >= 2) parts.push(['es', `Busca: ${it.es}`, 'force']);
        Voice.say(parts);
      }
    }));
  }
  later(() => alive(my) && sayEs(T.intro, T.en).then((ok) => ok && alive(my) && learn()), 250);
  stage.innerHTML = `<div class="big-msg pop-in">${T.icon}</div>`;
}

/* ---------- Conversación con Lumi ---------- */
function screenChat(key, done, back) {
  const D = DIALOGS[key];
  const my = render(`<div class="chat">
    <div class="chat-top"><div class="lumi-wrap md bob" id="lumi">${lumiSVG()}</div>
      <button class="bubble big" id="bubble"><b id="bEn"></b><span id="bEs"></span></button></div>
    <div class="kid" id="kid"></div>
    <div class="chat-opts" id="opts"></div>
    ${Listen.ok ? '<button class="btn mic-btn" id="mic">🎤 Responder hablando</button>' : ''}
  </div>`, { title: `💬 ${D.en}`, back });
  let step = 0, cur = null;
  const bubble = (en, es) => { $('#bEn').textContent = fill(en); $('#bEs').textContent = S.settings.spanish ? fill(es) : ''; $('#bubble').classList.remove('pop-in'); void $('#bubble').offsetWidth; $('#bubble').classList.add('pop-in'); };
  async function ask() {
    if (step >= D.steps.length) return done(2);
    cur = D.steps[step];
    $('#opts').innerHTML = ''; $('#kid').innerHTML = '';
    if ($('#mic')) $('#mic').style.visibility = 'hidden';
    bubble(cur.en, cur.es);
    await Voice.say([['en', cur.en], ['es', cur.es]]);
    if (!alive(my)) return;
    $('#opts').innerHTML = cur.options.map((o, k) => `<button class="chat-opt pop-in" style="animation-delay:${k * 70}ms" data-k="${k}">
      ${o.color ? `<span class="swatch sm" style="background:${o.color}"></span>` : `<span class="emo">${o.emoji}</span>`}<span>${fill(o.label)}</span></button>`).join('');
    if ($('#mic')) $('#mic').style.visibility = 'visible';
    $$('.chat-opt').forEach((b) => tapify(b, () => answer(cur.options[b.dataset.k])));
  }
  let busy = false;
  async function answer(o) {
    if (busy) return; busy = true;
    $('#opts').innerHTML = ''; if ($('#mic')) $('#mic').style.visibility = 'hidden';
    $('#kid').innerHTML = `<div class="kid-bubble pop-in">${o.color ? `<span class="swatch sm" style="background:${o.color}"></span>` : o.emoji} ${fill(o.label)}</div>`;
    await Voice.say([['en', o.label, { pitch: 1.6, rate: 1.05, kid: true }]]);
    if (!alive(my)) return;
    Sfx.good(); $('#lumi').classList.add('jump'); later(() => $('#lumi') && $('#lumi').classList.remove('jump'), 600);
    bubble(o.reply.en, o.reply.es);
    await Voice.say([['en', o.reply.en], ['es', o.reply.es]]);
    if (!alive(my)) return;
    busy = false; step++; later(ask, 700);
  }
  tapify($('#bubble'), () => cur && Voice.say([['en', cur.en], ['es', cur.es]]));
  if ($('#mic')) tapify($('#mic'), async () => {
    if (!cur) return;
    $('#mic').textContent = '👂 Escuchando...';
    const heard = await Listen.hear('en-US');
    if (!alive(my)) return;
    $('#mic').textContent = '🎤 Responder hablando';
    if (!heard) return sayEs('No te escuché. Toca un dibujo o intenta otra vez.');
    const words = (s) => fill(s).toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter((w) => w.length > 2 && !['the', 'its', 'and'].includes(w));
    const match = cur.options.find((o) => words(o.label).some((w) => heard.includes(w)));
    if (match) answer(match);
    else if (cur.options.length === 1) answer(cur.options[0]);
    else { Sfx.good(); sayEn('Good try! Tap a picture too!', '¡Buen intento! Ahora toca un dibujo.'); }
  });
  later(ask, 300);
}

/* ---------- Memoria ---------- */
function screenMemory(topicKey, done, back) {
  const T = TOPICS[topicKey] && TOPICS[topicKey].items[0].emoji ? TOPICS[topicKey] : TOPICS.animals;
  const set = shuffle(T.items).slice(0, 4);
  const cards = shuffle([...set, ...set]);
  const my = render(`<div class="memory"><div class="mem-grid">${cards.map((c, k) => `<button class="mem-card" data-k="${k}"><span class="mem-back">⭐</span><span class="mem-front">${c.emoji}</span></button>`).join('')}</div></div>`, { title: '🃏 Memory', back });
  let open = [], found = 0, lock = false;
  $$('.mem-card').forEach((b) => tapify(b, () => {
    if (lock || b.classList.contains('flip')) return;
    const c = cards[b.dataset.k];
    b.classList.add('flip'); open.push(b); Voice.say([['en', c.en]]);
    if (open.length === 2) {
      lock = true;
      const [a, z] = open;
      if (cards[a.dataset.k] === cards[z.dataset.k]) {
        later(() => { Sfx.good(); a.classList.add('matched'); z.classList.add('matched'); burstEl(z); Voice.say([['en', `${c.en}!`], ['es', c.es]]); open = []; lock = false; found++;
          if (found === set.length) later(() => done(3), 1600); }, 500);
      } else later(() => { a.classList.remove('flip'); z.classList.remove('flip'); open = []; lock = false; }, 1100);
    }
  }));
  later(() => alive(my) && sayEs('Encuentra las parejas iguales.', 'Find the pairs!'), 300);
}

/* ---------- Burbujas de colores ---------- */
function screenBubbles(done, back) {
  const cols = shuffle(TOPICS.colors.items.filter((c) => c.en !== 'White' && c.en !== 'Black')).slice(0, 4);
  let target = cols[0], got = 0, total = 0;
  const my = render(`<div class="bubbles" id="field"><button class="prompt floating" id="prompt"></button><div class="meter" id="meter"></div></div>`, { title: '🫧 Bubbles', back, cls: 'sea' });
  const field = $('#field');
  const setTarget = () => {
    $('#prompt').innerHTML = `🔊 Pop <span class="swatch sm" style="background:${target.color}"></span> ${target.en}!`;
    Voice.say([['en', `Pop the ${target.en.toLowerCase()} bubbles!`], ['es', `¡Revienta las burbujas de color ${target.es}!`]]);
  };
  const meter = () => { $('#meter').innerHTML = Array.from({ length: 6 }, (_, k) => `<span>${k < total ? '⭐' : '☆'}</span>`).join(''); };
  tapify($('#prompt'), setTarget);
  const bubbles = [];
  function spawn() {
    if (!alive(my)) return;
    const W = field.clientWidth, H = field.clientHeight;
    const col = Math.random() < 0.45 ? target : pick(cols);
    const size = rand(70, 105);
    const b = document.createElement('button');
    b.className = 'bub'; b.style.width = b.style.height = size + 'px';
    b.style.setProperty('--bc', col.color);
    const o = { el: b, x: rand(10, Math.max(20, W - size - 10)), y: H + 10, v: rand(55, 95), ph: Math.random() * 6, col };
    b.style.transform = `translate(${o.x}px,${o.y}px)`;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault(); Sfx.unlock(); Sfx.pop();
      const [cx, cy] = center(b); b.remove(); o.dead = true;
      if (col === target) {
        burst(cx, cy, ['✨', '⭐'], 6); got++; total++; meter();
        if (total >= 6) { Voice.say([['en', 'Great job!']]); return later(() => done(3), 1200); }
        if (got >= 3) { got = 0; target = pick(cols.filter((c) => c !== target)); later(setTarget, 500); }
        else Voice.say([['en', col.en]]);
      } else { burst(cx, cy, ['💧'], 4); Voice.say([['en', `That's ${col.en.toLowerCase()}!`]]); }
    });
    field.appendChild(b); bubbles.push(o);
    later(spawn, rand(650, 1000));
  }
  let last = performance.now();
  function loop(t) {
    if (!alive(my)) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    for (const o of bubbles) {
      if (o.dead) continue;
      o.y -= o.v * dt; o.ph += dt * 2;
      o.el.style.transform = `translate(${o.x + Math.sin(o.ph) * 12}px,${o.y}px)`;
      if (o.y < -120) { o.dead = true; o.el.remove(); }
    }
    for (let k = bubbles.length - 1; k >= 0; k--) if (bubbles[k].dead) bubbles.splice(k, 1);
    requestAnimationFrame(loop);
  }
  meter(); setTarget(); later(spawn, 800); requestAnimationFrame(loop);
}

/* ---------- Sombras ---------- */
function screenShadows(done, back) {
  let round = 0;
  const pool = shuffle(TOPICS.animals.items);
  const my = render(`<div class="shadows"><div class="sh-row" id="shad"></div><div class="sh-hint">⬆️</div><div class="sh-row" id="pieces"></div></div>`, { title: '👤 Shadows', back });
  function play() {
    if (round >= 2) return done(3);
    const set = pool.slice(round * 3, round * 3 + 3);
    let placed = 0;
    $('#shad').innerHTML = shuffle(set).map((a) => `<div class="shadow" data-en="${a.en}">${a.emoji}</div>`).join('');
    $('#pieces').innerHTML = set.map((a) => `<div class="piece" data-en="${a.en}">${a.emoji}</div>`).join('');
    $$('.piece').forEach((p) => dragTool(p, {
      lift: 0,
      onEnd: (x, y) => {
        const sh = $$('.shadow').find((s) => near(s, x, y, 10));
        const a = set.find((s) => s.en === p.dataset.en);
        if (sh && sh.dataset.en === p.dataset.en) {
          sh.classList.add('filled'); p.classList.add('used'); Sfx.good(); burstEl(sh); placed++;
          Voice.say([['en', a.en], ['es', a.es]]);
          if (placed === 3) { round++; later(play, 1800); }
        } else if (sh) { Sfx.oops(); Voice.say([['en', 'Oops! Try again!']]); }
      },
    }));
  }
  play();
  later(() => alive(my) && sayEs('Arrastra cada animal a su sombra.', 'Find the shadow!'), 300);
}

/* ---------- Contar ---------- */
function screenCounting(done, back) {
  let round = 0, mistakes = 0;
  const my = render(`<div class="counting"><button class="prompt" id="prompt">🔊 How many?</button><div class="count-box" id="box"></div><div class="options" id="opts"></div></div>`, { title: '🔢 Counting', back });
  function play() {
    if (round >= 5) return done(mistakes < 2 ? 3 : 2);
    const n = rand(1, round < 2 ? 5 : 8);
    const it = pick(TOPICS.food.items);
    const nums = TOPICS.numbers.items;
    const opts = shuffle([n, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8].filter((x) => x !== n)).slice(0, 2)]);
    $('#box').innerHTML = Array.from({ length: n }, (_, k) => `<button class="cnt pop-in" style="animation-delay:${k * 90}ms">${it.emoji}</button>`).join('');
    $('#opts').innerHTML = opts.map((o) => `<button class="opt num-opt" data-n="${o}">${o}</button>`).join('');
    const q = () => Voice.say([['en', `How many? Let's count!`], ['es', '¿Cuántos hay? ¡Toca cada uno para contar!']]);
    q(); $('#prompt').onclick = q;
    let c = 0;
    $$('.cnt').forEach((b) => tapify(b, () => { if (b.classList.contains('counted')) return; b.classList.add('counted'); c++; b.dataset.c = c; Voice.say([['en', nums[c - 1].en]]); }));
    let locked = false;
    $$('.num-opt').forEach((b) => tapify(b, async () => {
      if (locked) return;
      if (+b.dataset.n === n) {
        locked = true; b.classList.add('right'); Sfx.good(); burstEl(b);
        await Voice.say([['en', `Yes! ${nums[n - 1].en}!`], ['es', nums[n - 1].es]]);
        if (!alive(my)) return; round++; later(play, 300);
      } else { mistakes++; b.classList.add('shake'); Sfx.oops(); later(() => b.classList.remove('shake'), 500); Voice.say([['en', 'Try again! Count with me.']]); }
    }));
  }
  play();
}

/* ---------- Dibujar ---------- */
function screenDraw(done, back) {
  const COLS = ['#EF4444', '#FB923C', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#F472B6', '#92400E', '#1F1F1F', 'rainbow'];
  const STAMPS = ['⭐', '❤️', '🌸', '🦋', '🐶', '🌈', '☀️', '🍓'];
  render(`<div class="draw"><canvas id="cv"></canvas>
    <div class="draw-tools"><div class="pal">${COLS.map((c) => `<button class="pc ${c === 'rainbow' ? 'rb' : ''}" data-c="${c}" style="background:${c === 'rainbow' ? '' : c}"></button>`).join('')}</div>
    <div class="pal">${[8, 18, 32].map((s) => `<button class="ps" data-s="${s}"><i style="width:${s}px;height:${s}px"></i></button>`).join('')}
      <button class="ps" data-er="1">🧽</button><button class="ps" data-clear="1">🗑️</button>
      ${STAMPS.map((s) => `<button class="ps stp" data-st="${s}">${s}</button>`).join('')}
      <button class="ps ok" id="ok">✅</button></div></div></div>`, { title: '🖍️ Drawing', back });
  const cv = $('#cv'), ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1;
  const fit = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); };
  fit();
  let color = COLS[0], size = 18, erase = false, stamp = null, hue = 0, last = null, strokes = 0;
  const sel = (b, group) => { $$(group).forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); };
  $$('.pc').forEach((b) => tapify(b, () => { color = b.dataset.c; erase = false; stamp = null; sel(b, '.pc'); $$('.ps').forEach((x) => x.classList.remove('sel'));
    const c = TOPICS.colors.items.find((x) => x.color === color); Voice.say([['en', c ? c.en : 'Rainbow!']]); }));
  $$('.ps').forEach((b) => tapify(b, () => {
    if (b.dataset.s) { size = +b.dataset.s; stamp = null; sel(b, '.ps'); }
    if (b.dataset.er) { erase = true; stamp = null; sel(b, '.ps'); }
    if (b.dataset.clear) { fit(); }
    if (b.dataset.st) { stamp = b.dataset.st; sel(b, '.ps'); }
  }));
  $('.pc').classList.add('sel');
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; };
  cv.addEventListener('pointerdown', (e) => {
    e.preventDefault(); const p = pos(e);
    if (stamp) { ctx.font = `${70 * dpr}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(stamp, p[0], p[1]); Sfx.pop(); strokes++; return; }
    last = p; cv.setPointerCapture(e.pointerId); dot(p);
  });
  const stroke = () => { if (erase) return '#fff'; if (color === 'rainbow') { hue = (hue + 6) % 360; return `hsl(${hue},90%,55%)`; } return color; };
  const dot = (p) => { ctx.fillStyle = stroke(); ctx.beginPath(); ctx.arc(p[0], p[1], (erase ? 30 : size) * dpr / 2, 0, 7); ctx.fill(); };
  cv.addEventListener('pointermove', (e) => {
    if (!last) return; const p = pos(e);
    ctx.strokeStyle = stroke(); ctx.lineWidth = (erase ? 30 : size) * dpr; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p;
  });
  const end = () => { if (last) strokes++; last = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  tapify($('#ok'), () => { if (strokes < 2) return sayEs('¡Dibuja algo primero!'); done(2); });
  later(() => sayEs('¡Dibuja lo que quieras! Elige un color.', "Let's draw!"), 300);
}
