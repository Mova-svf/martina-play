# Martina Play & Learn 🦄

App web tipo juego para aprender inglés, cuidar una mascota y crear. Sin pagos, sin anuncios, sin cuentas.
Funciona en Safari del iPhone y se puede dejar como "app" en la pantalla de inicio.

## Qué tiene
- **🎙️ Audios con Lumi**: como en WhatsApp, mantiene apretado el micrófono y le manda audios a Lumi. Lumi lleva la conversación: propone temas (su día, animales, familia, amigas, emociones, imaginar, comida, juguetes), le hace preguntas, comenta sus respuestas, le cuenta adivinanzas y le pregunta palabras en inglés. Puede ir a otras partes de la app hablando ("quiero bañar a Coco", "juguemos a las burbujas"). Si propone algo nuevo ("quiero un juego de dinosaurios"), la idea queda guardada con su audio en la Zona de padres, y opcionalmente llega como aviso al celular con la app gratis **ntfy**.
- **🤝 Amigos**: 12 situaciones del colegio (le quitan un juguete, pierde un juego y siente rabia, una amiga llora...). Lumi lee las opciones, explica con cariño por qué una opción no está bien y deja intentar otra vez. Enseña la regla 🛑 Paro · 🌬️ Respiro · 🗣️ Hablo y frases en inglés (Please, Sorry, Share...). Incluye el **Rincón de la calma**, donde respira inflando un globo.
- **🗺️ Aventura**: un camino de 30 misiones en el que se van alternando lección, mascota, conversación y juego.
- **🔤 Inglés**: 7 temas (colores, animales, números, comida, cuerpo, figuras y naturaleza). Primero aprende cada palabra (en inglés, después en español y de nuevo en inglés) y luego viene un quiz.
- **💬 Hablar con Lumi**: 8 conversaciones guiadas (saludar, edad, colores, animales, comida, emociones, clima y familia). Se responde tocando dibujos o con el micrófono.
- **🐶 Mi mascota**: bañarla, lavarle los dientes, darle de comer (con frutas sanas y "solo un poquito" de dulces), vestirla, ver sus emociones y ponerla a dormir.
- **🍳 Cocina**: pizza, ensalada, batido, sándwich y torta. Se arrastran los ingredientes, se cocina y se le da a la mascota.
- **🎮 Juegos**: memoria, burbujas de colores, sombras, contar y dibujar.
- **📒 Stickers y ⭐ estrellas**: los premios desbloquean ropa para la mascota.
- **⚙️ Zona de padres** (mantener presionado el engranaje 3 segundos): nombre de la niña y de la mascota, traducción al español, inglés más lento y reinicio del progreso.

## Probar en el Mac
```bash
cd "/Users/juansegurar/APP interactiva para Martina" && python3 -m http.server 8765
```
Abrir http://localhost:8765

## Ponerla en el iPhone
El iPhone necesita una dirección web (https). La opción más fácil y gratis:
1. Entrar a https://app.netlify.com/drop y arrastrar esta carpeta completa.
2. Abrir el link que entrega en **Safari** del iPhone.
3. Tocar Compartir ⬆️ → **Agregar a pantalla de inicio**.

Después de la primera visita también funciona sin internet.

## Voces
Todas las frases están grabadas con voces neuronales gratis de Microsoft: **Lumi habla con acento mexicano** (Dalia), el inglés usa a Emma y la niña que responde en las conversaciones es Ana. Si alguna frase no tiene audio, la app usa la voz del iPhone.
Para volver a generarlas (por ejemplo, después de agregar frases en `js/data.js`):
```bash
python3 -m pip install edge-tts && node tools/voces.mjs --json && python3 tools/voces_gratis.py
```
Para cambiar de voz: `VOZ_ESPANOL=es-CL-CatalinaNeural python3 tools/voces_gratis.py`
(`tools/voces.mjs` también puede usar ElevenLabs si algún día tienes una clave).

## Consejos
- Quitar el **modo silencio** del iPhone para que se escuchen los sonidos.
- La primera vez que use los audios, Safari pide permiso para el micrófono y para el reconocimiento de voz: hay que tocar **Permitir**.
- Los temas y preguntas de Lumi están en `THREADS`; lo que entiende y responde, en `TALK`, `BRAIN` y `NAV` al final de `js/data.js`.
- Para agregar palabras, diálogos o recetas se edita `js/data.js`.
