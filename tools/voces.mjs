// Genera todas las voces de la app con ElevenLabs (se corre UNA vez en el Mac).
// Uso:  node tools/voces.mjs --lista     (solo cuenta frases, no gasta nada)
//       node tools/voces.mjs             (genera los MP3 que falten)
// La clave se lee de .env (ELEVENLABS_API_KEY=...) y NUNCA se sube a internet.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'audio');
const env = Object.fromEntries((fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8') : '')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]));
const KEY = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
const NAME = env.NOMBRE || 'Martina', PET = env.MASCOTA || 'Coco';
const ONLY_LIST = process.argv.includes('--lista');
// Para la versión gratis (voces de Microsoft): node tools/voces.mjs --json  y luego  python3 tools/voces_gratis.py

/* ---------- 1. Cargar el contenido de la app ---------- */
const ctx = vm.createContext({});
const D = vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + '\n;({TOPICS,DIALOGS,PET_TYPES,FOODS,WARDROBE,EMOTIONS,RECIPES,PRAISE_EN,PRAISE_ES})', ctx);
const { TOPICS, DIALOGS, PET_TYPES, FOODS, WARDROBE, EMOTIONS, RECIPES, PRAISE_EN, PRAISE_ES } = D;
const fill = (s) => String(s || '').replace(/\{name\}/g, NAME).replace(/\{pet\}/g, PET);

/* ---------- 2. Todas las frases (igual que en el código) ---------- */
const P = new Map(); // key -> {lang, text}
const add = (lang, text) => { if (!text) return; const t = fill(text); P.set(`${lang}|${t}`, { lang, text: t }); };
const en = (t) => add('en', t), es = (t) => add('es', t), kid = (t) => add('kid', t);
const low = (s) => s.toLowerCase();

// Inicio, menús, premios
["Hi {name}! I'm Lumi!", "Let's play!", 'You are my best friend!', 'Hee hee! That tickles!', "Hello, {name}! Let's play!", "Let's go!", "Let's learn English!", "Let's play a game!", "Let's cook!", "Let's talk!", 'Hello! I am Lumi.'].forEach(en);
['¡Hola! Soy Lumi.', '¡Juguemos!', '¡Eres mi mejor amiga!', '¡Me haces cosquillas!', '¡Hola, {name}! ¿Qué quieres hacer hoy?', '¡Primero termina la misión que salta!', '¡Completaste la aventura! ¡Vamos otra vez!',
  '¡Sigue el camino, {name}! Toca la misión que salta.', '¿Qué quieres aprender en inglés?', '¿A qué jugamos?', '¿Qué cocinamos hoy?', '¿De qué quieres conversar conmigo?',
  '¡Mira todos tus stickers! Completa misiones para ganar más.', 'Juega y completa misiones para ganar stickers.'].forEach(es);
PRAISE_EN.forEach(en); PRAISE_ES.forEach(es);

// Mascota
Object.values(PET_TYPES).forEach((t) => { en(t.en); es(t.es); });
['Choose your pet!', 'Hee hee!', 'I love you, {name}!', 'That tickles!', 'Hello, {name}!', "I'm hungry!", "I'm dirty! Bath time!", "I'm sleepy...", "Hi {name}! Let's play!",
  'Scrub, scrub, scrub!', 'Now rinse!', 'So clean! Thank you, {name}!', 'Bath time!', 'Brush, brush, brush your teeth!', 'Sparkling clean teeth!', "Let's brush our teeth!",
  "I'm full! Thank you, {name}!", 'I look great!', 'Dress up time!', 'How does {pet} feel?', "Hmm, look at {pet}'s face!", 'How do you feel?',
  'Good night, {pet}! Sweet dreams!', 'Good morning, {name}!', 'Time for bed!', 'Delicious! Thank you, {name}!'].forEach(en);
['¡Elige tu mascota y su color!', '¡Tengo hambre! Dame comida.', '¡Estoy sucio! ¿Me bañas?', 'Tengo sueño...', '¡Hola {name}! ¡Juguemos!', '¡Ahora enjuaga con la ducha!',
  '¡{pet} quedó brillante! Bañarse nos mantiene sanos.', '¡Oh! {pet} está sucio. ¡Vamos a bañarlo! Arrastra la esponja.',
  '¡Dientes súper limpios! Hay que lavarse los dientes después de comer y antes de dormir.', '¡Oh no! Los dientes de {pet} tienen bichitos. ¡Ayúdame a cepillarlos!',
  'Los dulces, solo un poquito. ¡Así cuidamos los dientes!', '¡Estoy lleno! ¡Gracias! Las frutas y verduras nos hacen crecer fuertes.', '{pet} tiene hambre. Arrastra la comida a su boca.',
  '¡Me veo genial!', '¡Vamos a vestir a {pet}! Elige ropa y accesorios.', 'Escucha la historia y adivina cómo se siente.', 'Toca una carita para ver cómo se siente {pet}.',
  '¡Buenas noches! ¡Dulces sueños! Dormir nos da energía.', '¡Ya es de día! Toca el sol para despertar a {pet}.', '¡Buenos días! ¡Tengo mucha energía!', '{pet} tiene sueño. Apaga la luz.',
  '¡Delicioso! ¡Gracias, {name}!'].forEach(es);
FOODS.forEach((f) => { if (f.ok) { en(`Yummy! ${f.en}!`); es(f.es); } else en(`${f.en}! Mmm, just a little bit.`); });
Object.values(WARDROBE).forEach((w) => { es(w.es); w.items.forEach((it) => { en(`${it.en}!`); es(it.es); if (it.cost) es(`Necesitas ${it.cost} estrellas para esto. ¡Sigue jugando para ganar más!`); }); });
EMOTIONS.forEach((e) => { en(`${e.en}! I feel ${low(e.en)}.`); es(`${PET} se siente ${e.es}.`); es(e.tip); en(e.story.en); es(e.story.es); en(`Yes! ${e.en}!`); es(e.es); });
Object.values(RECIPES).forEach((R) => {
  R.ings.forEach((g) => { en(g.en); es(g.es); });
  en(R.act.en); es(R.act.es); en(`Yummy! ${R.en}!`); es(`¡Qué rico! ¡Hiciste ${R.es}!`);
  es(`¡Vamos a preparar ${R.es}! Arrastra los ingredientes.`); en(`Let's make ${low(R.en)}!`);
});

// Lecciones
Object.values(TOPICS).forEach((T) => {
  es(T.intro); en(T.en);
  T.items.forEach((it) => {
    en(it.en); es(it.es); en(it.sound); en(`Say: ${it.en}!`); en(`Perfect! ${it.en}!`); en(`Good try! ${it.en}!`); es(`Toca el micrófono y di: ${it.en}`);
    en(T.q.replace('{w}', it.en)); en(`Yes! ${it.en}!`); en(`That's ${it.en}. Try again!`); es(`Busca: ${it.es}`); en(`${it.en}!`);
  });
});
es('¡Ahora juguemos! Escucha y toca el correcto.'); es('¡Perfecto!'); es('¡Buen intento!');

// Conversaciones (la "niña" responde con voz más aguda)
Object.values(DIALOGS).forEach((Dg) => Dg.steps.forEach((s) => { en(s.en); es(s.es); s.options.forEach((o) => { kid(o.label); en(o.reply.en); es(o.reply.es); }); }));
en('Good try! Tap a picture too!'); es('¡Buen intento! Ahora toca un dibujo.'); es('No te escuché. Toca un dibujo o intenta otra vez.');

// Juegos
['Find the pairs!', 'Great job!', 'Oops! Try again!', 'Find the shadow!', "How many? Let's count!", 'Try again! Count with me.', 'Rainbow!', "Let's draw!"].forEach(en);
['Encuentra las parejas iguales.', 'Arrastra cada animal a su sombra.', '¿Cuántos hay? ¡Toca cada uno para contar!', '¡Dibuja algo primero!', '¡Dibuja lo que quieras! Elige un color.'].forEach(es);
TOPICS.colors.items.forEach((c) => { en(`Pop the ${low(c.en)} bubbles!`); es(`¡Revienta las burbujas de color ${c.es}!`); en(`That's ${low(c.en)}!`); });

const all = [...P.entries()];
const chars = all.reduce((n, [, p]) => n + p.text.length, 0);
console.log(`Frases: ${all.length}  ·  Caracteres: ${chars}  (en: ${all.filter(([, p]) => p.lang !== 'es').length}, es: ${all.filter(([, p]) => p.lang === 'es').length})`);
if (ONLY_LIST) process.exit(0);
if (process.argv.includes('--json')) { fs.writeFileSync(path.join(ROOT, 'tools/frases.json'), JSON.stringify(all.map(([k, p]) => ({ key: k, lang: p.lang, text: p.text })), null, 1)); console.log('tools/frases.json escrito'); process.exit(0); }

/* ---------- 3. ElevenLabs ---------- */
if (!KEY) { console.error('Falta ELEVENLABS_API_KEY en el archivo .env'); process.exit(1); }
const API = 'https://api.elevenlabs.io';
const H = { 'xi-api-key': KEY };
async function api(p, opt = {}) {
  const r = await fetch(API + p, { ...opt, headers: { ...H, ...(opt.headers || {}) } });
  if (!r.ok) { const t = await r.text(); const e = new Error(`${r.status} ${t.slice(0, 300)}`); e.status = r.status; e.body = t; throw e; }
  return r;
}

async function pickVoice(kind) {
  const envKey = kind === 'es' ? 'VOZ_ESPANOL' : 'VOZ_INGLES';
  if (env[envKey]) return { voice_id: env[envKey], name: env[envKey] };
  // Buscar en la biblioteca de voces: español latino / inglés americano, mujer, cálida
  const q = kind === 'es'
    ? '/v1/shared-voices?page_size=30&language=es&gender=female&sort=usage_character_count_1y&use_cases=conversational'
    : '/v1/shared-voices?page_size=30&language=en&accent=american&gender=female&age=young&sort=usage_character_count_1y';
  try {
    const { voices = [] } = await (await api(q)).json();
    const latin = /latin|mexic|colomb|chile|argent|venez|peru/i;
    const good = voices.filter((v) => kind !== 'es' || latin.test(`${v.accent} ${v.locale} ${v.description} ${v.name}`));
    for (const v of (good.length ? good : voices)) {
      try {
        await api(`/v1/voices/add/${v.public_owner_id}/${v.voice_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_name: `Lumi ${kind} - ${v.name}`.slice(0, 50) }) });
        return { voice_id: v.voice_id, name: `${v.name} (${v.accent || v.locale || ''})` };
      } catch (e) { if (/already/i.test(e.body || '')) return { voice_id: v.voice_id, name: v.name }; }
    }
  } catch (e) { console.warn('No pude usar la biblioteca de voces:', e.message); }
  // Voces incluidas en todas las cuentas
  return kind === 'es' ? { voice_id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (incluida)' } : { voice_id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (incluida)' };
}

const manifestPath = path.join(OUT, 'index.js');
const old = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^[^{]*/, '').replace(/;\s*$/, '')) : {};
fs.mkdirSync(OUT, { recursive: true });

let sub = {};
try { sub = await (await api('/v1/user/subscription')).json(); } catch (e) { console.error('La clave no funciona:', e.message); process.exit(1); }
const left = (sub.character_limit || 0) - (sub.character_count || 0);
const rare = (t) => /^(Say:|Perfect!|Good try!|Toca el micrófono)/.test(t) ? 1 : 0; // frases del micrófono al final
const todo = all.filter(([k, p]) => { const f = old[k]; return !(f && fs.existsSync(path.join(OUT, f))); }).sort((a, b) => rare(a[1].text) - rare(b[1].text));
const need = todo.reduce((n, [, p]) => n + p.text.length, 0);
const MODEL = env.MODELO || (left >= need * 1.05 ? 'eleven_multilingual_v2' : 'eleven_flash_v2_5');
console.log(`Plan: ${sub.tier} · créditos disponibles: ${left} · faltan ${todo.length} frases (${need} caracteres) · modelo: ${MODEL}`);

const vEn = await pickVoice('en'), vEs = await pickVoice('es');
console.log(`Voz inglés: ${vEn.name}\nVoz español: ${vEs.name}`);

const manifest = { ...old };
const save = () => fs.writeFileSync(manifestPath, 'window.AUDIO=' + JSON.stringify(manifest) + ';\n');
let done = 0, fail = 0;
for (const [k, p] of todo) {
  const v = p.lang === 'es' ? vEs : vEn;
  const body = { text: p.text, model_id: MODEL, voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true } };
  if (MODEL.includes('2_5')) body.language_code = p.lang === 'es' ? 'es' : 'en';
  if (p.lang !== 'es' && p.text.split(' ').length === 1) body.text = p.text.replace(/[!.]*$/, '!'); // palabras sueltas suenan mejor con energía
  const file = crypto.createHash('md5').update(`${k}|${v.voice_id}|${MODEL}`).digest('hex').slice(0, 12) + '.mp3';
  try {
    const r = await api(`/v1/text-to-speech/${v.voice_id}?output_format=mp3_44100_64`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    fs.writeFileSync(path.join(OUT, file), Buffer.from(await r.arrayBuffer()));
    manifest[k] = file; done++;
    if (done % 20 === 0) { save(); console.log(`  ${done}/${todo.length}...`); }
  } catch (e) {
    fail++; console.warn(`  ✗ "${p.text}": ${e.message.slice(0, 120)}`);
    if (e.status === 401 || /quota|credits|limit/i.test(e.body || '')) { console.warn('Se acabaron los créditos. Lo que falta usará la voz del iPhone; vuelve a correr el script el próximo mes.'); break; }
  }
}
save();
console.log(`Listo: ${done} audios nuevos, ${fail} con error. Total en la app: ${Object.keys(manifest).length}/${all.length}.`);
