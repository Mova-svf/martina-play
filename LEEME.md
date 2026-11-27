# Martina Play & Learn 🦄

App web tipo juego para aprender inglés, cuidar una mascota y crear. Sin pagos, sin anuncios, sin cuentas.
Funciona en Safari del iPhone y se puede dejar como "app" en la pantalla de inicio.

## Qué tiene
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

## Consejos
- Quitar el **modo silencio** del iPhone para que se escuchen los sonidos.
- Para voces más naturales: Ajustes › Accesibilidad › Contenido leído › Voces, y descargar en versión "Mejorada" a **Samantha** (inglés) y **Paulina** (español).
- Para agregar palabras, diálogos o recetas se edita `js/data.js`.
