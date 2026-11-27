'use strict';
/* ============ CONTENIDO DE LA APP ============
   Aquí se puede agregar o cambiar palabras, diálogos y recetas fácilmente. */

const TOPICS = {
  colors: {
    icon: '🎨', es: 'Colores', en: 'Colors', color: '#FF6FAE', q: 'Find the color {w}!',
    intro: '¡Vamos a aprender los colores en inglés!',
    items: [
      { en: 'Red', es: 'rojo', color: '#EF4444' },
      { en: 'Blue', es: 'azul', color: '#3B82F6' },
      { en: 'Yellow', es: 'amarillo', color: '#FACC15' },
      { en: 'Green', es: 'verde', color: '#22C55E' },
      { en: 'Orange', es: 'naranjo', color: '#FB923C' },
      { en: 'Purple', es: 'morado', color: '#A855F7' },
      { en: 'Pink', es: 'rosado', color: '#F472B6' },
      { en: 'Brown', es: 'café', color: '#92400E' },
      { en: 'Black', es: 'negro', color: '#1F1F1F' },
      { en: 'White', es: 'blanco', color: '#FFFFFF' },
    ],
  },
  animals: {
    icon: '🦁', es: 'Animales', en: 'Animals', color: '#FF9F43', q: 'Where is the {w}?',
    intro: '¡Vamos a conocer a los animales en inglés!',
    items: [
      { en: 'Dog', es: 'perro', emoji: '🐶', sound: 'The dog says woof woof!' },
      { en: 'Cat', es: 'gato', emoji: '🐱', sound: 'The cat says meow!' },
      { en: 'Cow', es: 'vaca', emoji: '🐮', sound: 'The cow says moo!' },
      { en: 'Duck', es: 'pato', emoji: '🦆', sound: 'The duck says quack quack!' },
      { en: 'Pig', es: 'cerdito', emoji: '🐷', sound: 'The pig says oink oink!' },
      { en: 'Lion', es: 'león', emoji: '🦁', sound: 'The lion says roar!' },
      { en: 'Elephant', es: 'elefante', emoji: '🐘', sound: 'The elephant is very big!' },
      { en: 'Monkey', es: 'mono', emoji: '🐵', sound: 'The monkey says oo oo ah ah!' },
      { en: 'Fish', es: 'pez', emoji: '🐟', sound: 'The fish swims, swim swim!' },
      { en: 'Bird', es: 'pájaro', emoji: '🐦', sound: 'The bird says tweet tweet!' },
      { en: 'Horse', es: 'caballo', emoji: '🐴', sound: 'The horse says neigh!' },
      { en: 'Frog', es: 'rana', emoji: '🐸', sound: 'The frog says ribbit!' },
    ],
  },
  numbers: {
    icon: '🔢', es: 'Números', en: 'Numbers', color: '#4FC3F7', q: 'Find number {w}!',
    intro: '¡Vamos a contar en inglés!',
    items: [
      { en: 'One', es: 'uno', num: 1 }, { en: 'Two', es: 'dos', num: 2 },
      { en: 'Three', es: 'tres', num: 3 }, { en: 'Four', es: 'cuatro', num: 4 },
      { en: 'Five', es: 'cinco', num: 5 }, { en: 'Six', es: 'seis', num: 6 },
      { en: 'Seven', es: 'siete', num: 7 }, { en: 'Eight', es: 'ocho', num: 8 },
      { en: 'Nine', es: 'nueve', num: 9 }, { en: 'Ten', es: 'diez', num: 10 },
    ],
  },
  food: {
    icon: '🍎', es: 'Comida', en: 'Food', color: '#3DDC84', q: 'Where is the {w}?',
    intro: '¡Vamos a aprender las comidas en inglés!',
    items: [
      { en: 'Apple', es: 'manzana', emoji: '🍎' }, { en: 'Banana', es: 'plátano', emoji: '🍌' },
      { en: 'Orange', es: 'naranja', emoji: '🍊' }, { en: 'Grapes', es: 'uvas', emoji: '🍇' },
      { en: 'Strawberry', es: 'frutilla', emoji: '🍓' }, { en: 'Watermelon', es: 'sandía', emoji: '🍉' },
      { en: 'Carrot', es: 'zanahoria', emoji: '🥕' }, { en: 'Bread', es: 'pan', emoji: '🍞' },
      { en: 'Milk', es: 'leche', emoji: '🥛' }, { en: 'Egg', es: 'huevo', emoji: '🥚' },
      { en: 'Cheese', es: 'queso', emoji: '🧀' },
    ],
  },
  body: {
    icon: '👀', es: 'Mi cuerpo', en: 'My body', color: '#A78BFA', q: 'Show me the {w}!',
    intro: '¡Vamos a aprender las partes del cuerpo en inglés!',
    items: [
      { en: 'Eyes', es: 'ojos', emoji: '👀' }, { en: 'Nose', es: 'nariz', emoji: '👃' },
      { en: 'Mouth', es: 'boca', emoji: '👄' }, { en: 'Ear', es: 'oreja', emoji: '👂' },
      { en: 'Hand', es: 'mano', emoji: '✋' }, { en: 'Foot', es: 'pie', emoji: '🦶' },
      { en: 'Teeth', es: 'dientes', emoji: '🦷' }, { en: 'Hair', es: 'pelo', emoji: '💇‍♀️' },
    ],
  },
  shapes: {
    icon: '⭐', es: 'Figuras', en: 'Shapes', color: '#FFC83D', q: 'Find the {w}!',
    intro: '¡Vamos a aprender las figuras en inglés!',
    items: [
      { en: 'Circle', es: 'círculo', shape: 'circle', fill: '#EF4444' },
      { en: 'Square', es: 'cuadrado', shape: 'square', fill: '#3B82F6' },
      { en: 'Triangle', es: 'triángulo', shape: 'triangle', fill: '#22C55E' },
      { en: 'Star', es: 'estrella', shape: 'star', fill: '#FACC15' },
      { en: 'Heart', es: 'corazón', shape: 'heart', fill: '#F472B6' },
      { en: 'Diamond', es: 'rombo', shape: 'diamond', fill: '#A855F7' },
    ],
  },
  nature: {
    icon: '🌈', es: 'Naturaleza', en: 'Nature', color: '#22C55E', q: 'Where is the {w}?',
    intro: '¡Vamos a aprender cosas de la naturaleza en inglés!',
    items: [
      { en: 'Sun', es: 'sol', emoji: '☀️' }, { en: 'Moon', es: 'luna', emoji: '🌙' },
      { en: 'Cloud', es: 'nube', emoji: '☁️' }, { en: 'Rain', es: 'lluvia', emoji: '🌧️' },
      { en: 'Rainbow', es: 'arcoíris', emoji: '🌈' }, { en: 'Flower', es: 'flor', emoji: '🌸' },
      { en: 'Tree', es: 'árbol', emoji: '🌳' }, { en: 'Snow', es: 'nieve', emoji: '❄️' },
    ],
  },
};

const C = (en) => TOPICS.colors.items.find((c) => c.en === en);

/* ---------- Conversaciones con Lumi ---------- */
const DIALOGS = {
  hello: {
    icon: '👋', es: 'Saludar', en: 'Hello!',
    steps: [
      { en: "Hello! I'm Lumi. What's your name?", es: '¡Hola! Soy Lumi. ¿Cómo te llamas?',
        options: [{ emoji: '👧', label: 'My name is {name}!', reply: { en: 'Nice to meet you, {name}!', es: '¡Qué lindo conocerte, {name}!' } }] },
      { en: 'How are you today?', es: '¿Cómo estás hoy?',
        options: [
          { emoji: '😀', label: 'Great!', reply: { en: "Great! I'm happy too!", es: '¡Súper! ¡Yo también estoy feliz!' } },
          { emoji: '🙂', label: 'Good!', reply: { en: "Good! That's nice.", es: '¡Bien! Qué bueno.' } },
          { emoji: '😴', label: 'Tired', reply: { en: "Tired? Let's play slowly.", es: '¿Cansada? Juguemos tranquilitas.' } },
        ] },
      { en: 'Can you say hello? Hello!', es: '¿Puedes decir hola en inglés? Se dice: Hello!',
        options: [{ emoji: '👋', label: 'Hello!', reply: { en: 'Hello! Very good!', es: '¡Muy bien!' } }] },
      { en: 'Goodbye! See you soon!', es: '¡Chao! ¡Nos vemos pronto!',
        options: [{ emoji: '👋', label: 'Bye bye!', reply: { en: 'Bye bye, {name}!', es: '' } }] },
    ],
  },
  age: {
    icon: '🎂', es: 'Mi edad', en: 'How old?',
    steps: [
      { en: 'How old are you, {name}?', es: '¿Cuántos años tienes, {name}?',
        options: [
          { emoji: '3️⃣', label: "I'm three!", reply: { en: 'Three years old! Wow!', es: '¡Tres años! ¡Guau!' } },
          { emoji: '4️⃣', label: "I'm four!", reply: { en: 'Four years old! You are so big!', es: '¡Cuatro años! ¡Qué grande!' } },
          { emoji: '5️⃣', label: "I'm five!", reply: { en: 'Five years old! Hooray!', es: '¡Cinco años! ¡Bravo!' } },
        ] },
      { en: "Let's count to five! One, two, three, four, five!", es: '¡Contemos hasta cinco en inglés!',
        options: [{ emoji: '🖐️', label: 'One, two, three, four, five!', reply: { en: 'Great counting!', es: '¡Muy bien contado!' } }] },
      { en: 'When is your birthday? Happy birthday!', es: 'En tu cumpleaños decimos: Happy birthday!',
        options: [{ emoji: '🎉', label: 'Happy birthday!', reply: { en: 'Yay! Happy birthday to you!', es: '¡Feliz cumpleaños!' } }] },
    ],
  },
  color: {
    icon: '🎨', es: 'Colores', en: 'Colors',
    steps: [
      { en: "What's your favorite color?", es: '¿Cuál es tu color favorito?',
        options: ['Pink', 'Purple', 'Blue', 'Red', 'Yellow', 'Green'].map((n) => ({
          color: C(n).color, label: n, reply: { en: `${n}! I love ${n.toLowerCase()} too!`, es: `¡El ${C(n).es}! ¡A mí también me encanta!` } })) },
      { en: 'What color is the sky?', es: '¿De qué color es el cielo?',
        options: [
          { color: C('Blue').color, label: 'Blue', reply: { en: 'Yes! The sky is blue!', es: '¡Sí! El cielo es azul.' } },
          { color: C('Red').color, label: 'Red', reply: { en: 'Hmm, no. The sky is blue!', es: 'Mmm, no. El cielo es azul.' } },
          { color: C('Green').color, label: 'Green', reply: { en: 'Hmm, no. The sky is blue!', es: 'Mmm, no. El cielo es azul.' } },
        ] },
      { en: 'What color is a banana?', es: '¿De qué color es un plátano?',
        options: [
          { color: C('Purple').color, label: 'Purple', reply: { en: 'Silly! The banana is yellow!', es: '¡Jaja! El plátano es amarillo.' } },
          { color: C('Yellow').color, label: 'Yellow', reply: { en: 'Yes! The banana is yellow!', es: '¡Sí! El plátano es amarillo.' } },
          { color: C('Blue').color, label: 'Blue', reply: { en: 'Silly! The banana is yellow!', es: '¡Jaja! El plátano es amarillo.' } },
        ] },
    ],
  },
  animal: {
    icon: '🐾', es: 'Animales', en: 'Animals',
    steps: [
      { en: 'What animal do you like?', es: '¿Qué animal te gusta?',
        options: ['Dog', 'Cat', 'Lion', 'Duck', 'Pig', 'Horse'].map((n) => {
          const a = TOPICS.animals.items.find((x) => x.en === n);
          return { emoji: a.emoji, label: `The ${n.toLowerCase()}!`, reply: { en: a.sound, es: `¡El ${a.es}! ¡Qué lindo!` } };
        }) },
      { en: 'Can you roar like a lion? Roar!', es: '¿Puedes rugir como un león?',
        options: [{ emoji: '🦁', label: 'Roar!', reply: { en: 'Wow! So strong!', es: '¡Guau, qué fuerte!' } }] },
      { en: 'Which animal says moo?', es: '¿Qué animal dice mu?',
        options: [
          { emoji: '🐮', label: 'The cow!', reply: { en: 'Yes! The cow says moo!', es: '¡Sí! La vaca dice mu.' } },
          { emoji: '🦆', label: 'The duck!', reply: { en: 'No, the duck says quack! The cow says moo!', es: 'El pato dice cuac. ¡La vaca dice mu!' } },
          { emoji: '🐱', label: 'The cat!', reply: { en: 'No, the cat says meow! The cow says moo!', es: 'El gato dice miau. ¡La vaca dice mu!' } },
        ] },
    ],
  },
  food: {
    icon: '🍓', es: 'Comida', en: 'Food',
    steps: [
      { en: 'Are you hungry?', es: '¿Tienes hambre?',
        options: [
          { emoji: '👍', label: 'Yes!', reply: { en: "Yes? Let's eat something yummy!", es: '¡Vamos a comer algo rico!' } },
          { emoji: '👎', label: 'No.', reply: { en: 'No? Okay, maybe later!', es: 'Bueno, ¡quizás más tarde!' } },
        ] },
      { en: 'What do you want to eat?', es: '¿Qué quieres comer?',
        options: [
          { emoji: '🍎', label: 'An apple!', reply: { en: 'An apple! Yummy and healthy!', es: '¡Una manzana! ¡Rica y sana!' } },
          { emoji: '🍌', label: 'A banana!', reply: { en: 'A banana! Monkeys love bananas!', es: '¡Un plátano! ¡A los monos les encanta!' } },
          { emoji: '🍕', label: 'Pizza!', reply: { en: 'Pizza! Yummy yummy!', es: '¡Pizza! ¡Ñam ñam!' } },
          { emoji: '🍓', label: 'Strawberries!', reply: { en: 'Strawberries! Red and sweet!', es: '¡Frutillas! ¡Rojas y dulces!' } },
        ] },
      { en: 'Fruits make us strong! Say: Yummy!', es: '¡Las frutas nos hacen fuertes! Di: Yummy!',
        options: [{ emoji: '😋', label: 'Yummy!', reply: { en: 'Yummy yummy!', es: '¡Ñam ñam!' } }] },
    ],
  },
  feelings: {
    icon: '💖', es: 'Emociones', en: 'Feelings',
    steps: [
      { en: 'How do you feel today?', es: '¿Cómo te sientes hoy?',
        options: [
          { emoji: '😀', label: "I'm happy!", reply: { en: 'Yay! You are happy!', es: '¡Bien! ¡Estás feliz!' } },
          { emoji: '😢', label: "I'm sad.", reply: { en: 'Oh, you feel sad. A big hug for you!', es: 'Oh, estás triste. ¡Te mando un abrazo grande! Puedes contarle a mamá o papá.' } },
          { emoji: '😠', label: "I'm angry!", reply: { en: "You feel angry. Let's breathe together.", es: 'Estás enojada. Respiremos juntas, despacito.' } },
          { emoji: '😴', label: "I'm tired.", reply: { en: 'You are tired. Rest is good!', es: 'Estás cansada. ¡Descansar es bueno!' } },
        ] },
      { en: "Let's breathe. Breathe in... and out...", es: 'Respiremos: toma aire por la nariz... y bótalo despacio.',
        options: [{ emoji: '🌬️', label: 'In... and out...', reply: { en: 'Very good! So calm.', es: '¡Muy bien! Qué tranquilidad.' } }] },
      { en: 'Can you give me a hug?', es: '¿Me das un abrazo?',
        options: [{ emoji: '🤗', label: 'A big hug!', reply: { en: 'Thank you! I feel happy now!', es: '¡Gracias! ¡Ahora me siento feliz!' } }] },
    ],
  },
  weather: {
    icon: '☀️', es: 'El clima', en: 'Weather',
    steps: [
      { en: 'Look outside! How is the weather?', es: '¡Mira por la ventana! ¿Cómo está el clima?',
        options: [
          { emoji: '☀️', label: "It's sunny!", reply: { en: "Sunny! Let's play outside!", es: '¡Soleado! ¡A jugar afuera!' } },
          { emoji: '🌧️', label: "It's rainy!", reply: { en: "Rainy! Let's use an umbrella!", es: '¡Lluvioso! ¡Usemos paraguas!' } },
          { emoji: '☁️', label: "It's cloudy!", reply: { en: 'Cloudy! Big white clouds!', es: '¡Nublado! ¡Nubes grandes y blancas!' } },
          { emoji: '❄️', label: "It's cold!", reply: { en: "Cold! Brrr! Let's wear a jacket!", es: '¡Frío! ¡Brrr! ¡Abriguémonos!' } },
        ] },
      { en: 'What do we wear when it is cold?', es: '¿Qué nos ponemos cuando hace frío?',
        options: [
          { emoji: '🧣', label: 'A scarf!', reply: { en: 'Yes! A warm scarf!', es: '¡Sí! ¡Una bufanda calentita!' } },
          { emoji: '🩱', label: 'A swimsuit!', reply: { en: 'Brrr! A swimsuit is for the beach!', es: '¡Brrr! El traje de baño es para la playa.' } },
        ] },
      { en: 'See you later, alligator!', es: '¡Nos vemos, cocodrilo!',
        options: [{ emoji: '🐊', label: 'Bye bye!', reply: { en: 'Bye bye!', es: '' } }] },
    ],
  },
  family: {
    icon: '👨‍👩‍👧', es: 'Familia', en: 'Family',
    steps: [
      { en: 'Who loves you very much?', es: '¿Quién te quiere mucho?',
        options: [
          { emoji: '👩', label: 'Mom!', reply: { en: 'Mom loves you very much!', es: 'Mom significa mamá. ¡Mamá te quiere mucho!' } },
          { emoji: '👨', label: 'Dad!', reply: { en: 'Dad loves you very much!', es: 'Dad significa papá. ¡Papá te quiere mucho!' } },
          { emoji: '👵', label: 'Grandma!', reply: { en: 'Grandma loves you very much!', es: 'Grandma significa abuela. ¡Te quiere mucho!' } },
          { emoji: '👴', label: 'Grandpa!', reply: { en: 'Grandpa loves you very much!', es: 'Grandpa significa abuelo. ¡Te quiere mucho!' } },
        ] },
      { en: 'Can you say: I love you!', es: '¿Puedes decir te quiero en inglés? Se dice: I love you!',
        options: [{ emoji: '❤️', label: 'I love you!', reply: { en: 'I love you too, {name}!', es: '¡Yo también te quiero!' } }] },
    ],
  },
};

/* ---------- Mascota ---------- */
const PET_TYPES = {
  dog: { emoji: '🐶', en: 'Puppy', es: 'Perrito', color: '#D9A066' },
  cat: { emoji: '🐱', en: 'Kitty', es: 'Gatito', color: '#F4A259' },
  bunny: { emoji: '🐰', en: 'Bunny', es: 'Conejito', color: '#F3EEEA' },
  bear: { emoji: '🐻', en: 'Teddy', es: 'Osito', color: '#A47148' },
};
const PET_COLORS = ['#D9A066', '#F4A259', '#F3EEEA', '#A47148', '#B8BEC8', '#F9A8D4', '#93C5FD', '#C4B5FD'];

const FOODS = [
  { e: '🍎', en: 'Apple', es: 'manzana', ok: true }, { e: '🍌', en: 'Banana', es: 'plátano', ok: true },
  { e: '🥕', en: 'Carrot', es: 'zanahoria', ok: true }, { e: '🥦', en: 'Broccoli', es: 'brócoli', ok: true },
  { e: '🍇', en: 'Grapes', es: 'uvas', ok: true }, { e: '🥛', en: 'Milk', es: 'leche', ok: true },
  { e: '🍓', en: 'Strawberry', es: 'frutilla', ok: true }, { e: '🧀', en: 'Cheese', es: 'queso', ok: true },
  { e: '🍭', en: 'Candy', es: 'dulce', ok: false }, { e: '🍰', en: 'Cake', es: 'torta', ok: false },
];

const WARDROBE = {
  hat: { icon: '🎩', es: 'Gorros', items: [
    { e: '🧢', en: 'Cap', es: 'jockey', cost: 0 }, { e: '🎀', en: 'Bow', es: 'cintillo', cost: 0 },
    { e: '🎩', en: 'Top hat', es: 'sombrero de copa', cost: 0 }, { e: '👒', en: 'Sun hat', es: 'sombrero', cost: 5 },
    { e: '👑', en: 'Crown', es: 'corona', cost: 10 }, { e: '🎓', en: 'Graduation cap', es: 'birrete', cost: 30 },
  ] },
  glasses: { icon: '👓', es: 'Lentes', items: [
    { e: '👓', en: 'Glasses', es: 'lentes', cost: 0 }, { e: '🕶️', en: 'Sunglasses', es: 'lentes de sol', cost: 5 },
    { e: '🥽', en: 'Goggles', es: 'antiparras', cost: 15 },
  ] },
  shirt: { icon: '👕', es: 'Poleras', items: ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'Purple', 'Orange'].map((n, i) => (
    { color: C(n).color, en: `${n} T-shirt`, es: `polera de color ${C(n).es}`, cost: i < 4 ? 0 : 8 })) },
  neck: { icon: '🧣', es: 'Accesorios', items: [
    { e: '🧣', en: 'Scarf', es: 'bufanda', cost: 0 }, { e: '👔', en: 'Tie', es: 'corbata', cost: 0 },
    { e: '📿', en: 'Necklace', es: 'collar', cost: 8 }, { e: '🏅', en: 'Medal', es: 'medalla', cost: 20 },
  ] },
};

const EMOTIONS = [
  { id: 'happy', e: '😀', en: 'Happy', es: 'feliz', story: { en: '{pet} got a present!', es: '¡{pet} recibió un regalo!' } },
  { id: 'sad', e: '😢', en: 'Sad', es: 'triste', tip: 'Cuando estamos tristes, un abrazo nos ayuda.', story: { en: "Oh no! {pet}'s ice cream fell down.", es: '¡Oh no! Se le cayó el helado a {pet}.' } },
  { id: 'angry', e: '😠', en: 'Angry', es: 'enojado', tip: 'Cuando estamos enojados, respiramos profundo.', story: { en: "Someone took {pet}'s toy!", es: '¡Alguien le quitó el juguete a {pet}!' } },
  { id: 'surprised', e: '😮', en: 'Surprised', es: 'sorprendido', story: { en: 'Wow! A big surprise!', es: '¡Guau! ¡Una gran sorpresa!' } },
  { id: 'sleepy', e: '😴', en: 'Sleepy', es: 'con sueño', story: { en: "It's very late at night.", es: 'Es muy tarde en la noche.' } },
  { id: 'scared', e: '😨', en: 'Scared', es: 'con miedo', tip: 'Cuando tenemos miedo, buscamos a mamá o papá.', story: { en: 'A big storm! Boom boom!', es: '¡Una tormenta muy fuerte! ¡Bum bum!' } },
];

/* ---------- Cocina ---------- */
const RECIPES = {
  pizza: { e: '🍕', en: 'Pizza', es: 'pizza', base: 'dough', act: { e: '🔥', es: '¡Al horno!', en: 'Bake it!', anim: 'bake' },
    ings: [{ e: '🍅', en: 'Tomato', es: 'tomate' }, { e: '🧀', en: 'Cheese', es: 'queso' }, { e: '🍄', en: 'Mushroom', es: 'champiñón' }, { e: '🫑', en: 'Pepper', es: 'pimentón' }, { e: '🫒', en: 'Olive', es: 'aceituna' }] },
  salad: { e: '🥗', en: 'Salad', es: 'ensalada', base: 'bowl', act: { e: '🥄', es: '¡Mezclar!', en: 'Mix it!', anim: 'mix' },
    ings: [{ e: '🥬', en: 'Lettuce', es: 'lechuga' }, { e: '🍅', en: 'Tomato', es: 'tomate' }, { e: '🥒', en: 'Cucumber', es: 'pepino' }, { e: '🥕', en: 'Carrot', es: 'zanahoria' }, { e: '🌽', en: 'Corn', es: 'choclo' }] },
  smoothie: { e: '🥤', en: 'Smoothie', es: 'batido', base: 'blender', act: { e: '🌀', es: '¡Licuar!', en: 'Blend it!', anim: 'blend' },
    ings: [{ e: '🍓', en: 'Strawberry', es: 'frutilla' }, { e: '🍌', en: 'Banana', es: 'plátano' }, { e: '🥛', en: 'Milk', es: 'leche' }, { e: '🫐', en: 'Blueberries', es: 'arándanos' }, { e: '🍯', en: 'Honey', es: 'miel' }] },
  sandwich: { e: '🥪', en: 'Sandwich', es: 'sándwich', base: 'plate', act: { e: '✨', es: '¡Armar!', en: 'Ready!', anim: 'mix' },
    ings: [{ e: '🍞', en: 'Bread', es: 'pan' }, { e: '🥑', en: 'Avocado', es: 'palta' }, { e: '🧀', en: 'Cheese', es: 'queso' }, { e: '🍅', en: 'Tomato', es: 'tomate' }, { e: '🥬', en: 'Lettuce', es: 'lechuga' }] },
  cake: { e: '🎂', en: 'Cake', es: 'torta', base: 'bowl', act: { e: '🔥', es: '¡Al horno!', en: 'Bake it!', anim: 'bake' },
    ings: [{ e: '🥚', en: 'Egg', es: 'huevo' }, { e: '🥛', en: 'Milk', es: 'leche' }, { e: '🌾', en: 'Flour', es: 'harina' }, { e: '🧈', en: 'Butter', es: 'mantequilla' }, { e: '🍓', en: 'Strawberry', es: 'frutilla' }] },
};

/* ---------- Aventura (camino de misiones) ---------- */
const ADVENTURE = [
  { type: 'lesson', topic: 'colors' }, { type: 'bath' }, { type: 'chat', dialog: 'hello' }, { type: 'bubbles' },
  { type: 'lesson', topic: 'animals' }, { type: 'feed' }, { type: 'memory', topic: 'animals' }, { type: 'chat', dialog: 'animal' },
  { type: 'lesson', topic: 'numbers' }, { type: 'cook', recipe: 'pizza' }, { type: 'counting' }, { type: 'chat', dialog: 'age' },
  { type: 'lesson', topic: 'food' }, { type: 'teeth' }, { type: 'shadows' }, { type: 'chat', dialog: 'food' },
  { type: 'lesson', topic: 'body' }, { type: 'dress' }, { type: 'cook', recipe: 'salad' }, { type: 'chat', dialog: 'feelings' },
  { type: 'lesson', topic: 'shapes' }, { type: 'draw' }, { type: 'emotions' }, { type: 'chat', dialog: 'color' },
  { type: 'lesson', topic: 'nature' }, { type: 'chat', dialog: 'weather' }, { type: 'cook', recipe: 'smoothie' },
  { type: 'memory', topic: 'food' }, { type: 'chat', dialog: 'family' }, { type: 'sleep' },
];

const GAMES = [
  { type: 'memory', icon: '🃏', es: 'Memoria', en: 'Memory', color: '#7B4DFF' },
  { type: 'bubbles', icon: '🫧', es: 'Burbujas', en: 'Bubbles', color: '#4FC3F7' },
  { type: 'shadows', icon: '👤', es: 'Sombras', en: 'Shadows', color: '#FF9F43' },
  { type: 'counting', icon: '🔢', es: 'Contar', en: 'Counting', color: '#3DDC84' },
  { type: 'draw', icon: '🖍️', es: 'Dibujar', en: 'Drawing', color: '#FF6FAE' },
];

const STICKERS = ['🦄', '🌈', '🚀', '🦋', '🐳', '🍦', '🎈', '🌻', '🐞', '🦖', '🧁', '🎠', '🪐', '🐙', '🦩', '🍩', '🐝', '🐢', '🦊', '🐧',
  '🌟', '🍭', '🎨', '🏰', '🧸', '🐬', '🦕', '🍉', '🌺', '🎪', '🐨', '🦉', '🐼', '🦒', '🚂', '⛵', '🎸', '🪁', '🐠', '🌵'];

const PRAISE_EN = ['Great job!', 'Amazing!', 'You did it!', 'Super!', 'Fantastic!', 'Well done!', 'Wonderful!'];
const PRAISE_ES = ['¡Lo hiciste genial, {name}!', '¡Muy bien, {name}!', '¡Bravo, {name}!', '¡Eres una campeona, {name}!'];

const DEFAULT_STATE = {
  stars: 0, stickers: [], adv: 0, advLoops: 0, done: {},
  settings: { name: 'Martina', spanish: true, slow: false, ntfy: '' },
  pet: null, ideas: [],
};

/* ============ AUDIOS CON LUMI: lo que Lumi entiende y responde ============
   k = palabras clave (sin tildes, en minúscula). r = respuestas posibles (se elige una). */
const TALK = {
  hello: '¡Hola, {name}! Mándame un audio. Mantén apretado el micrófono y háblame.',
  hold: 'Mantén apretado el micrófono mientras hablas, y suéltalo cuando termines.',
  noMic: 'Necesito permiso para usar el micrófono. Pídele ayuda a un adulto.',
  noText: ['¡Qué lindo audio! Me encanta escuchar tu voz.', '¡Te escuché! Tienes una voz muy bonita.', '¡Me encantó tu audio, {name}! Mándame otro.'],
  idea: ['¡Qué buena idea, {name}! Se la voy a contar a tu papá para que la agregue al juego.', '¡Me encanta tu idea! Ya se la mandé a tu papá. ¡Eres muy creativa!'],
  navOk: '¡Toca el botón y vamos!',
  vocab: ['En inglés se dice:', '¿Puedes decirlo tú? Mándame un audio.'],
  english: ['¡Wow, hablaste en inglés!', 'significa'],
  fallback: ['¡Me encanta escucharte! Cuéntame más.', '¡Qué interesante! ¿Y qué más?', '¡Wow! Eres muy inteligente, {name}.', '¡Jaja, qué divertido!'],
  ask: ['¿Cuál es tu animal favorito?', '¿Qué comiste hoy?', '¿Cuál es tu color favorito?', '¿Quieres jugar algo conmigo? Dime: quiero jugar a las burbujas.', '¿Qué hiciste hoy?'],
};
const BRAIN = [
  { k: ['te quiero', 'te amo', 'te adoro', 'i love you'], r: ['¡Yo también te quiero mucho, {name}! Eres mi mejor amiga.'] },
  { k: ['hola', 'holi', 'buenos dias', 'buenas tardes', 'buenas noches', 'hello', 'hi lumi'], r: ['¡Hola, {name}! ¡Qué lindo escucharte! ¿Cómo estás?', '¡Holaaa! Me alegra mucho que me hables. ¿Qué hiciste hoy?'] },
  { k: ['como estas', 'como te va', 'how are you'], r: ['¡Estoy súper feliz porque me mandaste un audio! ¿Y tú cómo estás?'] },
  { k: ['triste', 'pena', 'llorar', 'llore', 'lloro'], r: ['Oh, te mando un abrazo gigante. Cuéntale a tu mamá o a tu papá cómo te sientes. ¿Quieres jugar algo para ponerte contenta?'] },
  { k: ['enojada', 'enojado', 'rabia', 'molesta'], r: ['Cuando estamos enojados, respiramos profundo. Toma aire por la nariz... y bótalo despacio. ¡Muy bien!'] },
  { k: ['miedo', 'susto', 'asustada'], r: ['Cuando tengo miedo, abrazo a alguien que quiero. ¡Tú eres muy valiente, {name}!'] },
  { k: ['cansada', 'sueno', 'tengo sueno'], r: ['Si tienes sueño, descansar es muy bueno. ¡Dulces sueños!'] },
  { k: ['feliz', 'contenta', 'bien', 'super'], r: ['¡Qué bueno! Me pone muy feliz que estés contenta.'] },
  { k: ['como te llamas', 'quien eres', 'tu nombre'], r: ['Me llamo Lumi. Soy tu amiga de las estrellas y me encanta aprender inglés contigo.'] },
  { k: ['cuantos anos tienes', 'tu edad'], r: ['¡Yo tengo cinco años de estrella! ¿Y tú cuántos tienes?'] },
  { k: ['donde vives', 'tu casa'], r: ['Vivo en una estrellita muy brillante, pero ahora estoy aquí contigo.'] },
  { k: ['tengo cuatro', 'tengo 4', 'cuatro anos', '4 anos'], r: ['¡Cuatro años! En inglés se dice four. ¡Qué grande estás!'] },
  { k: ['chiste', 'algo chistoso', 'risa'], r: ['¿Qué le dijo un pato a otro pato? ¡Estamos empatados! Jajaja.', '¿Qué hace una abeja en el gimnasio? ¡Zumba! Jajaja.', '¿Por qué el libro de matemáticas estaba triste? ¡Porque tenía muchos problemas! Jajaja.'] },
  { k: ['cuento', 'historia'], r: ['Había una vez una estrellita llamada Lumi que quería tener una amiga. Un día escuchó una risa muy linda... ¡era {name}! Y desde ese día juegan juntas todos los días. Fin.'] },
  { k: ['canta', 'cancion', 'cantar'], r: ['La la la, Lumi canta para ti. Uno, dos, tres, ¡a jugar otra vez! La la la.'] },
  { k: ['gracias', 'thank you'], r: ['¡De nada, {name}! Siempre estoy aquí para ti.'] },
  { k: ['chao', 'adios', 'bye', 'nos vemos'], r: ['¡Chao, {name}! Mándame otro audio cuando quieras. Bye bye!'] },
  { k: ['mama', 'mami'], r: ['¡Tu mamá te quiere muchísimo! En inglés, mamá se dice mom.'] },
  { k: ['papa', 'papi'], r: ['¡Tu papá te quiere muchísimo! En inglés, papá se dice dad.'] },
  { k: ['abuela', 'abuelita', 'abuelo', 'abuelito', 'tata', 'nona'], r: ['¡Qué lindo! Los abuelitos son muy especiales. Mándales un abrazo de mi parte.'] },
  { k: ['hermano', 'hermana', 'prima', 'primo', 'amiga', 'amigo'], r: ['¡Qué lindo tener a alguien con quien jugar! Mándale saludos de mi parte.'] },
  { k: ['por que', 'porque'], r: ['¡Qué buena pregunta! Esa se la podemos preguntar a tu mamá o a tu papá. ¡Eres muy curiosa!'] },
  { k: ['te gusta', 'tu favorito', 'tu favorita'], r: ['Me encanta el color morado, las estrellas y aprender inglés contigo.'] },
];
/* Comandos para ir a partes de la app (screen = zona; spec = actividad) */
const CMD_VERBS = ['quiero', 'quero', 'vamos', 'jugar', 'juguemos', 'juega', 'abre', 'abrir', 'ir a', 'llevame', 'ver', 'hacer', 'hagamos', 'aprender', 'aprendamos', 'practicar', 'podemos', 'puedo', 'dale', 'muestrame', 'ensename', 'ponle', 'darle', 'dar'];
const NAV = [
  { k: ['banar', 'banemos', 'banarlo', 'banarla', 'bano', 'ducha', 'tina', 'jabon'], spec: { type: 'bath' }, icon: '🛁', r: '¡Vamos a bañar a {pet}!' },
  { k: ['diente', 'cepill'], spec: { type: 'teeth' }, icon: '🪥', r: '¡Vamos a lavarle los dientes a {pet}!' },
  { k: ['dar de comer', 'alimentar', 'darle comida', 'comer'], spec: { type: 'feed' }, icon: '🍎', r: '¡Vamos a darle comida a {pet}!' },
  { k: ['vestir', 'ropa', 'disfra', 'sombrero', 'polera'], spec: { type: 'dress' }, icon: '👕', r: '¡Vamos a vestir a {pet}!' },
  { k: ['emocion', 'carita', 'sentimiento'], spec: { type: 'emotions' }, icon: '😊', r: '¡Vamos a ver las emociones!' },
  { k: ['dormir', 'acostar', 'cama'], spec: { type: 'sleep' }, icon: '🌙', r: '¡Vamos a hacer dormir a {pet}!' },
  { k: ['pizza'], spec: { type: 'cook', recipe: 'pizza' }, icon: '🍕', r: '¡Vamos a cocinar una pizza!' },
  { k: ['ensalada'], spec: { type: 'cook', recipe: 'salad' }, icon: '🥗', r: '¡Vamos a preparar una ensalada!' },
  { k: ['batido', 'jugo', 'licuado'], spec: { type: 'cook', recipe: 'smoothie' }, icon: '🥤', r: '¡Vamos a preparar un batido!' },
  { k: ['sandwich', 'sanguche'], spec: { type: 'cook', recipe: 'sandwich' }, icon: '🥪', r: '¡Vamos a preparar un sándwich!' },
  { k: ['torta', 'pastel', 'queque'], spec: { type: 'cook', recipe: 'cake' }, icon: '🎂', r: '¡Vamos a preparar una torta!' },
  { k: ['cocin'], screen: 'kitchen', icon: '🍳', r: '¡Vamos a la cocina!' },
  { k: ['burbuja'], spec: { type: 'bubbles' }, icon: '🫧', r: '¡Vamos a reventar burbujas!' },
  { k: ['memoria', 'parejas', 'cartas'], spec: { type: 'memory', topic: 'animals' }, icon: '🃏', r: '¡Vamos a jugar a la memoria!' },
  { k: ['sombra'], spec: { type: 'shadows' }, icon: '👤', r: '¡Vamos a jugar a las sombras!' },
  { k: ['contar'], spec: { type: 'counting' }, icon: '🔢', r: '¡Vamos a contar!' },
  { k: ['dibuj', 'pintar', 'colorear'], spec: { type: 'draw' }, icon: '🖍️', r: '¡Vamos a dibujar!' },
  { k: ['color'], spec: { type: 'lesson', topic: 'colors' }, icon: '🎨', r: '¡Vamos a aprender los colores!' },
  { k: ['animal'], spec: { type: 'lesson', topic: 'animals' }, icon: '🦁', r: '¡Vamos a aprender los animales!' },
  { k: ['numero'], spec: { type: 'lesson', topic: 'numbers' }, icon: '🔢', r: '¡Vamos a aprender los números!' },
  { k: ['fruta', 'comida'], spec: { type: 'lesson', topic: 'food' }, icon: '🍎', r: '¡Vamos a aprender las comidas!' },
  { k: ['cuerpo'], spec: { type: 'lesson', topic: 'body' }, icon: '👀', r: '¡Vamos a aprender las partes del cuerpo!' },
  { k: ['figura', 'forma'], spec: { type: 'lesson', topic: 'shapes' }, icon: '⭐', r: '¡Vamos a aprender las figuras!' },
  { k: ['naturaleza', 'clima'], spec: { type: 'lesson', topic: 'nature' }, icon: '🌈', r: '¡Vamos a aprender la naturaleza!' },
  { k: ['sticker', 'premio'], screen: 'stickers', icon: '📒', r: '¡Vamos a ver tus stickers!' },
  { k: ['aventura', 'mision', 'camino'], screen: 'adventure', icon: '🗺️', r: '¡Vamos a la aventura!' },
  { k: ['mascota', 'perrito', 'gatito', 'conejito', 'osito'], screen: 'pet', icon: '🐾', r: '¡Vamos a ver a {pet}!' },
  { k: ['ingles'], screen: 'english', icon: '🔤', r: '¡Vamos a aprender inglés!' },
  { k: ['conversar', 'hablar con'], screen: 'chat', icon: '💬', r: '¡Vamos a conversar!' },
];
const NAV_GAMES = { k: ['juego', 'jugar', 'juguemos'], screen: 'games', icon: '🎮', r: '¡Vamos a los juegos!' };
const IDEA_WORDS = ['quiero', 'quero', 'me gustaria', 'ojala', 'puedes', 'podrias', 'agrega', 'agregar', 'pon ', 'ponle', 'crea', 'inventa', 'hazme', 'haz ', 'nuevo', 'nueva', 'que haya', 'idea'];
