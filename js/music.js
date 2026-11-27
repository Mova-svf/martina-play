'use strict';
/* ============ MÚSICA ============ */
const INST = () => TOPICS.music.items;

function screenMusicMenu() {
  const items = [
    { k: 'lesson', icon: '🎺', es: 'Instrumentos', en: 'Instruments', color: '#F97316', badge: S.done['lesson-music'] ? '⭐' : '' },
    { k: 'piano', icon: '🎹', es: 'Piano mágico', en: 'Piano', color: '#7B4DFF', badge: S.done.piano ? '⭐' : '' },
    { k: 'band', icon: '🥁', es: 'Mi banda', en: 'My band', color: '#FF6FAE', badge: S.done.band ? '⭐' : '' },
    { k: 'guess', icon: '👂', es: '¿Qué suena?', en: 'Listen!', color: '#3DDC84', badge: S.done.guess ? '⭐' : '' },
  ];
  const my = render(`<div class="scroll pad">${lumiTip('¡Hagamos música!')}${menuGrid(items)}</div>`, { title: '🎵 Música', back: () => screenHome(), home: true });
  bindGrid(items, (it) => startActivity(it.k === 'lesson' ? { type: 'lesson', topic: 'music' } : { type: it.k }, () => screenMusicMenu()));
  later(() => alive(my) && sayEs(MUSIC_TXT.menu, "Let's make music!"), 300);
}

/* ---------- Piano mágico: tocar libre o aprender canciones ---------- */
function screenPiano(done, back) {
  const timbres = ['piano', 'bell', 'flute', 'violin', 'trumpet', 'guitar'];
  let inst = 'piano', song = null, pos = 0;
  const my = render(`<div class="piano-screen">
    <div class="timbres">${timbres.map((t) => { const it = INST().find((x) => x.inst === t); return `<button class="timbre ${t === inst ? 'sel' : ''}" data-t="${t}">${it.emoji}</button>`; }).join('')}</div>
    <div class="songs" id="songs">${SONGS.map((s, i) => `<button class="song" data-i="${i}">${s.e} ${s.es}</button>`).join('')}</div>
    <div class="song-bar hidden" id="songBar"><div class="song-prog"><b id="prog"></b></div></div>
    <div class="keys">${NOTES.map((n, i) => `<button class="key" data-i="${i}" style="--k:${n.c}"><span>${n.n}</span></button>`).join('')}</div>
    <button class="btn-big" id="ok">¡Listo! ✓</button></div>`, { title: '🎹 Piano mágico', back, cls: 'stage-bg' });
  const keys = $$('.key');
  const mark = () => { keys.forEach((k) => k.classList.toggle('next', !!song && +k.dataset.i === song.notes[pos])); if (song) $('#prog').style.width = (pos / song.notes.length) * 100 + '%'; };
  keys.forEach((k) => k.addEventListener('pointerdown', (e) => {
    e.preventDefault(); const i = +k.dataset.i;
    Synth.note(inst, NOTES[i].f, 0, 0.6);
    k.classList.remove('hit'); void k.offsetWidth; k.classList.add('hit');
    const [x, y] = center(k); burst(x, y - 60, ['🎵', '🎶'], 2);
    if (song && i === song.notes[pos]) {
      pos++;
      if (pos >= song.notes.length) {
        song = null; mark(); $('#songBar').classList.add('hidden'); $('#songs').classList.remove('hidden');
        Sfx.win(); confetti(40); S.done.pianoSong = 1;
        later(() => Voice.say([['es', MUSIC_TXT.songDone, 'force'], ['en', 'You did it!']]), 900);
      } else mark();
    }
  }));
  $$('.timbre').forEach((b) => tapify(b, () => {
    inst = b.dataset.t; $$('.timbre').forEach((x) => x.classList.toggle('sel', x === b));
    const it = INST().find((x) => x.inst === inst); Voice.say([['en', it.en], ['es', it.es]]);
  }));
  $$('.song').forEach((b) => tapify(b, async () => {
    const s = SONGS[b.dataset.i];
    $('#songs').classList.add('hidden'); $('#songBar').classList.remove('hidden');
    song = null; pos = 0;
    await Voice.say([['en', s.en], ['es', MUSIC_TXT.songGo, 'force']]);
    if (!alive(my)) return;
    // Lumi toca el comienzo para que lo escuche
    s.notes.slice(0, 7).forEach((n, i) => Synth.note(inst, NOTES[n].f, i * 0.42, 0.4));
    later(() => { song = s; pos = 0; mark(); }, 7 * 420 + 300);
  }));
  tapify($('#ok'), () => done(S.done.pianoSong ? 3 : 2));
  later(() => alive(my) && Voice.say([['es', MUSIC_TXT.piano, 'force'], ['es', MUSIC_TXT.songPick, 'force']]), 300);
}

/* ---------- Mi banda: tocar libre + repetir el ritmo ---------- */
function screenBand(done, back) {
  let rhythm = null, taps = 0;
  const my = render(`<div class="band"><div class="pads">${INST().map((it, i) => `<button class="pad pop-in" style="animation-delay:${i * 50}ms" data-i="${i}"><span>${it.emoji}</span><b>${it.en}</b></button>`).join('')}</div>
    <div class="row-btns"><button class="btn rhythm-btn" id="rhythm">🥁 Repite el ritmo</button></div>
    <button class="btn-big" id="ok">¡Listo! ✓</button></div>`, { title: '🥁 Mi banda', back, cls: 'stage-bg' });
  let lastSay = 0;
  $$('.pad').forEach((p) => p.addEventListener('pointerdown', (e) => {
    e.preventDefault(); const it = INST()[p.dataset.i];
    p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit');
    if (rhythm && it.inst === 'drum') { Synth.note('drum', 0); taps++; clearTimeout(rhythm.t); rhythm.t = later(checkRhythm, 1400); return; }
    const dur = Synth.demo(it.inst);
    if (Date.now() - lastSay > dur * 1000) { lastSay = Date.now(); later(() => Voice.say([['en', it.en]]), dur * 1000); }
    S.done.bandPlays = (S.done.bandPlays || 0) + 1;
  }));
  async function playRhythm() {
    const n = rand(2, 4); rhythm = { n }; taps = 0;
    await Voice.say([['es', MUSIC_TXT.rhythm, 'force']]);
    if (!alive(my)) return;
    for (let i = 0; i < n; i++) Synth.note('drum', 0, i * 0.5);
    const drum = $$('.pad').find((p) => INST()[p.dataset.i].inst === 'drum'); drum.classList.add('next');
  }
  function checkRhythm() {
    if (!rhythm) return;
    const ok = Math.abs(taps - rhythm.n) <= 1; // no tan estricto
    $$('.pad').forEach((p) => p.classList.remove('next')); rhythm = null;
    if (ok) { Sfx.good(); S.done.rhythm = 1; Voice.say([['es', MUSIC_TXT.rhythmOk, 'force'], ['en', 'Great job!']]); }
    else Voice.say([['en', 'Try again!'], ['es', '¡Intentémoslo otra vez!', 'force']]).then(() => alive(my) && playRhythm());
  }
  tapify($('#rhythm'), () => playRhythm());
  tapify($('#ok'), () => done(S.done.rhythm ? 3 : 2));
  later(() => alive(my) && Voice.say([['es', MUSIC_TXT.band, 'force'], ['en', 'Play the music!']]), 300);
}

/* ---------- ¿Qué suena? (escuchar y adivinar) ---------- */
function screenGuess(done, back) {
  const order = shuffle(INST()).slice(0, 5);
  let round = 0, mistakes = 0;
  const my = render(`<div class="counting"><button class="prompt" id="prompt">👂 Listen!</button><button class="big-ear pop-in" id="ear">🔊</button><div class="options" id="opts"></div></div>`, { title: '👂 ¿Qué suena?', back, cls: 'stage-bg' });
  async function play() {
    if (round >= order.length) return done(mistakes < 2 ? 3 : 2);
    const it = order[round];
    const opts = shuffle([it, ...shuffle(INST().filter((x) => x !== it)).slice(0, 2)]);
    $('#opts').innerHTML = opts.map((o, k) => `<button class="opt pop-in" data-k="${k}"><span class="vis lg"><span class="emo">${o.emoji}</span></span></button>`).join('');
    const listen = async () => { await Voice.say([['en', 'Listen! Which instrument is it?']]); if (alive(my)) Synth.demo(it.inst); };
    listen(); $('#ear').onclick = () => { Sfx.unlock(); Synth.demo(it.inst); }; $('#prompt').onclick = listen;
    let locked = false;
    $$('#opts .opt').forEach((b) => tapify(b, async () => {
      if (locked) return;
      const o = opts[b.dataset.k];
      if (o === it) {
        locked = true; b.classList.add('right'); Sfx.good(); burstEl(b, ['🎵', '⭐'], 8);
        await Voice.say([['en', `Yes! ${it.en}!`], ['es', it.es]]);
        if (alive(my)) { round++; later(play, 300); }
      } else { mistakes++; b.classList.add('shake'); later(() => b.classList.remove('shake'), 500); Synth.demo(o.inst); later(() => Voice.say([['en', `That's ${o.en}. Try again!`]]), 1400); }
    }));
  }
  later(() => alive(my) && sayEs(MUSIC_TXT.guess).then((ok) => ok && alive(my) && play()), 300);
}
