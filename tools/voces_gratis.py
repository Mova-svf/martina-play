"""Genera las voces de la app GRATIS con las voces neuronales de Microsoft (edge-tts).
Uso (en el Mac, una vez):
    python3 -m pip install edge-tts
    node tools/voces.mjs --json
    python3 tools/voces_gratis.py
Solo genera las frases que falten, así que se puede volver a correr cuando se agreguen frases.
"""
import asyncio, hashlib, json, os, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio')
VOICES = {
    'es':  {'voice': os.environ.get('VOZ_ESPANOL', 'es-MX-DaliaNeural'), 'rate': '+0%',  'pitch': '+6Hz'},   # Lumi, mexicana
    'en':  {'voice': os.environ.get('VOZ_INGLES', 'en-US-EmmaNeural'),      'rate': '-12%', 'pitch': '+0Hz'},   # inglés claro y lento
    'kid': {'voice': os.environ.get('VOZ_NINA', 'en-US-AnaNeural'),         'rate': '-5%',  'pitch': '+0Hz'},   # respuestas de la niña
}

def fname(p):
    v = VOICES[p['lang']]
    h = hashlib.md5(f"{p['key']}|{v['voice']}|{v['rate']}|{v['pitch']}".encode()).hexdigest()[:12]
    return h + '.mp3'

async def one(p, sem, manifest, stats):
    f = fname(p)
    path = os.path.join(OUT, f)
    if os.path.exists(path) and os.path.getsize(path) > 500:
        manifest[p['key']] = f
        return
    v = VOICES[p['lang']]
    text = p['text']
    if p['lang'] != 'es' and len(text.split()) == 1 and not text.endswith(('!', '?', '.')):
        text += '!'
    async with sem:
        for intento in range(3):
            try:
                await edge_tts.Communicate(text, v['voice'], rate=v['rate'], pitch=v['pitch']).save(path)
                if os.path.getsize(path) > 500:
                    manifest[p['key']] = f
                    stats['ok'] += 1
                    if stats['ok'] % 100 == 0:
                        print(f"  {stats['ok']} audios...", flush=True)
                    return
            except Exception as e:
                err = e
                await asyncio.sleep(1.5 * (intento + 1))
        stats['fail'] += 1
        print(f"  x {p['text']!r}: {err}", flush=True)

async def main():
    frases = json.load(open(os.path.join(ROOT, 'tools/frases.json'), encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    manifest, stats = {}, {'ok': 0, 'fail': 0}
    sem = asyncio.Semaphore(6)
    await asyncio.gather(*(one(p, sem, manifest, stats) for p in frases))
    usados = set(manifest.values())
    for f in os.listdir(OUT):  # borra audios viejos que ya no se usan
        if f.endswith('.mp3') and f not in usados:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, 'index.js'), 'w', encoding='utf-8') as fh:
        fh.write('window.AUDIO=' + json.dumps(manifest, ensure_ascii=False) + ';\n')
    print(f"Listo: {stats['ok']} nuevos, {stats['fail']} con error, {len(manifest)}/{len(frases)} en la app.")

if __name__ == '__main__':
    asyncio.run(main())
