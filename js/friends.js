'use strict';
/* ============ AMIGOS: convivencia y manejo del enojo ============ */

function screenFriendsMenu() {
  const items = [
    { k: 'friends', icon: '🤝', es: '¿Qué harías?', en: 'Friends', color: '#FF8FAB', badge: S.done.friends ? '⭐' : '' },
    { k: 'calm', icon: '🧘', es: 'Rincón de la calma', en: 'Calm down', color: '#4FC3F7', badge: S.done.calm ? '⭐' : '' },
    { k: 'emotions', icon: '😊', es: 'Emociones', en: 'Feelings', color: '#FFC83D' },
    { k: 'chat', icon: '💖', es: 'Hablar de lo que siento', en: 'Feelings talk', color: '#A78BFA' },
  ];
  const my = render(`<div class="scroll pad">${lumiTip('¡Aprendamos a ser buenas amigas!')}${menuGrid(items)}</div>`, { title: '🤝 Amigos', back: () => screenHome(), home: true });
  bindGrid(items, (it) => startActivity(it.k === 'chat' ? { type: 'chat', dialog: 'feelings' } : { type: it.k }, () => screenFriendsMenu()));
  later(() => alive(my) && sayEs('¡Aprendamos a ser buenas amigas! ¿Qué quieres hacer?', "Let's be friends!"), 300);
}

/* ---------- ¿Qué harías? (situaciones) ---------- */
function screenSituations(done, back) {
  const rounds = shuffle(FRIENDS).slice(0, 4);
  let round = 0, mistakes = 0;
  const my = render(`<div class="friends"><div class="dots" id="dots"></div>
    <div class="f-scene" id="scene"></div>
    <div class="f-story"><div class="lumi-wrap sm">${lumiSVG()}</div><button class="bubble" id="story"></button></div>
    <div class="f-opts" id="opts"></div></div>`, { title: '🤝 ¿Qué harías?', back, cls: 'park' });
  const F = (t) => ['es', t, 'force'];
  async function play() {
    if (round >= rounds.length) {
      $('#opts').innerHTML = `<div class="rule pop-in"><span>🛑<b>Paro</b></span><span>🌬️<b>Respiro</b></span><span>🗣️<b>Hablo</b></span></div>`;
      $('#scene').textContent = '💖'; $('#story').textContent = 'Enojarse es normal. Cuando te enojes: ¡para, respira y habla con palabras!';
      await Voice.say([F(FRIENDS_TXT.rule)]);
      if (alive(my)) done(mistakes === 0 ? 3 : mistakes < 3 ? 2 : 1);
      return;
    }
    const sc = rounds[round];
    $('#dots').innerHTML = rounds.map((_, k) => `<span class="dot ${k <= round ? 'on' : ''}"></span>`).join('');
    $('#scene').innerHTML = `<span class="pop-in">${sc.scene}</span>`;
    $('#story').textContent = sc.story;
    const opts = shuffle(sc.options);
    $('#opts').innerHTML = opts.map((o, k) => `<button class="f-opt pop-in" style="animation-delay:${k * 90}ms" data-k="${k}"><span class="f-e">${o.e}</span><span>${o.es}</span></button>`).join('');
    let answered = false;
    const btns = $$('.f-opt');
    const readAll = async () => {
      if (!(await Voice.say([F(sc.story), F(FRIENDS_TXT.listen)]))) return;
      for (let k = 0; k < opts.length; k++) {
        if (answered || !alive(my)) return;
        btns.forEach((b) => b.classList.toggle('reading', b === btns[k]));
        if (!(await Voice.say([F(opts[k].es)]))) return;
      }
      btns.forEach((b) => b.classList.remove('reading'));
    };
    readAll();
    $('#story').onclick = () => { Sfx.tap(); readAll(); };
    btns.forEach((b) => tapify(b, async () => {
      if (answered || b.classList.contains('bad')) return;
      const o = opts[b.dataset.k];
      btns.forEach((x) => x.classList.remove('reading'));
      if (o.ok) {
        answered = true; b.classList.add('good'); Sfx.good(); burstEl(b, ['💖', '⭐', '✨'], 10);
        $('#scene').innerHTML = `<span class="pop-in">😊 💖 😊</span>`;
        await Voice.say([F(o.fb), F(FRIENDS_TXT.english), ['en', sc.en[0]], F(sc.en[1])]);
        if (!alive(my)) return;
        round++; later(play, 500);
      } else {
        mistakes++; b.classList.add('bad', 'shake'); Sfx.oops();
        $('#scene').innerHTML = `<span class="pop-in">😢</span>`;
        await Voice.say([F(o.fb), F(FRIENDS_TXT.retry)]);
        if (alive(my) && !answered) $('#scene').innerHTML = `<span>${sc.scene}</span>`;
      }
    }));
  }
  later(() => alive(my) && Voice.say([F(FRIENDS_TXT.intro)]).then((ok) => ok && alive(my) && play()), 300);
  $('#scene').innerHTML = '<span class="pop-in">🤝</span>';
  $('#story').textContent = FRIENDS_TXT.intro;
}

/* ---------- Rincón de la calma (respiración con globo) ---------- */
function screenCalm(done, back) {
  const my = render(`<div class="calm"><div class="calm-count" id="count"></div>
    <div class="balloon-wrap"><div class="balloon" id="balloon"><div class="lumi-wrap">${lumiSVG()}</div></div></div>
    <div class="calm-word" id="word">🧘</div>
    <div class="rule hidden" id="rule"><span data-s="stop">🛑<b>Paro</b></span><span data-s="breathe">🌬️<b>Respiro</b></span><span data-s="talk">🗣️<b>Hablo</b></span></div>
    <button class="btn-big hidden" id="ok">¡Listo! ✓</button></div>`, { title: '🧘 Rincón de la calma', back, cls: 'calmbg' });
  const F = (t) => ['es', t, 'force'];
  const bal = $('#balloon'), word = $('#word');
  async function run() {
    if (!(await Voice.say([F(FRIENDS_TXT.calmIntro)]))) return;
    for (let i = 1; i <= 3; i++) {
      if (!alive(my)) return;
      $('#count').textContent = '🎈'.repeat(i);
      bal.classList.add('big'); word.textContent = 'Inhala 👃'; Sfx.tone(392, 3.5, 'sine', 0.05);
      Voice.say([F(FRIENDS_TXT.inhale), ['en', 'Breathe in...']]);
      await sleep(4500); if (!alive(my)) return;
      bal.classList.remove('big'); word.textContent = 'Exhala 🌬️'; Sfx.tone(330, 3.5, 'sine', 0.05);
      Voice.say([F(FRIENDS_TXT.exhale), ['en', 'Breathe out...']]);
      await sleep(4500);
    }
    if (!alive(my)) return;
    word.textContent = '😊'; $('#rule').classList.remove('hidden');
    for (const s of ['stop', 'breathe', 'talk']) {
      const el = $(`#rule [data-s=${s}]`); el.classList.add('on');
      if (!(await Voice.say([F(FRIENDS_TXT[s])]))) return;
    }
    Sfx.good();
    await Voice.say([F(FRIENDS_TXT.calmDone)]);
    if (alive(my)) $('#ok').classList.remove('hidden');
  }
  tapify($('#ok'), () => done(2));
  later(run, 300);
}
