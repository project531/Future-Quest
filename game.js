
"use strict";

/* =====================================================
   FUTURE QUEST — ARCADE RPG EDITION
   GAME.JS — PARTE 2
   CONFIGURACIÓN, MISIONES Y PERSONAJES

   IMPORTANTE:
   Este archivo continuará en las partes 3, 4, 5 y 6.
   No ejecutes el juego hasta completar las partes.
===================================================== */

/* =====================================================
   1. CONFIGURACIÓN GENERAL
===================================================== */

const $ = id => document.getElementById(id);

const canvas = $("world");

if (!canvas) {
  throw new Error(
    "FUTURE QUEST: No se encontró el canvas #world."
  );
}

const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error(
    "FUTURE QUEST: No se pudo iniciar Canvas 2D."
  );
}

const WORLD_W = 1800;
const WORLD_H = 1100;

// Conservamos la clave original para recuperar
// las partidas guardadas de FUTURE QUEST 2.0.
const SAVE_KEY = "futureQuestSaveV2";

let screen = "home";
let currentLevel = 0;
let xp = 0;
let unlocked = 0;

let inventory = [];

let completed = new Set();
let completedSideQuests = new Set();
let selectedValues = new Set();

let activeObject = null;
let activeDialogue = null;

let dialogueIndex = 0;

let sequenceSelection = [];
let memorySelection = [];
let memoryMatched = new Set();
let memoryLocked = false;

let audioEnabled = false;
let audioContext = null;

let lastTime = 0;
let animationFrame = 0;
let autosaveInterval = null;

let victoryShown = false;

const keys = {};
const touch = {};

const camera = {
  x: 0,
  y: 0
};

/* =====================================================
   2. PALETA DE COLORES

   Colores principales:
   amarillo, rosado, verde, naranja,
   celeste y beige.

   Tonos oscuros solo para contornos,
   sombras y profundidad.
===================================================== */

const PALETTE = {
  yellow: "#FFD447",
  yellowLight: "#FFE783",
  yellowDark: "#DFA22C",

  pink: "#F57CA5",
  pinkLight: "#FFAAC5",
  pinkDark: "#C85480",

  green: "#69BD72",
  greenLight: "#9ADD8E",
  greenDark: "#3D9353",

  orange: "#FF994A",
  orangeLight: "#FFC078",
  orangeDark: "#C66A34",

  sky: "#72C9E8",
  skyLight: "#C7EFF9",
  skyDark: "#3C9BBE",

  beige: "#E8D3AE",
  beigeLight: "#FFF3D9",
  beigeDark: "#BEA17C",

  brown: "#98633D",
  brownDark: "#65432E",

  ink: "#34434B",
  white: "#FFFFFF"
};

const colors = [
  PALETTE.pink,
  PALETTE.orange,
  PALETTE.green
];

/* =====================================================
   3. JUGADOR PRINCIPAL

   Las coordenadas, velocidad y controles
   mantienen el funcionamiento original.
===================================================== */

const player = {
  x: 130,
  y: 610,

  speed: 3.6,

  moving: false,
  direction: 1,
  facing: "down",

  frame: 0,

  color: PALETTE.yellow,

  // Características visuales
  skin: "#E9B28F",
  hair: "#694A37",
  pants: "#47769B",
  shoes: "#F9F4E8",
  backpack: PALETTE.orange
};

/* =====================================================
   4. MISIONES PRINCIPALES
===================================================== */

const missions = [

  /* ===================================================
     ZONA 01 — DISTRITO NEÓN
     TEMA: RUMORES Y DISCRIMINACIÓN
  =================================================== */

  {
    name: "DISTRITO NEÓN",
    chapter: "ZONA 01",
    color: colors[0],
    icon: "🏙️",

    story:
      "Un rumor está destruyendo la convivencia en el colegio. Investiga lo ocurrido y ayuda a recuperar la confianza.",

    objectives: [
      "Investigar el mensaje viral.",
      "Encontrar la evidencia digital.",
      "Reconstruir la secuencia del rumor.",
      "Ayudar a Alex a recuperar su voz."
    ],

    objects: [

      {
        id: "r1",

        x: 350,
        y: 250,

        icon: "▣",
        label: "MENSAJE VIRAL",

        kind: "clue",

        title: "MENSAJE ANÓNIMO",

        description:
          "Encuentras un mensaje que acusa a Alex de haber cometido una falta. No tiene autor identificado ni pruebas.",

        item: "Captura del rumor",

        reward: 50
      },

      {
        id: "r2",

        x: 760,
        y: 520,

        icon: "⌕",
        label: "ARCHIVO DIGITAL",

        kind: "clue",

        title: "LA EVIDENCIA",

        description:
          "Encuentras la publicación original. La información fue modificada antes de difundirse. La fuente no confirma la acusación.",

        item: "Fuente original",

        reward: 50
      },

      {
        id: "r3",

        x: 1110,
        y: 260,

        icon: "◇",
        label: "TERMINAL DE DATOS",

        kind: "sequence",

        title: "RECONSTRUYE EL RUMOR",

        description:
          "Ordena las acciones para investigar responsablemente.",

        parts: [
          "Identificar quién publicó el mensaje.",
          "Contrastar la información con fuentes confiables.",
          "No difundir acusaciones sin pruebas.",
          "Informar con respeto sobre la información falsa."
        ],

        order: [0, 1, 2, 3],

        success:
          "¡Secuencia reconstruida! Has aprendido a investigar sin contribuir a la desinformación.",

        reward: 100
      },

      {
        id: "r4",

        x: 1370,
        y: 700,

        icon: "◉",
        label: "ALEX",

        kind: "choice",

        title: "RECUPERA LA CONFIANZA",

        description:
          "Alex está preocupado porque sus compañeros lo excluyen. ¿Cómo puedes ayudarlo?",

        options: [
          {
            text:
              "Escucharlo, acompañarlo y buscar apoyo para detener la discriminación.",
            correct: true
          },

          {
            text:
              "Ignorarlo para no involucrarte.",
            correct: false
          },

          {
            text:
              "Difundir el rumor para saber qué opinan los demás.",
            correct: false
          }
        ],

        success:
          "Alex recibe apoyo. La comunidad comprende que un rumor no justifica excluir a nadie.",

        reward: 150
      }
    ]
  },

  /* ===================================================
     ZONA 02 — PLAZA DEL ENCUENTRO
     TEMA: DEMOCRACIA Y DIÁLOGO
  =================================================== */

  {
    name: "PLAZA DEL ENCUENTRO",
    chapter: "ZONA 02",
    color: colors[1],
    icon: "🌳",

    story:
      "Dos grupos quieren utilizar el centro comunitario, pero no logran ponerse de acuerdo. La plaza necesita recuperar el diálogo.",

    objectives: [
      "Escuchar a los representantes.",
      "Encontrar las propuestas.",
      "Resolver el desafío de las soluciones.",
      "Construir un acuerdo democrático."
    ],

    objects: [

      {
        id: "d1",

        x: 350,
        y: 250,

        icon: "◉",
        label: "REPRESENTANTE A",

        kind: "clue",

        title: "LA PRIMERA VOZ",

        description:
          "El primer grupo quiere utilizar el centro para actividades deportivas. Necesitan un espacio para todos sus integrantes.",

        item: "Propuesta deportiva",

        reward: 50
      },

      {
        id: "d2",

        x: 760,
        y: 520,

        icon: "◉",
        label: "REPRESENTANTE B",

        kind: "clue",

        title: "LA SEGUNDA VOZ",

        description:
          "El segundo grupo necesita un espacio de lectura y actividades culturales. También tienen derecho a participar.",

        item: "Propuesta cultural",

        reward: 50
      },

      {
        id: "d3",

        x: 1110,
        y: 260,

        icon: "◇",
        label: "CENTRO DE SOLUCIONES",

        kind: "memory",

        title: "CONECTA LAS SOLUCIONES",

        description:
          "Encuentra las parejas que relacionan los problemas de convivencia con soluciones pacíficas.",

        pairs: [
          [
            "Falta de diálogo",
            "Escucha activa"
          ],

          [
            "Exclusión",
            "Participación igualitaria"
          ],

          [
            "Desacuerdo",
            "Acuerdo democrático"
          ]
        ],

        reward: 100
      },

      {
        id: "d4",

        x: 1370,
        y: 700,

        icon: "⚖",
        label: "ASAMBLEA",

        kind: "choice",

        title: "CONSTRUYE EL ACUERDO",

        description:
          "Los dos grupos están reunidos. Necesitan decidir cómo utilizar el centro comunitario.",

        options: [
          {
            text:
              "Establecer horarios compartidos y evaluar las necesidades de ambos grupos.",
            correct: true
          },

          {
            text:
              "Entregar todo el espacio al grupo más numeroso.",
            correct: false
          },

          {
            text:
              "Cancelar todas las actividades.",
            correct: false
          }
        ],

        success:
          "¡Acuerdo alcanzado! Ambos grupos tendrán oportunidades justas.",

        reward: 150
      }
    ]
  },

  /* ===================================================
     ZONA 03 — ARCHIVO DE LA MEMORIA
     TEMA: MEMORIA HISTÓRICA Y DERECHOS HUMANOS
  =================================================== */

  {
    name: "ARCHIVO DE LA MEMORIA",
    chapter: "ZONA 03",
    color: colors[2],
    icon: "📚",

    story:
      "El archivo histórico ha perdido información esencial. Debes recuperar documentos sobre el periodo de violencia terrorista en el Perú y proteger la memoria colectiva.",

    objectives: [
      "Explorar el archivo histórico.",
      "Recuperar los testimonios.",
      "Reconstruir la línea de tiempo.",
      "Restaurar el mensaje de memoria y paz."
    ],

    objects: [

      {
        id: "m1",

        x: 350,
        y: 250,

        icon: "▣",
        label: "ARCHIVO HISTÓRICO",

        kind: "clue",

        title: "EL ARCHIVO PERDIDO",

        description:
          "Durante las décadas de 1980 y 1990, el Perú vivió un periodo de violencia terrorista que afectó profundamente a la población. Este archivo reúne información sobre las víctimas y sus comunidades.",

        item: "Documento histórico",

        reward: 50
      },

      {
        id: "m2",

        x: 760,
        y: 520,

        icon: "▤",
        label: "SALA DE TESTIMONIOS",

        kind: "clue",

        title: "VOCES DE LA MEMORIA",

        description:
          "Los testimonios de las víctimas y sobrevivientes permiten comprender las consecuencias humanas de la violencia. Recordar exige respeto, empatía y dignidad.",

        item: "Registro de testimonios",

        reward: 50
      },

      {
        id: "m3",

        x: 1110,
        y: 260,

        icon: "⌛",
        label: "LÍNEA DE TIEMPO",

        kind: "sequence",

        title: "RECONSTRUYE LA MEMORIA",

        description:
          "Ordena estos acontecimientos para comprender el proceso histórico.",

        parts: [
          "Inicio del periodo de violencia terrorista en 1980.",
          "Desarrollo y expansión de la violencia durante las décadas de 1980 y 1990.",
          "Publicación del Informe Final de la Comisión de la Verdad y Reconciliación en 2003.",
          "Trabajo continuo de memoria, reparación y defensa de los derechos humanos."
        ],

        order: [0, 1, 2, 3],

        success:
          "¡Línea de tiempo restaurada! Conocer la historia permite comprender sus consecuencias y defender la democracia.",

        reward: 100
      },

      {
        id: "m4",

        x: 1370,
        y: 700,

        icon: "✧",
        label: "MENSAJE FINAL",

        kind: "sequence",

        title: "RESTAURA EL MENSAJE",

        description:
          "Ordena las palabras para revelar el mensaje que protegerá el futuro.",

        parts: [
          "La memoria",
          "nos ayuda",
          "a defender",
          "los derechos humanos",
          "y construir la paz."
        ],

        order: [0, 1, 2, 3, 4],

        success:
          "¡Mensaje recuperado! La memoria histórica fortalece la democracia y la cultura de paz.",

        reward: 150
      }
    ]
  }
];

/* =====================================================
   5. PERSONAJES DE CADA ZONA
===================================================== */

const npcs = [

  {
    id: "npc-rumores",

    level: 0,

    x: 570,
    y: 360,

    name: "LUNA",
    role: "Guía de convivencia",

    color: PALETTE.pink,

    hair: "#68442F",
    shirt: PALETTE.pink,
    skin: "#F0B891",

    dialogue: [
      "¡Hola! Bienvenido al Distrito Neón.",

      "Aquí todos deberían sentirse seguros y respetados, pero un rumor está causando problemas.",

      "Recuerda que no todo lo que aparece en internet es verdadero.",

      "Antes de compartir información, revisa quién la publicó y busca fuentes confiables.",

      "¡Investiga las pistas y ayuda a que todos vuelvan a convivir con respeto!"
    ],

    completedDialogue: [
      "¡Lo lograste!",

      "Gracias por ayudar a detener el rumor.",

      "Verificar la información y escuchar a los demás hace que nuestra comunidad sea mejor."
    ]
  },

  {
    id: "npc-democracia",

    level: 1,

    x: 550,
    y: 360,

    name: "MATEO",
    role: "Mediador juvenil",

    color: PALETTE.orange,

    hair: "#49372E",
    shirt: PALETTE.sky,
    skin: "#DDA57F",

    dialogue: [
      "¡Bienvenido a la Plaza del Encuentro!",

      "Dos grupos quieren usar el mismo centro comunitario.",

      "Ambos tienen buenas ideas, pero todavía no encuentran una solución.",

      "La democracia significa escuchar, participar y construir acuerdos justos.",

      "¡Habla con los representantes y ayúdanos a resolver el conflicto!"
    ],

    completedDialogue: [
      "¡Excelente trabajo!",

      "Demostraste que un desacuerdo no tiene que convertirse en una pelea.",

      "El diálogo y la participación permiten encontrar soluciones para todos."
    ]
  },

  {
    id: "npc-memoria",

    level: 2,

    x: 550,
    y: 360,

    name: "SOFÍA",
    role: "Guardiana de la memoria",

    color: PALETTE.green,

    hair: "#64442E",
    shirt: PALETTE.green,
    skin: "#E8B18D",

    dialogue: [
      "Bienvenido al Archivo de la Memoria.",

      "Aquí conservamos documentos y testimonios sobre el periodo de violencia terrorista que vivió el Perú.",

      "Conocer nuestra historia nos ayuda a comprender el sufrimiento de las víctimas y a defender los derechos humanos.",

      "La memoria histórica también nos recuerda la importancia de la democracia y la paz.",

      "¡Recupera los documentos y ayúdanos a proteger estas historias!"
    ],

    completedDialogue: [
      "Gracias por recuperar el archivo.",

      "Recordar con respeto es una forma de reconocer la dignidad de las víctimas.",

      "La memoria, la justicia y la convivencia democrática son fundamentales para construir un futuro de paz."
    ]
  }
];

/* =====================================================
   6. MISIONES SECUNDARIAS
===================================================== */

const sideQuests = [

  {
    id: "sq-rumores",

    level: 0,

    x: 880,
    y: 750,

    icon: "✉",
    label: "BUZÓN DE APOYO",

    title: "UN MENSAJE QUE AYUDA",

    description:
      "Una estudiante quiere apoyar a su compañero, pero no sabe qué mensaje enviar. Ayúdala a elegir una respuesta respetuosa.",

    options: [
      {
        text:
          "Estoy aquí para escucharte. Podemos buscar ayuda y aclarar lo ocurrido con respeto.",
        correct: true
      },

      {
        text:
          "No importa lo que pasó. Mejor ignora a todos.",
        correct: false
      },

      {
        text:
          "Voy a compartir el rumor para que todos sepan tu versión.",
        correct: false
      }
    ],

    success:
      "¡Muy bien! Un mensaje empático puede ayudar a que alguien se sienta escuchado y acompañado.",

    item: "Insignia de empatía",

    reward: 75
  },

  {
    id: "sq-democracia",

    level: 1,

    x: 940,
    y: 750,

    icon: "★",
    label: "TABLERO COMUNITARIO",

    title: "TODOS TENEMOS VOZ",

    description:
      "El centro comunitario organizará una reunión. ¿Qué acción favorece una participación democrática?",

    options: [
      {
        text:
          "Invitar a los diferentes grupos, escuchar sus propuestas y acordar reglas de participación.",
        correct: true
      },

      {
        text:
          "Permitir que solo hablen quienes piensan igual.",
        correct: false
      },

      {
        text:
          "Elegir una solución sin escuchar a los participantes.",
        correct: false
      }
    ],

    success:
      "¡Excelente! La participación democrática requiere inclusión, diálogo y respeto por las distintas opiniones.",

    item: "Insignia de participación",

    reward: 75
  },

  {
    id: "sq-memoria",

    level: 2,

    x: 940,
    y: 750,

    icon: "✿",
    label: "JARDÍN DE LA MEMORIA",

    title: "UN ESPACIO PARA RECORDAR",

    description:
      "La comunidad quiere crear un jardín de memoria. ¿Cómo debería organizarse este espacio?",

    options: [
      {
        text:
          "Con respeto hacia las víctimas, información histórica confiable y participación de la comunidad.",
        correct: true
      },

      {
        text:
          "Sin consultar a las personas afectadas ni revisar la información.",
        correct: false
      },

      {
        text:
          "Presentando la violencia como una forma aceptable de resolver conflictos.",
        correct: false
      }
    ],

    success:
      "¡Muy bien! Los espacios de memoria deben promover el respeto, la reflexión y una cultura de paz.",

    item: "Insignia de memoria",

    reward: 75
  }
];

/* =====================================================
   7. CONSULTAS DEL JUEGO
===================================================== */

function getMission() {
  return missions[currentLevel] || null;
}

function getNPC() {
  return npcs.find(
    npc => npc.level === currentLevel
  ) || null;
}

function getSideQuest() {
  return sideQuests.find(
    quest => quest.level === currentLevel
  ) || null;
}

function isCompleted(id) {
  return completed.has(id);
}

function isSideQuestCompleted(id) {
  return completedSideQuests.has(id);
}

function getMissionProgress(level = currentLevel) {
  const mission = missions[level];

  if (!mission) return 0;

  const total = mission.objects.length;

  if (total === 0) return 0;

  const finished = mission.objects.filter(
    object => completed.has(object.id)
  ).length;

  return Math.round(
    (finished / total) * 100
  );
}

function isMissionCompleted(level = currentLevel) {
  const mission = missions[level];

  if (!mission) return false;

  return mission.objects.every(
    object => completed.has(object.id)
  );
}

function getTotalProgress() {
  const allObjects = missions.flatMap(
    mission => mission.objects
  );

  if (allObjects.length === 0) return 0;

  const finished = allObjects.filter(
    object => completed.has(object.id)
  ).length;

  return Math.round(
    (finished / allObjects.length) * 100
  );
}

/* =====================================================
   8. UTILIDADES MATEMÁTICAS
===================================================== */

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function distance(a, b) {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );
}

function seed(n) {
  const x = Math.sin(
    n * 127.1 + 311.7
  ) * 43758.5453;

  return x - Math.floor(x);
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");

  const full = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean;

  const number = parseInt(full, 16);

  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function rgba(hex, alpha = 1) {
  const rgb = hexToRgb(hex);

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function roundedRect(x, y, width, height, radius = 12) {
  const r = Math.min(
    radius,
    width / 2,
    height / 2
  );

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

/* =====================================================
   9. TEMAS VISUALES DEL MUNDO
===================================================== */

const worldThemes = [

  // DISTRITO NEÓN
  {
    name: "Distrito Neón",

    skyTop: "#70C7E8",
    skyBottom: "#C9EEF6",

    grass: "#83C976",
    grassDark: "#5EAB60",

    road: "#C8B395",
    sidewalk: "#E8D3AE",

    buildingA: "#F57CA5",
    buildingB: "#FFD447",
    buildingC: "#72C9E8",

    roof: "#B36C45",
    tree: "#4BA45C",

    accent: "#FF994A",

    flowers: [
      "#F57CA5",
      "#FFD447",
      "#FFFFFF"
    ]
  },

  // PLAZA DEL ENCUENTRO
  {
    name: "Plaza del Encuentro",

    skyTop: "#80D3E9",
    skyBottom: "#DCF4EF",

    grass: "#87CB74",
    grassDark: "#59A85D",

    road: "#D0B999",
    sidewalk: "#F0DDBD",

    buildingA: "#FFB56D",
    buildingB: "#F2D270",
    buildingC: "#8BCEDC",

    roof: "#AD6B4D",
    tree: "#4FA95C",

    accent: "#F57CA5",

    flowers: [
      "#FF994A",
      "#F57CA5",
      "#FFD447"
    ]
  },

  // ARCHIVO DE LA MEMORIA
  {
    name: "Archivo de la Memoria",

    skyTop: "#91D0E8",
    skyBottom: "#F1E8D5",

    grass: "#90C47B",
    grassDark: "#65A45F",

    road: "#CBB89C",
    sidewalk: "#E8D3AE",

    buildingA: "#E4B58E",
    buildingB: "#A8CEE0",
    buildingC: "#E8D3AE",

    roof: "#98633D",
    tree: "#4D9E58",

    accent: "#FFD447",

    flowers: [
      "#FFFFFF",
      "#F57CA5",
      "#FFD447"
    ]
  }
];

function getWorldTheme() {
  return worldThemes[currentLevel] || worldThemes[0];
}

/* =====================================================
   FIN DE LA PARTE 2
   CONTINÚA PEGANDO LA PARTE 3 DEBAJO
===================================================== */

/* =====================================================
   FUTURE QUEST — ARCADE RPG EDITION
   GAME.JS — PARTE 3

   ESCENARIOS, EDIFICIOS Y NATURALEZA
   ESTILO CIUDAD COLORIDA CON PROFUNDIDAD
===================================================== */

/* =====================================================
   1. HERRAMIENTAS DE DIBUJO
===================================================== */

function paintRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function paintRound(x, y, w, h, r, color) {
  roundedRect(x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function paintEllipse(x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(
    x, y,
    Math.max(0.1, rx),
    Math.max(0.1, ry),
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = color;
  ctx.fill();
}

function paintLine(
  x1, y1, x2, y2,
  color, width = 2
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function paintText(
  text, x, y,
  size = 18,
  color = PALETTE.ink
) {
  ctx.save();
  ctx.font = `900 ${size}px Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function paintPolygon(points, color) {
  ctx.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point[0], point[1]);
    } else {
      ctx.lineTo(point[0], point[1]);
    }
  });

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function paintOutline(
  x, y, w, h,
  radius = 8,
  color = "#76523A",
  width = 3
) {
  ctx.save();
  roundedRect(x, y, w, h, radius);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

/* =====================================================
   2. CIELO, SOL Y MONTAÑAS
===================================================== */

function drawSky(theme) {
  const gradient = ctx.createLinearGradient(
    0, 0, 0, 520
  );

  gradient.addColorStop(0, theme.skyTop);
  gradient.addColorStop(1, theme.skyBottom);

  paintRect(
    0, 0,
    WORLD_W, WORLD_H,
    gradient
  );

  // Sol cálido.
  paintEllipse(
    1560, 112,
    81, 81,
    "#FFF2AE66"
  );

  paintEllipse(
    1560, 112,
    59, 59,
    PALETTE.yellow
  );

  paintEllipse(
    1545, 96,
    15, 12,
    "#FFF4BD"
  );

  // Montañas lejanas.
  paintPolygon([
    [0, 390],
    [170, 280],
    [350, 390],
    [530, 295],
    [740, 395],
    [920, 285],
    [1110, 390],
    [1360, 290],
    [1600, 395],
    [1800, 310],
    [1800, 560],
    [0, 560]
  ], "#A4D6B3");

  paintPolygon([
    [0, 425],
    [250, 335],
    [480, 425],
    [730, 345],
    [980, 435],
    [1200, 340],
    [1450, 425],
    [1660, 350],
    [1800, 420],
    [1800, 580],
    [0, 580]
  ], "#76BD92");
}

function drawCloud(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  paintEllipse(
    0, 15,
    70, 20,
    "#4A91AA22"
  );

  paintEllipse(
    -38, 0,
    34, 24,
    "#FFFFFF"
  );

  paintEllipse(
    0, -15,
    45, 35,
    "#FFFFFF"
  );

  paintEllipse(
    40, 0,
    35, 25,
    "#FFFFFF"
  );

  paintEllipse(
    0, 9,
    68, 19,
    "#FFFFFF"
  );

  ctx.restore();
}

function drawAnimatedClouds(time) {
  const drift = time * 0.012;

  for (let i = 0; i < 7; i++) {
    const x =
      ((i * 330 + drift * (1 + i * 0.08))
      % 2300) - 190;

    const y =
      65 + (i % 3) * 68;

    drawCloud(
      x,
      y,
      0.75 + (i % 3) * 0.16
    );
  }
}

/* =====================================================
   3. CÉSPED Y CAMINOS DE PIEDRA
===================================================== */

function drawGround(theme) {
  // Base de césped.
  paintRect(
    0, 350,
    WORLD_W, WORLD_H - 350,
    theme.grass
  );

  // Variaciones del terreno.
  for (let i = 0; i < 75; i++) {
    const x = seed(i + 31) * WORLD_W;
    const y = 390 + seed(i + 89) * 710;

    paintEllipse(
      x, y,
      25 + seed(i + 13) * 37,
      10 + seed(i + 17) * 13,
      i % 2
        ? "#A7D98A"
        : theme.grassDark
    );
  }

  // Camino horizontal.
  paintRect(
    0, 425,
    WORLD_W, 155,
    "#B9A58B"
  );

  paintRect(
    0, 433,
    WORLD_W, 137,
    theme.sidewalk
  );

  // Camino vertical.
  paintRect(
    825, 340,
    180, 760,
    "#B9A58B"
  );

  paintRect(
    834, 340,
    162, 760,
    theme.sidewalk
  );

  // Juntas de las baldosas horizontales.
  for (let x = 0; x < WORLD_W; x += 76) {
    paintLine(
      x, 435,
      x, 569,
      "#C4AC8D",
      2
    );
  }

  paintLine(
    0, 500,
    WORLD_W, 500,
    "#C4AC8D",
    2
  );

  // Baldosas verticales.
  for (let y = 350; y < WORLD_H; y += 75) {
    paintLine(
      834, y,
      996, y,
      "#C4AC8D",
      2
    );
  }

  paintLine(
    914, 340,
    914, WORLD_H,
    "#C4AC8D",
    2
  );

  // Plaza central.
  paintEllipse(
    915, 505,
    190, 119,
    "#B69B7C"
  );

  paintEllipse(
    915, 501,
    179, 108,
    "#F0DFC0"
  );

  // Aro de piedra.
  ctx.beginPath();
  ctx.ellipse(
    915, 501,
    177, 106,
    0, 0, Math.PI * 2
  );

  ctx.strokeStyle = "#C9B090";
  ctx.lineWidth = 7;
  ctx.stroke();
}

/* =====================================================
   4. VENTANAS CON PROFUNDIDAD
===================================================== */

function drawWindow(x, y, w = 46, h = 57) {
  // Sombra del marco.
  paintRound(
    x + 4, y + 5,
    w, h,
    5,
    "#65432E55"
  );

  // Marco de madera.
  paintRound(
    x - 4, y - 4,
    w + 8, h + 8,
    6,
    "#815B42"
  );

  // Marco interior.
  paintRound(
    x, y,
    w, h,
    4,
    "#F8E6C5"
  );

  // Cristal.
  paintRect(
    x + 5, y + 5,
    w - 10, h - 10,
    "#77CBE7"
  );

  // Cristal sombreado.
  paintRect(
    x + w / 2,
    y + 5,
    w / 2 - 5,
    h - 10,
    "#4FA9CD"
  );

  // Reflejos.
  paintPolygon([
    [x + 7, y + 10],
    [x + 20, y + 5],
    [x + 12, y + 26],
    [x + 7, y + 28]
  ], "#FFFFFF99");

  // Divisiones.
  paintRect(
    x + w / 2 - 2,
    y + 4,
    4, h - 8,
    "#FFF1D5"
  );

  paintRect(
    x + 4,
    y + h / 2 - 2,
    w - 8, 4,
    "#FFF1D5"
  );

  // Alféizar.
  paintRound(
    x - 8,
    y + h,
    w + 16,
    9,
    3,
    "#B8875C"
  );
}

/* =====================================================
   5. PAREDES DE LADRILLO
===================================================== */

function drawBrickPattern(
  x, y, w, h,
  color = "#8B634A"
) {
  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.globalAlpha = 0.20;

  const brickW = 43;
  const brickH = 22;

  for (
    let row = 0;
    row < Math.ceil(h / brickH);
    row++
  ) {
    const offset =
      row % 2 === 0 ? 0 : brickW / 2;

    const yy = y + row * brickH;

    paintLine(
      x, yy,
      x + w, yy,
      color,
      2
    );

    for (
      let xx = x - brickW + offset;
      xx < x + w;
      xx += brickW
    ) {
      paintLine(
        xx, yy,
        xx, yy + brickH,
        color,
        2
      );
    }
  }

  ctx.restore();
}

/* =====================================================
   6. PUERTAS DE EDIFICIOS
===================================================== */

function drawDoor(x, y, w = 58, h = 79) {
  // Marco.
  paintRound(
    x - 7, y - 8,
    w + 14, h + 8,
    8,
    "#F4DEB7"
  );

  paintOutline(
    x - 7, y - 8,
    w + 14, h + 8,
    8,
    "#855B3D",
    3
  );

  // Puerta de madera.
  paintRound(
    x, y,
    w, h,
    5,
    "#A76E46"
  );

  // Paneles.
  paintRound(
    x + 9, y + 10,
    w - 18, 24,
    3,
    "#C38B59"
  );

  paintRound(
    x + 9, y + 43,
    w - 18, 24,
    3,
    "#C38B59"
  );

  // Pomo.
  paintEllipse(
    x + w - 12,
    y + h / 2,
    4, 4,
    PALETTE.yellow
  );

  // Escalón.
  paintRound(
    x - 14,
    y + h - 1,
    w + 28, 10,
    3,
    "#C9B49B"
  );
}

/* =====================================================
   7. EDIFICIOS 3D CON TEJADOS

   Conservamos la misma función drawBuilding()
   que utilizaba el juego original.
===================================================== */

function drawBuilding(
  x, y, w, h,
  wallColor,
  roofColor,
  label = ""
) {
  ctx.save();

  // Sombra en el suelo.
  paintEllipse(
    x + w / 2 + 13,
    y + h + 7,
    w / 2 + 25,
    17,
    "#3B493D33"
  );

  // Fachada lateral para dar volumen.
  paintPolygon([
    [x + w - 5, y + 10],
    [x + w + 18, y - 4],
    [x + w + 18, y + h - 6],
    [x + w - 5, y + h]
  ], "#9B765E");

  // Pared principal.
  paintRound(
    x, y,
    w, h,
    5,
    wallColor
  );

  // Contorno de la fachada.
  paintOutline(
    x, y,
    w, h,
    5,
    "#76523A",
    4
  );

  // Sombra lateral.
  paintRect(
    x + w - 17,
    y + 5,
    14,
    h - 10,
    "#65432E22"
  );

  // Ladrillos.
  drawBrickPattern(
    x + 4,
    y + 12,
    w - 8,
    h - 16
  );

  // Techo superior con volumen.
  paintPolygon([
    [x - 16, y + 1],
    [x + 8, y - 34],
    [x + w + 10, y - 34],
    [x + w + 24, y + 1]
  ], roofColor);

  // Frente del tejado.
  paintPolygon([
    [x - 16, y + 1],
    [x + w + 24, y + 1],
    [x + w + 20, y + 17],
    [x - 13, y + 17]
  ], "#86583F");

  // Borde luminoso.
  paintLine(
    x + 5, y - 30,
    x + w + 5, y - 30,
    "#FFFFFF77",
    4
  );

  // Tejas.
  for (
    let tx = x + 15;
    tx < x + w;
    tx += 32
  ) {
    paintLine(
      tx, y - 28,
      tx - 10, y - 4,
      "#65432E55",
      2
    );
  }

  // Distribución de ventanas.
  const cols =
    w >= 300 ? 3 : 2;

  const windowW = 43;
  const windowH = 52;

  const usableWidth = w - 58;

  for (let col = 0; col < cols; col++) {
    const wx =
      x + 29 +
      col * (usableWidth - windowW) /
      Math.max(1, cols - 1);

    // Fila superior.
    drawWindow(
      wx,
      y + 70,
      windowW,
      windowH
    );

    // Fila inferior, si cabe.
    if (h >= 260) {
      drawWindow(
        wx,
        y + 145,
        windowW,
        windowH
      );
    }
  }

  // Puerta.
  drawDoor(
    x + w / 2 - 29,
    y + h - 79,
    58,
    79
  );

  // Letrero.
  if (label) {
    const signW = Math.min(
      w - 24,
      Math.max(
        120,
        label.length * 10 + 30
      )
    );

    const signX =
      x + w / 2 - signW / 2;

    paintRound(
      signX + 3,
      y + 23,
      signW,
      35,
      5,
      "#65432E66"
    );

    paintRound(
      signX,
      y + 19,
      signW,
      35,
      5,
      PALETTE.beigeLight
    );

    paintOutline(
      signX,
      y + 19,
      signW,
      35,
      5,
      "#8B6042",
      2
    );

    ctx.save();
    ctx.font = "900 14px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#65432E";

    ctx.fillText(
      label,
      x + w / 2,
      y + 36,
      signW - 12
    );

    ctx.restore();
  }

  ctx.restore();
}

/* =====================================================
   8. ÁRBOLES FRONDOSOS CON PROFUNDIDAD
===================================================== */

function drawTree(x, y, scale = 1, time = 0) {
  const sway =
    Math.sin(time * 0.0015 + x * 0.01) * 2.5;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Sombra.
  paintEllipse(
    0, 8,
    43, 13,
    "#294D2E44"
  );

  // Tronco.
  paintRound(
    -11, -88,
    22, 96,
    5,
    "#80512F"
  );

  paintRect(
    -6, -82,
    5, 76,
    "#B47C4B"
  );

  // Ramas.
  paintLine(
    0, -63,
    -25, -94,
    "#80512F",
    11
  );

  paintLine(
    0, -76,
    27, -110,
    "#80512F",
    10
  );

  // Copa animada.
  ctx.save();
  ctx.translate(sway, 0);

  // Parte trasera.
  paintEllipse(
    -35, -115,
    40, 42,
    "#367D42"
  );

  paintEllipse(
    36, -116,
    41, 43,
    "#367D42"
  );

  paintEllipse(
    0, -147,
    53, 48,
    "#3D8C49"
  );

  // Parte central.
  paintEllipse(
    -38, -128,
    37, 39,
    "#4CA95A"
  );

  paintEllipse(
    37, -131,
    39, 40,
    "#4CA95A"
  );

  paintEllipse(
    0, -160,
    49, 43,
    "#57B865"
  );

  // Iluminación.
  paintEllipse(
    -18, -168,
    25, 18,
    "#83D17A"
  );

  paintEllipse(
    27, -144,
    20, 14,
    "#78CA72"
  );

  paintEllipse(
    -43, -137,
    15, 12,
    "#8AD783"
  );

  // Frutas o flores.
  paintEllipse(
    -35, -120,
    5, 5,
    PALETTE.pink
  );

  paintEllipse(
    29, -155,
    5, 5,
    PALETTE.yellow
  );

  paintEllipse(
    8, -182,
    4, 4,
    PALETTE.orange
  );

  ctx.restore();
  ctx.restore();
}

/* =====================================================
   9. ARBUSTOS
===================================================== */

function drawBush(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  paintEllipse(
    0, 5,
    43, 12,
    "#335B3940"
  );

  paintEllipse(
    -25, -8,
    27, 24,
    "#3E934D"
  );

  paintEllipse(
    24, -8,
    27, 24,
    "#3E934D"
  );

  paintEllipse(
    0, -20,
    35, 29,
    "#59B866"
  );

  paintEllipse(
    -11, -32,
    18, 12,
    "#85D17C"
  );

  paintEllipse(
    15, -18,
    12, 8,
    "#7DCA75"
  );

  ctx.restore();
}

/* =====================================================
   10. FLORES
===================================================== */

function drawFlower(x, y, color, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Tallo.
  paintLine(
    0, 0,
    0, -16,
    "#3E934D",
    3
  );

  // Hojas.
  paintEllipse(
    -5, -7,
    6, 3,
    "#4FA65A"
  );

  paintEllipse(
    5, -10,
    6, 3,
    "#4FA65A"
  );

  // Pétalos.
  for (let i = 0; i < 5; i++) {
    const angle =
      i * Math.PI * 2 / 5;

    paintEllipse(
      Math.cos(angle) * 7,
      -19 + Math.sin(angle) * 7,
      5, 5,
      color
    );
  }

  paintEllipse(
    0, -19,
    4, 4,
    PALETTE.yellow
  );

  ctx.restore();
}

/* =====================================================
   11. JARDINES DEL MAPA
===================================================== */

function drawGardens(theme, time) {
  // Árboles en las posiciones originales.
  const trees = [
    [100, 410, 1],
    [240, 400, 0.85],
    [490, 410, 1.1],
    [680, 390, 0.95],
    [1140, 410, 1],
    [1320, 390, 0.9],
    [1570, 410, 1.1],
    [1740, 410, 0.9],

    [120, 780, 1],
    [350, 880, 1.1],
    [570, 710, 0.9],
    [1130, 860, 1],
    [1450, 930, 1.1],
    [1680, 760, 0.95]
  ];

  trees.forEach(tree => {
    drawTree(
      tree[0],
      tree[1],
      tree[2],
      time
    );
  });

  const bushes = [
    [180, 650],
    [450, 680],
    [700, 830],
    [1070, 680],
    [1290, 800],
    [1600, 650]
  ];

  bushes.forEach(pos => {
    drawBush(
      pos[0],
      pos[1],
      1.1
    );
  });

  // Flores distribuidas por el césped.
  for (let i = 0; i < 90; i++) {
    const x =
      seed(i + 200) * WORLD_W;

    const y =
      610 + seed(i + 300) * 450;

    // No tapar el camino central.
    if (x > 790 && x < 1040) {
      continue;
    }

    drawFlower(
      x,
      y,
      theme.flowers[
        i % theme.flowers.length
      ],
      0.6 + seed(i + 400) * 0.5
    );
  }
}

/* =====================================================
   12. BANCOS DE MADERA
===================================================== */

function drawBench(x, y) {
  ctx.save();

  // Sombra.
  paintEllipse(
    x + 48,
    y + 47,
    60, 12,
    "#3D463B33"
  );

  // Patas metálicas.
  paintRect(
    x + 12,
    y + 19,
    9, 31,
    "#59616A"
  );

  paintRect(
    x + 76,
    y + 19,
    9, 31,
    "#59616A"
  );

  // Respaldo de madera.
  paintRound(
    x, y - 13,
    96, 15,
    4,
    "#9A613C"
  );

  paintRound(
    x, y + 4,
    96, 14,
    4,
    "#B77948"
  );

  // Asiento.
  paintRound(
    x - 5,
    y + 20,
    106, 13,
    4,
    "#A76A42"
  );

  paintRound(
    x - 5,
    y + 33,
    106, 8,
    3,
    "#875334"
  );

  // Reflejos de madera.
  paintLine(
    x + 7, y - 8,
    x + 88, y - 8,
    "#D69C63",
    2
  );

  paintLine(
    x + 7, y + 9,
    x + 88, y + 9,
    "#E0A36C",
    2
  );

  ctx.restore();
}

/* =====================================================
   13. FAROLAS
===================================================== */

function drawLamp(x, y, time) {
  // Sombra.
  paintEllipse(
    x, y + 4,
    24, 8,
    "#364E5044"
  );

  // Poste.
  paintRound(
    x - 6,
    y - 123,
    12, 126,
    4,
    "#57646B"
  );

  paintRect(
    x - 2,
    y - 116,
    3, 107,
    "#8D9AA0"
  );

  // Lámpara.
  paintRound(
    x - 22,
    y - 151,
    44, 13,
    5,
    "#59636A"
  );

  paintRound(
    x - 17,
    y - 140,
    34, 31,
    5,
    "#FFE4A0"
  );

  paintRound(
    x - 20,
    y - 113,
    40, 8,
    3,
    "#59636A"
  );

  // Luz suave.
  const glow =
    0.10 +
    Math.sin(time * 0.002 + x) * 0.03;

  ctx.beginPath();
  ctx.arc(
    x,
    y - 125,
    49,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    `rgba(255, 220, 115, ${glow})`;

  ctx.fill();
}

/* =====================================================
   14. FUENTE DE AGUA ANIMADA
===================================================== */

function drawFountain(x, y, time) {
  ctx.save();
  ctx.translate(x, y);

  // Sombra.
  paintEllipse(
    0, 24,
    100, 35,
    "#425A5B33"
  );

  // Base de piedra.
  paintEllipse(
    0, 15,
    94, 39,
    "#9C9F9C"
  );

  paintEllipse(
    0, 8,
    88, 34,
    "#F2E2C7"
  );

  // Agua.
  paintEllipse(
    0, 5,
    76, 27,
    "#3BA9D0"
  );

  paintEllipse(
    0, 1,
    65, 21,
    PALETTE.sky
  );

  // Pilar central.
  paintRound(
    -13, -45,
    26, 52,
    6,
    "#B8B5A7"
  );

  paintRound(
    -10, -43,
    20, 47,
    5,
    "#E7DDC8"
  );

  // Chorros animados.
  const bounce =
    Math.sin(time * 0.004) * 8;

  for (let i = -2; i <= 2; i++) {
    const dx = i * 17;

    ctx.beginPath();
    ctx.moveTo(0, -42);

    ctx.quadraticCurveTo(
      dx,
      -100 - bounce,
      dx * 2,
      -22
    );

    ctx.strokeStyle = "#D5F7FF";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();

    paintEllipse(
      dx * 2,
      -22 + Math.sin(
        time * 0.006 + i
      ) * 5,
      4, 5,
      "#FFFFFF"
    );
  }

  ctx.restore();
}

/* =====================================================
   15. DISTRITO NEÓN
===================================================== */

function drawDistrictDecor(theme, time) {
  drawBuilding(
    90, 70,
    290, 260,
    PALETTE.pink,
    "#A76547",
    "CLUB JUVENIL"
  );

  drawBuilding(
    480, 55,
    300, 280,
    PALETTE.yellow,
    "#B06E48",
    "BIBLIOTECA"
  );

  drawBuilding(
    1090, 65,
    310, 270,
    PALETTE.sky,
    "#A86D50",
    "CENTRO DIGITAL"
  );

  drawBuilding(
    1480, 95,
    230, 240,
    PALETTE.orange,
    "#A95F43",
    "CAFÉ"
  );

  drawBench(200, 630);
  drawBench(580, 640);
  drawBench(1230, 620);

  drawLamp(420, 560, time);
  drawLamp(1050, 560, time);
  drawLamp(1520, 570, time);
}

/* =====================================================
   16. PLAZA DEL ENCUENTRO
===================================================== */

function drawPlazaDecor(theme, time) {
  drawBuilding(
    80, 70,
    340, 260,
    "#F6B36E",
    "#A96948",
    "CENTRO CULTURAL"
  );

  drawBuilding(
    520, 65,
    260, 270,
    PALETTE.yellow,
    "#9F6647",
    "ASAMBLEA"
  );

  drawBuilding(
    1110, 70,
    310, 260,
    PALETTE.sky,
    "#A36A4B",
    "COMUNIDAD"
  );

  drawBuilding(
    1500, 95,
    220, 240,
    PALETTE.pink,
    "#A45E47",
    "ARTE"
  );

  drawFountain(
    915, 505,
    time
  );

  drawBench(180, 660);
  drawBench(520, 680);
  drawBench(1280, 660);
  drawBench(1530, 800);

  drawLamp(450, 560, time);
  drawLamp(1110, 560, time);
}

/* =====================================================
   17. ARCHIVO DE LA MEMORIA
===================================================== */

function drawMemoryDecor(theme, time) {
  drawBuilding(
    70, 60,
    350, 280,
    "#DFB28F",
    "#8F6045",
    "ARCHIVO"
  );

  drawBuilding(
    510, 60,
    280, 275,
    "#9ACBDD",
    "#956A50",
    "TESTIMONIOS"
  );

  drawBuilding(
    1080, 60,
    350, 280,
    PALETTE.beige,
    "#98633D",
    "MEMORIA"
  );

  drawBuilding(
    1500, 95,
    230, 240,
    "#A4D5A3",
    "#906B4B",
    "PAZ"
  );

  // Jardín central.
  paintEllipse(
    915, 505,
    119, 80,
    "#4D9E58"
  );

  paintEllipse(
    915, 505,
    105, 69,
    "#8DD184"
  );

  // Monumento simbólico.
  paintRound(
    882, 436,
    66, 105,
    7,
    "#B7A78F"
  );

  paintRound(
    889, 440,
    52, 92,
    5,
    "#F0E5D1"
  );

  paintOutline(
    889, 440,
    52, 92,
    5,
    "#9B846A",
    2
  );

  paintText(
    "PAZ",
    915, 474,
    17,
    "#77543C"
  );

  paintText(
    "MEMORIA",
    915, 501,
    10,
    "#77543C"
  );

  drawBench(180, 670);
  drawBench(1280, 670);

  drawLamp(450, 560, time);
  drawLamp(1110, 560, time);
}

/* =====================================================
   18. PARTÍCULAS DECORATIVAS
===================================================== */

function drawSparkles(time) {
  ctx.save();

  for (let i = 0; i < 22; i++) {
    const x =
      seed(i + 700) * WORLD_W;

    const y =
      360 + seed(i + 800) * 700;

    const pulse =
      0.35 +
      Math.sin(time * 0.003 + i) * 0.25;

    ctx.globalAlpha = Math.max(
      0.05,
      pulse
    );

    paintEllipse(
      x,
      y + Math.sin(
        time * 0.002 + i
      ) * 5,
      2.5,
      2.5,
      "#FFFFFF"
    );
  }

  ctx.restore();
}

/* =====================================================
   19. RENDERIZAR EL ESCENARIO COMPLETO
===================================================== */

function drawBackground(time) {
  const theme = getWorldTheme();

  ctx.save();

  // 1. Cielo y paisaje.
  drawSky(theme);
  drawAnimatedClouds(time);

  // 2. Terreno y caminos.
  drawGround(theme);

  // 3. Edificios de cada zona.
  if (currentLevel === 0) {
    drawDistrictDecor(theme, time);

  } else if (currentLevel === 1) {
    drawPlazaDecor(theme, time);

  } else {
    drawMemoryDecor(theme, time);
  }

  // 4. Árboles, arbustos y flores.
  drawGardens(theme, time);

  // 5. Efectos decorativos.
  drawSparkles(time);

  ctx.restore();
}

/* =====================================================
   FIN DE LA PARTE 3

   CONTINUAR CON LA PARTE 4:
   PERSONAJES, ANIMACIONES Y MOVIMIENTO
===================================================== */

/* =====================================================
   FUTURE QUEST — ARCADE RPG EDITION
   GAME.JS — PARTE 4

   PERSONAJES RPG, ANIMACIONES Y MOVIMIENTO
===================================================== */

/* =====================================================
   1. CONTROLES DEL TECLADO
===================================================== */

const movementKeys = {
  up: ["arrowup", "w"],
  down: ["arrowdown", "s"],
  left: ["arrowleft", "a"],
  right: ["arrowright", "d"]
};

function isMoving(direction) {
  return movementKeys[direction].some(
    key => keys[key] === true
  ) || touch[direction] === true;
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  const controlKeys = [
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "w", "a", "s", "d",
    "e", "enter", " "
  ];

  const activeTag =
    document.activeElement?.tagName;

  if (
    controlKeys.includes(key) &&
    activeTag !== "INPUT" &&
    activeTag !== "TEXTAREA"
  ) {
    event.preventDefault();
  }

  keys[key] = true;

  // Interactuar con E o Enter.
  if (
    (key === "e" || key === "enter") &&
    !event.repeat &&
    screen === "game"
  ) {
    if (typeof interact === "function") {
      interact();
    }
  }
});

document.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });

  Object.keys(touch).forEach(key => {
    touch[key] = false;
  });
});

/* =====================================================
   2. MOVIMIENTO DEL JUGADOR

   Se mantiene la velocidad y el sistema
   de movimiento de FUTURE QUEST 2.0.
===================================================== */

function updatePlayer(dt = 1) {
  if (screen !== "game") {
    player.moving = false;
    return;
  }

  if (
    document.querySelector(
      ".modal-screen.open"
    )
  ) {
    player.moving = false;
    return;
  }

  let dx = 0;
  let dy = 0;

  if (isMoving("left")) dx -= 1;
  if (isMoving("right")) dx += 1;
  if (isMoving("up")) dy -= 1;
  if (isMoving("down")) dy += 1;

  player.moving =
    dx !== 0 || dy !== 0;

  if (!player.moving) {
    return;
  }

  // Evitar mayor velocidad en diagonal.
  const length = Math.hypot(dx, dy);

  dx /= length;
  dy /= length;

  const speed =
    player.speed * Math.min(dt, 2);

  player.x = clamp(
    player.x + dx * speed,
    35,
    WORLD_W - 35
  );

  player.y = clamp(
    player.y + dy * speed,
    80,
    WORLD_H - 30
  );

  // Dirección horizontal.
  if (dx !== 0) {
    player.direction =
      dx > 0 ? 1 : -1;
  }

  // Dirección visual del personaje.
  if (Math.abs(dy) > Math.abs(dx)) {
    player.facing =
      dy < 0 ? "up" : "down";

  } else if (dx !== 0) {
    player.facing =
      dx > 0 ? "right" : "left";
  }

  player.frame += dt * 0.18;
}

/* =====================================================
   3. UTILIDADES VISUALES DE PERSONAJES
===================================================== */

function drawCharacterShadow(
  x, y, scale = 1
) {
  paintEllipse(
    x,
    y + 3,
    24 * scale,
    8 * scale,
    "rgba(45, 55, 48, 0.27)"
  );
}

function drawCharacterSparkle(
  x, y, time, color
) {
  const pulse =
    0.55 +
    Math.sin(time * 0.004) * 0.30;

  ctx.save();
  ctx.globalAlpha = pulse;

  paintEllipse(
    x, y,
    3, 8,
    color
  );

  paintEllipse(
    x, y,
    8, 3,
    color
  );

  ctx.restore();
}

/* =====================================================
   4. ETIQUETAS DE PERSONAJES
===================================================== */

function drawCharacterLabel(
  name, x, y, accent
) {
  const width = Math.max(
    86,
    name.length * 11 + 30
  );

  // Sombra.
  paintRound(
    x - width / 2 + 2,
    y + 4,
    width,
    27,
    8,
    "#65432E55"
  );

  // Fondo beige.
  paintRound(
    x - width / 2,
    y,
    width,
    27,
    8,
    PALETTE.beigeLight
  );

  // Contorno.
  paintOutline(
    x - width / 2,
    y,
    width,
    27,
    8,
    accent,
    2
  );

  paintText(
    name,
    x,
    y + 13,
    13,
    PALETTE.ink
  );
}

/* =====================================================
   5. PERSONAJE RPG REUTILIZABLE

   Esta función dibuja al jugador y a los NPC.
   Cada personaje tendrá su propia ropa,
   cabello, colores y accesorios.
===================================================== */

function drawRPGCharacter(
  x,
  y,
  options = {}
) {
  const {
    skin = "#E9B28F",
    hair = "#684A35",
    shirt = PALETTE.yellow,
    pants = "#4B7596",
    shoes = "#F5F1E7",
    backpack = PALETTE.orange,

    facing = "down",
    walk = 0,
    bounce = 0,

    accessory = "none",
    isPlayer = false
  } = options;

  ctx.save();

  ctx.translate(
    x,
    y - bounce
  );

  // Reflejar el personaje al caminar
  // hacia la izquierda.
  if (facing === "left") {
    ctx.scale(-1, 1);
  }

  const backView =
    facing === "up";

  const sideView =
    facing === "left" ||
    facing === "right";

  /* ---------------------------------------------------
     PIERNAS Y ZAPATOS
  --------------------------------------------------- */

  const legSwing = walk * 0.22;

  // Pierna izquierda.
  ctx.save();
  ctx.translate(-9, -21);
  ctx.rotate(legSwing);

  paintRound(
    -6, 0,
    13, 25,
    4,
    pants
  );

  paintRound(
    -8, 19,
    18, 10,
    4,
    shoes
  );

  paintRect(
    -8, 26,
    18, 3,
    "#665D57"
  );

  ctx.restore();

  // Pierna derecha.
  ctx.save();
  ctx.translate(9, -21);
  ctx.rotate(-legSwing);

  paintRound(
    -6, 0,
    13, 25,
    4,
    pants
  );

  paintRound(
    -8, 19,
    18, 10,
    4,
    shoes
  );

  paintRect(
    -8, 26,
    18, 3,
    "#665D57"
  );

  ctx.restore();

  /* ---------------------------------------------------
     MOCHILA
  --------------------------------------------------- */

  if (isPlayer) {
    paintRound(
      backView ? -20 : -25,
      -57,
      backView ? 40 : 45,
      42,
      9,
      backpack
    );

    paintOutline(
      backView ? -20 : -25,
      -57,
      backView ? 40 : 45,
      42,
      9,
      "#89543B",
      2
    );

    if (backView) {
      paintRound(
        -13, -38,
        26, 16,
        5,
        "#FFC46E"
      );

      paintLine(
        -12, -51,
        12, -51,
        "#FFE0A1",
        3
      );
    }
  }

  /* ---------------------------------------------------
     BRAZOS ANIMADOS
  --------------------------------------------------- */

  ctx.save();

  ctx.translate(
    -20,
    -51
  );

  ctx.rotate(-walk * 0.15);

  paintRound(
    -6, 0,
    13, 32,
    6,
    skin
  );

  // Manga.
  paintRound(
    -7, -2,
    15, 13,
    5,
    shirt
  );

  ctx.restore();

  ctx.save();

  ctx.translate(
    20,
    -51
  );

  ctx.rotate(walk * 0.15);

  paintRound(
    -7, 0,
    13, 32,
    6,
    skin
  );

  paintRound(
    -8, -2,
    15, 13,
    5,
    shirt
  );

  ctx.restore();

  /* ---------------------------------------------------
     CAMISETA
  --------------------------------------------------- */

  paintRound(
    -20, -57,
    40, 43,
    8,
    "#65432E"
  );

  paintRound(
    -18, -55,
    36, 39,
    7,
    shirt
  );

  // Sombra lateral.
  paintRound(
    11, -52,
    6, 32,
    3,
    "#65432E33"
  );

  // Cuello.
  paintRound(
    -7, -63,
    14, 13,
    4,
    skin
  );

  if (!backView) {
    // Insignia de la camiseta.
    paintEllipse(
      0, -37,
      8, 8,
      PALETTE.beigeLight
    );

    paintText(
      isPlayer ? "★" : "✦",
      0, -37,
      11,
      isPlayer
        ? PALETTE.orange
        : PALETTE.greenDark
    );
  }

  /* ---------------------------------------------------
     CABEZA
  --------------------------------------------------- */

  // Orejas.
  paintEllipse(
    -21, -78,
    6, 9,
    skin
  );

  paintEllipse(
    21, -78,
    6, 9,
    skin
  );

  // Contorno de la cabeza.
  paintEllipse(
    0, -79,
    24, 27,
    "#845B43"
  );

  paintEllipse(
    0, -80,
    22, 25,
    skin
  );

  // Iluminación.
  if (!backView) {
    paintEllipse(
      -12, -87,
      6, 8,
      "#FFFFFF22"
    );
  }

  /* ---------------------------------------------------
     CABELLO
  --------------------------------------------------- */

  if (backView) {
    // Cabello visto desde atrás.
    paintEllipse(
      0, -89,
      24, 23,
      hair
    );

    paintRound(
      -22, -95,
      44, 27,
      9,
      hair
    );

    paintEllipse(
      -13, -104,
      13, 10,
      hair
    );

  } else {
    // Parte superior.
    paintEllipse(
      0, -99,
      24, 15,
      hair
    );

    // Flequillo.
    paintPolygon([
      [-22, -98],
      [-10, -108],
      [-3, -91],
      [8, -104],
      [21, -96],
      [16, -88],
      [-18, -87]
    ], hair);

    // Laterales.
    paintEllipse(
      -20, -88,
      7, 14,
      hair
    );

    paintEllipse(
      19, -89,
      7, 13,
      hair
    );

    /* -------------------------------------------------
       ROSTRO
    ------------------------------------------------- */

    if (sideView) {
      paintEllipse(
        9, -80,
        3, 4,
        "#34434B"
      );

      paintEllipse(
        15, -72,
        5, 3,
        "#E99191"
      );

      paintLine(
        9, -67,
        14, -68,
        "#9E5B53",
        2
      );

    } else {
      // Ojos.
      paintEllipse(
        -8, -80,
        3, 4,
        "#34434B"
      );

      paintEllipse(
        8, -80,
        3, 4,
        "#34434B"
      );

      // Brillos de ojos.
      paintEllipse(
        -9, -82,
        1, 1,
        "#FFFFFF"
      );

      paintEllipse(
        7, -82,
        1, 1,
        "#FFFFFF"
      );

      // Mejillas.
      paintEllipse(
        -15, -72,
        5, 3,
        "#E99191"
      );

      paintEllipse(
        15, -72,
        5, 3,
        "#E99191"
      );

      // Sonrisa.
      ctx.beginPath();

      ctx.arc(
        0, -73,
        5,
        0.2,
        Math.PI - 0.2
      );

      ctx.strokeStyle = "#9E5B53";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }

  /* ---------------------------------------------------
     ACCESORIOS DIFERENCIADOS
  --------------------------------------------------- */

  if (accessory === "headband") {
    paintRound(
      -21, -99,
      42, 6,
      3,
      PALETTE.pink
    );

    paintEllipse(
      15, -98,
      6, 6,
      PALETTE.yellow
    );
  }

  if (accessory === "glasses" && !backView) {
    ctx.save();

    ctx.strokeStyle = "#65432E";
    ctx.lineWidth = 2.5;

    ctx.strokeRect(
      -16, -85,
      13, 11
    );

    ctx.strokeRect(
      3, -85,
      13, 11
    );

    paintLine(
      -3, -80,
      3, -80,
      "#65432E",
      2
    );

    ctx.restore();
  }

  if (accessory === "hairclip") {
    paintRound(
      12, -100,
      13, 5,
      2,
      PALETTE.yellow
    );
  }

  if (accessory === "cap") {
    paintEllipse(
      0, -103,
      24, 13,
      PALETTE.orange
    );

    paintRound(
      3, -100,
      28, 7,
      3,
      "#C66A34"
    );
  }

  ctx.restore();
}

/* =====================================================
   6. PERSONAJE PRINCIPAL
===================================================== */

function drawPlayer(time) {
  const walk = player.moving
    ? Math.sin(player.frame * 2.4)
    : 0;

  const bounce = player.moving
    ? Math.abs(walk) * 3
    : Math.sin(time * 0.002) * 1.2;

  drawCharacterShadow(
    player.x,
    player.y
  );

  drawRPGCharacter(
    player.x,
    player.y,
    {
      skin: player.skin,
      hair: player.hair,
      shirt: player.color,
      pants: player.pants,
      shoes: player.shoes,
      backpack: player.backpack,

      facing: player.facing,
      walk,
      bounce,

      accessory: "cap",
      isPlayer: true
    }
  );

  drawCharacterLabel(
    "TÚ",
    player.x,
    player.y - 137 - bounce,
    PALETTE.orange
  );
}

/* =====================================================
   7. PERSONAJES NPC

   LUNA: cinta rosada.
   MATEO: lentes.
   SOFÍA: accesorio amarillo en el cabello.
===================================================== */

function drawNPC(npc, time) {
  if (!npc) return;

  const bounce =
    Math.sin(
      time * 0.002 +
      npc.x * 0.01
    ) * 1.8;

  drawCharacterShadow(
    npc.x,
    npc.y
  );

  let accessory = "none";

  if (npc.name === "LUNA") {
    accessory = "headband";

  } else if (npc.name === "MATEO") {
    accessory = "glasses";

  } else if (npc.name === "SOFÍA") {
    accessory = "hairclip";
  }

  drawRPGCharacter(
    npc.x,
    npc.y,
    {
      skin: npc.skin,
      hair: npc.hair,
      shirt: npc.shirt,

      pants: "#55778D",
      shoes: "#F4E9D8",

      facing: "down",
      walk: 0,
      bounce,

      accessory,
      isPlayer: false
    }
  );

  drawCharacterLabel(
    npc.name,
    npc.x,
    npc.y - 145 - bounce,
    npc.color
  );

  // Señal de interacción.
  const floatY =
    Math.sin(time * 0.004) * 5;

  paintEllipse(
    npc.x,
    npc.y - 172 + floatY,
    15, 15,
    npc.color
  );

  paintEllipse(
    npc.x - 4,
    npc.y - 177 + floatY,
    4, 3,
    "#FFFFFF88"
  );

  paintText(
    "!",
    npc.x,
    npc.y - 172 + floatY,
    19,
    "#FFFFFF"
  );
}

/* =====================================================
   8. OBJETOS INTERACTIVOS

   Estilo de pequeñas estaciones RPG.
   Los objetos completados se vuelven verdes.
===================================================== */

function drawObject(obj, time) {
  if (!obj) return;

  const done = isCompleted(obj.id);

  const bounce =
    Math.sin(
      time * 0.003 +
      obj.x * 0.01
    ) * 4;

  const x = obj.x;
  const y = obj.y;

  // Sombra.
  paintEllipse(
    x,
    y + 5,
    35, 11,
    "#3E4A4144"
  );

  // Base de piedra.
  paintEllipse(
    x,
    y - 6,
    36, 18,
    "#BDA88A"
  );

  paintEllipse(
    x,
    y - 10,
    32, 14,
    PALETTE.beigeLight
  );

  const mainColor = done
    ? PALETTE.green
    : PALETTE.orange;

  const lightColor = done
    ? PALETTE.greenLight
    : PALETTE.yellow;

  // Cuerpo del objeto.
  paintRound(
    x - 25,
    y - 67 + bounce,
    50, 50,
    8,
    "#76513B"
  );

  paintRound(
    x - 22,
    y - 70 + bounce,
    44, 46,
    7,
    mainColor
  );

  // Cara iluminada.
  paintRound(
    x - 18,
    y - 66 + bounce,
    36, 36,
    5,
    lightColor
  );

  // Icono.
  paintText(
    done ? "✓" : obj.icon,
    x,
    y - 48 + bounce,
    26,
    PALETTE.ink
  );

  // Destello.
  if (!done) {
    drawCharacterSparkle(
      x + 26,
      y - 80 + bounce,
      time,
      PALETTE.yellow
    );
  }

  // Etiqueta.
  const width = Math.max(
    130,
    obj.label.length * 8 + 24
  );

  paintRound(
    x - width / 2,
    y + 17,
    width, 27,
    7,
    PALETTE.beigeLight
  );

  paintOutline(
    x - width / 2,
    y + 17,
    width, 27,
    7,
    done
      ? PALETTE.greenDark
      : "#A56A45",
    2
  );

  paintText(
    obj.label,
    x,
    y + 30,
    11,
    PALETTE.ink
  );
}

/* =====================================================
   9. MISIONES SECUNDARIAS
===================================================== */

function drawSideQuest(quest, time) {
  if (!quest) return;

  const done =
    isSideQuestCompleted(quest.id);

  const bounce =
    Math.sin(
      time * 0.004 +
      quest.x
    ) * 4;

  const x = quest.x;
  const y = quest.y;

  // Sombra.
  paintEllipse(
    x,
    y + 6,
    35, 11,
    "#3E4A4144"
  );

  // Base.
  paintEllipse(
    x,
    y - 8,
    36, 16,
    "#C4A98A"
  );

  // Contorno.
  paintRound(
    x - 27,
    y - 70 + bounce,
    54, 54,
    10,
    "#86573C"
  );

  // Cuerpo.
  paintRound(
    x - 24,
    y - 73 + bounce,
    48, 49,
    9,
    done
      ? PALETTE.green
      : PALETTE.pink
  );

  // Icono.
  paintText(
    done ? "✓" : quest.icon,
    x,
    y - 49 + bounce,
    29,
    "#FFFFFF"
  );

  // Estrella flotante.
  if (!done) {
    drawCharacterSparkle(
      x + 27,
      y - 83 + bounce,
      time,
      PALETTE.yellow
    );
  }

  const width = Math.max(
    145,
    quest.label.length * 8 + 24
  );

  paintRound(
    x - width / 2,
    y + 18,
    width, 27,
    7,
    PALETTE.beigeLight
  );

  paintOutline(
    x - width / 2,
    y + 18,
    width, 27,
    7,
    done
      ? PALETTE.greenDark
      : PALETTE.pinkDark,
    2
  );

  paintText(
    quest.label,
    x,
    y + 31,
    11,
    PALETTE.ink
  );
}

/* =====================================================
   10. CÁMARA DEL JUEGO

   Sigue al jugador y se mantiene
   dentro de los límites del mapa.
===================================================== */

function updateCamera() {
  if (!canvas) return;

  const viewWidth = canvas.width;
  const viewHeight = canvas.height;

  camera.x = clamp(
    player.x - viewWidth / 2,
    0,
    Math.max(
      0,
      WORLD_W - viewWidth
    )
  );

  camera.y = clamp(
    player.y - viewHeight / 2,
    0,
    Math.max(
      0,
      WORLD_H - viewHeight
    )
  );
}

/* =====================================================
   FIN DE LA PARTE 4

   CONTINUAR CON LA PARTE 5:
   DIÁLOGOS, INTERACCIONES Y MINIJUEGOS
===================================================== */

/* =====================================================
   FUTURE QUEST — ARCADE RPG EDITION
   GAME.JS — PARTE 5

   INTERACCIONES, DIÁLOGOS Y MINIJUEGOS
===================================================== */

/* =====================================================
   1. ESTADO DE LOS DESAFÍOS
===================================================== */

let fqChallenge = null;
let fqModalLocked = false;
let fqMemoryTimer = null;

/* =====================================================
   2. UTILIDADES DE SEGURIDAD Y MODALES
===================================================== */

function escapeGameHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getGameModal() {
  let modal = $("futureQuestModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "futureQuestModal";
    document.body.appendChild(modal);
  }

  return modal;
}

function isGameModalOpen() {
  return getGameModal().classList.contains("open");
}

function showGameModal(content) {
  const modal = getGameModal();

  modal.innerHTML = `
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-label="Desafío de Future Quest"
    >
      <button
        class="modal-close"
        type="button"
        aria-label="Cerrar"
        data-fq-close
      >×</button>

      <div class="fq-modal-content">
        ${content}
      </div>
    </div>
  `;

  modal.classList.add("open");
  modal.style.display = "flex";

  const closeButton =
    modal.querySelector("[data-fq-close]");

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeGameModal
    );
  }
}

function closeGameModal() {
  if (fqMemoryTimer !== null) {
    clearTimeout(fqMemoryTimer);
    fqMemoryTimer = null;
  }

  const modal = getGameModal();

  modal.classList.remove("open");
  modal.style.display = "none";
  modal.innerHTML = "";

  activeObject = null;
  activeDialogue = null;

  fqChallenge = null;
  fqModalLocked = false;
  memoryLocked = false;
}

/* =====================================================
   3. PLANTILLAS DE MODAL
===================================================== */

function fqModalLayout({
  icon = "✨",
  title = "",
  description = "",
  body = ""
}) {
  return `
    <div class="modal-icon">
      ${escapeGameHTML(icon)}
    </div>

    <h2>${escapeGameHTML(title)}</h2>

    <p class="modal-description">
      ${escapeGameHTML(description)}
    </p>

    ${body}
  `;
}

function fqButton(
  text,
  action,
  className = "primary-button"
) {
  return `
    <button
      type="button"
      class="${className}"
      data-fq-action="${escapeGameHTML(action)}"
    >
      ${escapeGameHTML(text)}
    </button>
  `;
}

function fqSetModalBody(html) {
  const content = document.querySelector(
    "#futureQuestModal .fq-modal-content"
  );

  if (content) {
    content.innerHTML = html;
  }
}

/* =====================================================
   4. RETROALIMENTACIÓN
===================================================== */

function showGameFeedback(
  message,
  success = true
) {
  const content = document.querySelector(
    "#futureQuestModal .fq-modal-content"
  );

  if (!content) return;

  let feedback = content.querySelector(
    ".modal-feedback"
  );

  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "modal-feedback";
    content.appendChild(feedback);
  }

  feedback.className =
    "modal-feedback" +
    (success ? "" : " error");

  feedback.textContent = message;
}

/* =====================================================
   5. BUSCAR OBJETO CERCANO

   Distancias de interacción:
   - NPC: 125 px
   - Objetivos: 115 px
   - Misiones secundarias: 115 px
===================================================== */

function nearestTarget() {
  const targets = [];

  const npc = getNPC();

  if (npc) {
    targets.push({
      type: "npc",
      data: npc,
      radius: 125
    });
  }

  const mission = getMission();

  if (mission) {
    mission.objects.forEach(object => {
      targets.push({
        type: "object",
        data: object,
        radius: 115
      });
    });
  }

  const sideQuest = getSideQuest();

  if (sideQuest) {
    targets.push({
      type: "sideQuest",
      data: sideQuest,
      radius: 115
    });
  }

  let nearest = null;
  let nearestDistance = Infinity;

  targets.forEach(target => {
    const d = distance(
      player,
      target.data
    );

    if (
      d <= target.radius &&
      d < nearestDistance
    ) {
      nearest = target;
      nearestDistance = d;
    }
  });

  return nearest;
}

/* =====================================================
   6. INTERACTUAR
===================================================== */

function interact() {}
  function interact() {
  if (screen !== "game") return;

  if (isGameModalOpen()) return;

  if (fqCurrentPanel !== null) return;

  const target = nearestTarget();

  if (!target) {
    return;
  }

  if (target.type === "npc") {
    openNPCDialogue(target.data);
    return;
  }

  if (target.type === "object") {
    openObjective(target.data);
    return;
  }

  if (target.type === "sideQuest") {
    openSideQuest(target.data);
  }
}

/* =====================================================
   7. DIÁLOGOS DE NPC
===================================================== */

function openNPCDialogue(npc) {
  activeDialogue = npc;
  dialogueIndex = 0;

  const dialogue = isMissionCompleted()
    ? npc.completedDialogue
    : npc.dialogue;

  activeDialogue.lines = dialogue;

  renderNPCDialogue();
}

function renderNPCDialogue() {
  const npc = activeDialogue;

  if (!npc) return;

  const lines = npc.lines || [];

  const line =
    lines[dialogueIndex] || "";

  const isLast =
    dialogueIndex >= lines.length - 1;

  const html = `
    <div class="dialogue-person">
      <div class="dialogue-avatar">
        ${npc.name === "LUNA"
          ? "🌸"
          : npc.name === "MATEO"
            ? "📘"
            : "🌿"}
      </div>

      <div>
        <div class="dialogue-name">
          ${escapeGameHTML(npc.name)}
        </div>

        <div class="dialogue-role">
          ${escapeGameHTML(npc.role)}
        </div>
      </div>
    </div>

    <h2>
      ${escapeGameHTML(npc.name)}
    </h2>

    <p class="modal-description">
      ${escapeGameHTML(line)}
    </p>

    <div class="modal-actions">
      ${fqButton(
        isLast ? "¡ENTENDIDO!" : "CONTINUAR →",
        "dialogue-next"
      )}
    </div>
  `;

  showGameModal(html);
}

function nextNPCDialogue() {
  if (!activeDialogue) return;

  dialogueIndex++;

  if (
    dialogueIndex >=
    activeDialogue.lines.length
  ) {
    closeGameModal();
    return;
  }

  renderNPCDialogue();
}

/* =====================================================
   8. ABRIR OBJETIVOS
===================================================== */

function openObjective(object) {
  activeObject = object;

  if (isCompleted(object.id)) {
    showGameModal(
      fqModalLayout({
        icon: "✅",
        title: "MISIÓN COMPLETADA",
        description:
          "Ya superaste este desafío. ¡Buen trabajo!",
        body: `
          <div class="modal-actions">
            ${fqButton(
              "CONTINUAR EXPLORANDO",
              "close"
            )}
          </div>
        `
      })
    );

    return;
  }

  switch (object.kind) {
    case "clue":
      openClue(object);
      break;

    case "choice":
      openChoice(object);
      break;

    case "sequence":
      openSequence(object);
      break;

    case "memory":
      openMemory(object);
      break;

    default:
      showGameModal(
        fqModalLayout({
          icon: "❔",
          title: "DESAFÍO",
          description:
            "Este desafío no está disponible.",
          body: fqButton("VOLVER", "close")
        })
      );
  }
}

/* =====================================================
   9. RECOMPENSAS Y PROGRESO
===================================================== */

function finishObjective(object) {
  if (!object) return false;

  if (completed.has(object.id)) {
    return false;
  }

  completed.add(object.id);

  xp += Number(object.reward) || 0;

  if (
    object.item &&
    !inventory.includes(object.item)
  ) {
    inventory.push(object.item);
  }

  if (typeof saveGame === "function") {
    saveGame();
  }

  if (typeof updateGameUI === "function") {
    updateGameUI();
  }

  return true;
}

function finishSideQuest(quest) {
  if (!quest) return false;

  if (completedSideQuests.has(quest.id)) {
    return false;
  }

  completedSideQuests.add(quest.id);

  xp += Number(quest.reward) || 0;

  if (
    quest.item &&
    !inventory.includes(quest.item)
  ) {
    inventory.push(quest.item);
  }

  if (typeof saveGame === "function") {
    saveGame();
  }

  if (typeof updateGameUI === "function") {
    updateGameUI();
  }

  return true;
}

function showObjectiveReward(
  object,
  isSideQuest = false
) {
  const reward = Number(object.reward) || 0;

  const successMessage =
    object.success ||
    "¡Excelente trabajo!";

  showGameModal(
    fqModalLayout({
      icon: "🏆",

      title: "¡DESAFÍO SUPERADO!",

      description: successMessage,

      body: `
        <div class="modal-feedback">
          ⭐ +${reward} XP

          ${object.item
            ? `<p>🎒 Objeto obtenido:
              <strong>
                ${escapeGameHTML(object.item)}
              </strong>
            </p>`
            : ""}
        </div>

        <div class="modal-actions">
          ${fqButton(
            "¡GENIAL! CONTINUAR",
            "reward-close"
          )}
        </div>
      `
    })
  );

  if (!isSideQuest) {
    checkLevelCompletion();
  }
}

/* =====================================================
   10. PISTAS Y DOCUMENTOS
===================================================== */

function openClue(object) {
  showGameModal(
    fqModalLayout({
      icon: "📜",

      title: object.title,

      description: object.description,

      body: `
        <div class="modal-actions">
          ${fqButton(
            "GUARDAR PISTA",
            "collect-clue"
          )}

          ${fqButton(
            "VOLVER",
            "close",
            "secondary-button"
          )}
        </div>
      `
    })
  );
}

function collectClue() {
  const object = activeObject;

  if (!object) return;

  const added = finishObjective(object);

  if (!added) {
    closeGameModal();
    return;
  }

  showObjectiveReward(object);
}

/* =====================================================
   11. DESAFÍOS DE DECISIONES
===================================================== */

function openChoice(object) {
  fqChallenge = {
    type: "choice",
    object,
    isSideQuest: false
  };

  renderChoice();
}

function renderChoice() {
  const challenge = fqChallenge;

  if (!challenge) return;

  const object = challenge.object;

  const options = object.options || [];

  const buttons = options.map(
    (option, index) => `
      <button
        type="button"
        class="action-button"
        data-fq-choice="${index}"
      >
        ${escapeGameHTML(option.text)}
      </button>
    `
  ).join("");

  showGameModal(
    fqModalLayout({
      icon: "💭",

      title: object.title,

      description: object.description,

      body: `
        <div class="sidebar-label">
          ELIGE LA MEJOR RESPUESTA
        </div>

        ${buttons}

        <div class="modal-actions">
          ${fqButton(
            "VOLVER",
            "close",
            "secondary-button"
          )}
        </div>
      `
    })
  );
}

function submitChoice(index) {
  const challenge = fqChallenge;

  if (!challenge || fqModalLocked) {
    return;
  }

  const object = challenge.object;

  const option = object.options[index];

  if (!option) return;

  if (!option.correct) {
    showGameFeedback(
      "Esa respuesta no es la más adecuada. Piensa en el respeto, la empatía y los derechos de todas las personas. ¡Inténtalo otra vez!",
      false
    );

    return;
  }

  fqModalLocked = true;

  if (challenge.isSideQuest) {
    finishSideQuest(object);
    showObjectiveReward(object, true);

  } else {
    finishObjective(object);
    showObjectiveReward(object);
  }
}

/* =====================================================
   12. DESAFÍOS DE SECUENCIAS
===================================================== */

function openSequence(object) {
  activeObject = object;

  fqChallenge = {
    type: "sequence",
    object
  };

  sequenceSelection = [];

  renderSequence();
}

function renderSequence() {
  const challenge = fqChallenge;

  if (!challenge) return;

  const object = challenge.object;

  const parts = object.parts || [];

  // Mostrar las opciones en un orden mezclado,
  // pero estable durante este intento.
  if (!challenge.shuffled) {
    challenge.shuffled = parts.map(
      (_, index) => index
    );

    for (
      let i = challenge.shuffled.length - 1;
      i > 0;
      i--
    ) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [
        challenge.shuffled[i],
        challenge.shuffled[j]
      ] = [
        challenge.shuffled[j],
        challenge.shuffled[i]
      ];
    }
  }

  const available = challenge.shuffled
    .filter(
      index => !sequenceSelection.includes(index)
    );

  const optionsHTML = available.map(
    index => `
      <button
        type="button"
        class="action-button"
        data-fq-sequence="${index}"
      >
        ${escapeGameHTML(parts[index])}
      </button>
    `
  ).join("");

  const selectedHTML = sequenceSelection.map(
    (index, position) => `
      <span>
        ${position + 1}.
        ${escapeGameHTML(parts[index])}
      </span>
    `
  ).join("");

  showGameModal(
    fqModalLayout({
      icon: "🧩",

      title: object.title,

      description: object.description,

      body: `
        <div class="sidebar-label">
          TU SECUENCIA
        </div>

        <div class="sequence-result">
          ${selectedHTML ||
            "<span>Aún no seleccionaste ninguna opción.</span>"}
        </div>

        <div class="sidebar-label">
          SELECCIONA EL SIGUIENTE PASO
        </div>

        ${optionsHTML}

        <div class="modal-actions">
          ${fqButton(
            "REINICIAR ORDEN",
            "sequence-reset",
            "secondary-button"
          )}

          ${fqButton(
            "COMPROBAR",
            "sequence-check"
          )}
        </div>
      `
    })
  );
}

function selectSequencePart(index) {
  const challenge = fqChallenge;

  if (!challenge || fqModalLocked) {
    return;
  }

  if (
    sequenceSelection.includes(index)
  ) {
    return;
  }

  if (
    index < 0 ||
    index >= challenge.object.parts.length
  ) {
    return;
  }

  sequenceSelection.push(index);

  renderSequence();
}

function resetSequence() {
  if (!fqChallenge || fqModalLocked) {
    return;
  }

  sequenceSelection = [];

  renderSequence();
}

function checkSequence() {
  const challenge = fqChallenge;

  if (!challenge || fqModalLocked) {
    return;
  }

  const object = challenge.object;

  const expected = object.order ||
    object.parts.map((_, i) => i);

  if (
    sequenceSelection.length !==
    expected.length
  ) {
    showGameFeedback(
      "Todavía faltan pasos. Selecciona todas las opciones antes de comprobar.",
      false
    );

    return;
  }

  const correct = expected.every(
    (value, index) =>
      sequenceSelection[index] === value
  );

  if (!correct) {
    showGameFeedback(
      "El orden todavía no es correcto. Revisa la secuencia e inténtalo nuevamente.",
      false
    );

    return;
  }

  fqModalLocked = true;

  finishObjective(object);

  showObjectiveReward(object);
}

/* =====================================================
   13. MINIJUEGO DE MEMORIA
===================================================== */

function openMemory(object) {
  activeObject = object;

  const cards = [];

  (object.pairs || []).forEach(
    (pair, pairIndex) => {
      pair.forEach(text => {
        cards.push({
          id: cards.length,
          pairIndex,
          text
        });
      });
    }
  );

  // Mezclar cartas.
  for (
    let i = cards.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [cards[i], cards[j]] =
      [cards[j], cards[i]];
  }

  fqChallenge = {
    type: "memory",
    object,
    cards,
    flipped: [],
    matched: new Set(),
    locked: false
  };

  renderMemory();
}

function renderMemory() {
  const challenge = fqChallenge;

  if (!challenge) return;

  const cardsHTML = challenge.cards.map(
    (card, index) => {
      const revealed =
        challenge.flipped.includes(index);

      const matched =
        challenge.matched.has(index);

      const visible = revealed || matched;

      const classes = [
        "memory-card",
        revealed ? "revealed" : "",
        matched ? "matched" : ""
      ].filter(Boolean).join(" ");

      return `
        <button
          type="button"
          class="${classes}"
          data-fq-memory="${index}"
          ${matched ? "disabled" : ""}
        >
          ${visible
            ? escapeGameHTML(card.text)
            : "❔"}
        </button>
      `;
    }
  ).join("");

  const totalPairs =
    challenge.cards.length / 2;

  const foundPairs =
    challenge.matched.size / 2;

  showGameModal(
    fqModalLayout({
      icon: "🧠",

      title: challenge.object.title,

      description:
        challenge.object.description,

      body: `
        <div class="sidebar-label">
          PAREJAS ENCONTRADAS:
          ${foundPairs} / ${totalPairs}
        </div>

        <div class="memory-grid">
          ${cardsHTML}
        </div>

        <div class="modal-actions">
          ${fqButton(
            "REINICIAR JUEGO",
            "memory-reset",
            "secondary-button"
          )}
        </div>
      `
    })
  );
}

function selectMemoryCard(index) {
  const challenge = fqChallenge;

  if (
    !challenge ||
    challenge.type !== "memory" ||
    challenge.locked ||
    fqModalLocked
  ) {
    return;
  }

  if (
    index < 0 ||
    index >= challenge.cards.length ||
    challenge.matched.has(index) ||
    challenge.flipped.includes(index)
  ) {
    return;
  }

  challenge.flipped.push(index);

  renderMemory();

  if (challenge.flipped.length < 2) {
    return;
  }

  const [firstIndex, secondIndex] =
    challenge.flipped;

  const first =
    challenge.cards[firstIndex];

  const second =
    challenge.cards[secondIndex];

  if (
    first.pairIndex ===
    second.pairIndex
  ) {
    challenge.matched.add(firstIndex);
    challenge.matched.add(secondIndex);

    challenge.flipped = [];

    if (
      challenge.matched.size ===
      challenge.cards.length
    ) {
      fqModalLocked = true;

      finishObjective(
        challenge.object
      );

      showObjectiveReward(
        challenge.object
      );

      return;
    }

    renderMemory();

  } else {
    challenge.locked = true;

    fqMemoryTimer = setTimeout(() => {
      // El usuario pudo cerrar o reiniciar
      // el desafío mientras esperaba.
      if (fqChallenge !== challenge) {
        return;
      }

      challenge.flipped = [];
      challenge.locked = false;

      fqMemoryTimer = null;

      renderMemory();
    }, 1000);
  }
}

/* =====================================================
   14. MISIONES SECUNDARIAS
===================================================== */

function openSideQuest(quest) {
  activeObject = quest;

  if (
    isSideQuestCompleted(quest.id)
  ) {
    showGameModal(
      fqModalLayout({
        icon: "🌟",

        title: "MISIÓN EXTRA COMPLETADA",

        description:
          "Ya conseguiste la recompensa de esta misión secundaria.",

        body: fqButton(
          "SEGUIR EXPLORANDO",
          "close"
        )
      })
    );

    return;
  }

  fqChallenge = {
    type: "choice",
    object: quest,
    isSideQuest: true
  };

  renderChoice();
}

/* =====================================================
   15. DESBLOQUEO DE ZONAS

   Se desbloquea la siguiente zona
   al completar los cuatro objetivos
   principales de la zona actual.
===================================================== */

function checkLevelCompletion() {
  if (!isMissionCompleted()) {
    return;
  }

  if (
    currentLevel < missions.length - 1
  ) {
    const nextLevel =
      currentLevel + 1;

    if (unlocked < nextLevel) {
      unlocked = nextLevel;

      if (
        typeof saveGame === "function"
      ) {
        saveGame();
      }
    }
  }

  if (
    typeof updateGameUI === "function"
  ) {
    updateGameUI();
  }
}

/* =====================================================
   16. CONTROL CENTRAL DE BOTONES

   Todos los botones de los minijuegos
   funcionan mediante atributos data-*.
===================================================== */

document.addEventListener(
  "click",
  event => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const choiceButton =
      target.closest("[data-fq-choice]");

    if (choiceButton) {
      submitChoice(
        Number(
          choiceButton.dataset.fqChoice
        )
      );

      return;
    }

    const sequenceButton =
      target.closest(
        "[data-fq-sequence]"
      );

    if (sequenceButton) {
      selectSequencePart(
        Number(
          sequenceButton.dataset.fqSequence
        )
      );

      return;
    }

    const memoryButton =
      target.closest("[data-fq-memory]");

    if (memoryButton) {
      selectMemoryCard(
        Number(
          memoryButton.dataset.fqMemory
        )
      );

      return;
    }

    const actionButton =
      target.closest("[data-fq-action]");

    if (!actionButton) return;

    const action =
      actionButton.dataset.fqAction;

    switch (action) {
      case "close":
        closeGameModal();
        break;

      case "reward-close":
        closeGameModal();

        if (
          typeof checkVictory ===
          "function"
        ) {
          checkVictory();
        }

        break;

      case "dialogue-next":
        nextNPCDialogue();
        break;

      case "collect-clue":
        collectClue();
        break;

      case "sequence-reset":
        resetSequence();
        break;

      case "sequence-check":
        checkSequence();
        break;

      case "memory-reset":
        if (
          fqChallenge &&
          fqChallenge.type === "memory"
        ) {
          if (fqMemoryTimer !== null) {
            clearTimeout(fqMemoryTimer);
            fqMemoryTimer = null;
          }

          openMemory(
            fqChallenge.object
          );
        }

        break;
    }
  }
);

/* =====================================================
   17. CERRAR MODALES CON ESCAPE
===================================================== */

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      isGameModalOpen()
    ) {
      closeGameModal();
    }
  }
);

/* =====================================================
   18. INDICADOR DE INTERACCIÓN

   Esta función devuelve el texto que
   aparecerá cuando el jugador se acerque
   a un NPC, objeto o misión secundaria.
===================================================== */

function getInteractionPrompt() {
  if (
    screen !== "game" ||
    isGameModalOpen()
  ) {
    return "";
  }

  const target = nearestTarget();

  if (!target) return "";

  if (target.type === "npc") {
    return `PRESIONA E PARA HABLAR CON ${target.data.name}`;
  }

  if (target.type === "object") {
    const done = isCompleted(
      target.data.id
    );

    return done
      ? `E · ${target.data.label} COMPLETADO`
      : `PRESIONA E · ${target.data.label}`;
  }

  if (target.type === "sideQuest") {
    const done = isSideQuestCompleted(
      target.data.id
    );

    return done
      ? "E · MISIÓN EXTRA COMPLETADA"
      : `PRESIONA E · ${target.data.label}`;
  }

  return "";
}

/* =====================================================
   FIN DE LA PARTE 5

   CONTINUAR CON LA PARTE 6:
   - PANTALLA DE INICIO ARCADE
   - SELECCIÓN DE ZONAS
   - INTERFAZ DEL JUEGO
   - MOCHILA Y MAPA
   - GUARDADO Y CARGA
   - BUCLE DE ANIMACIÓN
   - PANTALLA DE VICTORIA
===================================================== */

/* =====================================================
   FUTURE QUEST — ARCADE RPG EDITION
   GAME.JS — PARTE 6

   INICIO, INTERFAZ, GUARDADO Y FINAL
===================================================== */

/* =====================================================
   1. CONFIGURACIÓN FINAL
===================================================== */

const FQ_TOTAL_LEVELS = missions.length;

let fqInterface = null;
let fqHome = null;
let fqPanel = null;
let fqPrompt = null;

let fqGameStarted = false;
let fqLastSave = 0;
let fqCurrentPanel = null;

/* =====================================================
   2. CORRECCIÓN DEL MOVIMIENTO

   Reemplazamos la función de la parte 4
   para bloquear el movimiento cuando
   existe un modal o panel abierto.
===================================================== */

updatePlayer = function(dt = 1) {
  if (
    screen !== "game" ||
    isGameModalOpen() ||
    fqCurrentPanel !== null
  ) {
    player.moving = false;
    return;
  }

  let dx = 0;
  let dy = 0;

  if (isMoving("left")) dx--;
  if (isMoving("right")) dx++;
  if (isMoving("up")) dy--;
  if (isMoving("down")) dy++;

  player.moving = dx !== 0 || dy !== 0;

  if (!player.moving) return;

  const magnitude = Math.hypot(dx, dy);

  dx /= magnitude;
  dy /= magnitude;

  const step = player.speed * Math.min(dt, 2);

  player.x = clamp(
    player.x + dx * step,
    35,
    WORLD_W - 35
  );

  player.y = clamp(
    player.y + dy * step,
    80,
    WORLD_H - 30
  );

  if (dx !== 0) {
    player.direction = dx > 0 ? 1 : -1;
  }

  if (Math.abs(dy) > Math.abs(dx)) {
    player.facing = dy < 0 ? "up" : "down";
  } else if (dx !== 0) {
    player.facing = dx > 0 ? "right" : "left";
  }

  player.frame += dt * 0.18;
};

/* =====================================================
   3. GUARDAR PARTIDA
===================================================== */

function saveGame() {
  try {
    const data = {
      version: 2,

      currentLevel,
      xp,
      unlocked,

      inventory: [...inventory],
      completed: [...completed],
      completedSideQuests: [
        ...completedSideQuests
      ],

      player: {
        x: player.x,
        y: player.y,
        facing: player.facing
      },

      savedAt: Date.now()
    };

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(data)
    );

    return true;

  } catch (error) {
    console.warn(
      "No se pudo guardar FUTURE QUEST:",
      error
    );

    return false;
  }
}

/* =====================================================
   4. CARGAR PARTIDA

   Acepta los datos de la versión nueva
   y las claves principales de la anterior.
===================================================== */

function loadGame() {
  try {
    const raw = localStorage.getItem(
      SAVE_KEY
    );

    if (!raw) return false;

    const data = JSON.parse(raw);

    if (!data || typeof data !== "object") {
      return false;
    }

    const savedLevel = Number(
      data.currentLevel ?? 0
    );

    const savedXP = Number(
      data.xp ?? 0
    );

    const savedUnlocked = Number(
      data.unlocked ?? 0
    );

    currentLevel = clamp(
      Number.isFinite(savedLevel)
        ? Math.floor(savedLevel)
        : 0,
      0,
      missions.length - 1
    );

    xp = Number.isFinite(savedXP)
      ? Math.max(0, savedXP)
      : 0;

    unlocked = clamp(
      Number.isFinite(savedUnlocked)
        ? Math.floor(savedUnlocked)
        : 0,
      0,
      missions.length - 1
    );

    const validObjectIds = new Set(
      missions.flatMap(
        mission => mission.objects.map(
          object => object.id
        )
      )
    );

    const validSideQuestIds = new Set(
      sideQuests.map(quest => quest.id)
    );

    completed = new Set(
      (Array.isArray(data.completed)
        ? data.completed
        : []
      ).filter(id => validObjectIds.has(id))
    );

    completedSideQuests = new Set(
      (Array.isArray(data.completedSideQuests)
        ? data.completedSideQuests
        : []
      ).filter(
        id => validSideQuestIds.has(id)
      )
    );

    inventory = Array.isArray(data.inventory)
      ? data.inventory.filter(
          item => typeof item === "string"
        )
      : [];

    // Recuperar zonas completadas incluso si
    // una partida antigua no guardó "unlocked".
    missions.forEach((mission, index) => {
      if (
        index < missions.length - 1 &&
        mission.objects.every(
          object => completed.has(object.id)
        )
      ) {
        unlocked = Math.max(
          unlocked,
          index + 1
        );
      }
    });

    currentLevel = Math.min(
      currentLevel,
      unlocked
    );

    if (data.player) {
      const savedX = Number(data.player.x);
      const savedY = Number(data.player.y);

      player.x = Number.isFinite(savedX)
        ? clamp(savedX, 35, WORLD_W - 35)
        : 130;

      player.y = Number.isFinite(savedY)
        ? clamp(savedY, 80, WORLD_H - 30)
        : 610;

      player.facing =
        ["up", "down", "left", "right"]
          .includes(data.player.facing)
          ? data.player.facing
          : "down";
    }

    return true;

  } catch (error) {
    console.warn(
      "No se pudo cargar la partida:",
      error
    );

    return false;
  }
}

/* =====================================================
   5. REINICIAR PARTIDA
===================================================== */

function resetGame() {
  const confirmed = window.confirm(
    "¿Quieres borrar tu progreso y comenzar una nueva aventura?"
  );

  if (!confirmed) return;

  localStorage.removeItem(SAVE_KEY);

  currentLevel = 0;
  xp = 0;
  unlocked = 0;

  inventory = [];

  completed = new Set();
  completedSideQuests = new Set();
  selectedValues = new Set();

  player.x = 130;
  player.y = 610;
  player.facing = "down";
  player.frame = 0;
  player.moving = false;

  victoryShown = false;

  closeGameModal();
  closeGamePanel();

  screen = "home";

  showHomeScreen();
}

/* =====================================================
   6. CREAR PANTALLA DE INICIO
===================================================== */

function createHomeScreen() {
  let home = $("fqStandaloneScreen");

  if (!home) {
    home = document.createElement("div");
    home.id = "fqStandaloneScreen";
    document.body.appendChild(home);
  }

  fqHome = home;

  return home;
}

/* =====================================================
   7. PANTALLA PRINCIPAL ARCADE
===================================================== */

function showHomeScreen() {
  screen = "home";

  createHomeScreen();

  if (fqInterface) {
    fqInterface.style.display = "none";
  }

  const progress = getTotalProgress();

  fqHome.innerHTML = `
    <div class="fq-home-card">

      <div class="fq-kicker">
        ✦ AVENTURA EDUCATIVA RPG ✦
      </div>

      <h1 class="fq-game-logo">
        FUTURE<br>QUEST
      </h1>

      <p class="fq-home-subtitle">
        ¡TU FUTURO COMIENZA AQUÍ!
      </p>

      <div class="fq-decorative-stars">
        ★ ✦ ★
      </div>

      <h2>
        ¡CONVIÉRTETE EN EL HÉROE
        DE TU HISTORIA!
      </h2>

      <p>
        Explora una ciudad llena de desafíos,
        descubre pistas, conversa con personajes
        y toma decisiones que transformarán
        el futuro de tu comunidad.
      </p>

      <div class="fq-home-stats">
        <div class="fq-stat">
          🌎 <strong>3</strong> ZONAS
        </div>

        <div class="fq-stat">
          🎯 <strong>12</strong> DESAFÍOS
        </div>

        <div class="fq-stat">
          ⭐ <strong>${xp}</strong> XP
        </div>

        <div class="fq-stat">
          🏆 <strong>${progress}%</strong>
          COMPLETADO
        </div>
      </div>

      <div class="fq-divider"></div>

      <button
        id="fqPlayBtn"
        type="button"
        data-home-action="play"
      >
        ▶ ¡JUGAR AHORA!
      </button>

      <button
        id="fqChooseLevelBtn"
        type="button"
        data-home-action="levels"
      >
        🗺️ ELEGIR ZONA
      </button>

      <button
        id="fqResetBtn"
        type="button"
        data-home-action="reset"
      >
        ↻ REINICIAR
      </button>

      <p class="fq-instructions">
        🎮 Moverse: WASD o flechas
        &nbsp;·&nbsp;
        Interactuar: E
        &nbsp;·&nbsp;
        También puedes jugar en celular
      </p>

    </div>
  `;

  fqHome.classList.add("open");
}

/* =====================================================
   8. SELECCIÓN DE ZONAS
===================================================== */

function showLevelSelection() {
  screen = "levels";

  createHomeScreen();

  const cards = missions.map(
    (mission, index) => {
      const locked = index > unlocked;
      const progress = getMissionProgress(index);

      return `
        <div class="fq-level-card ${
          locked ? "locked" : ""
        }">

          <span class="fq-level-icon">
            ${mission.icon}
          </span>

          <div class="fq-level-number">
            ZONA ${index + 1}
          </div>

          <h3>
            ${escapeGameHTML(mission.name)}
          </h3>

          <p>
            ${escapeGameHTML(mission.story)}
          </p>

          <div class="fq-progress-mini">
            <span style="width:${progress}%"></span>
          </div>

          <p>
            ${progress}% completado
          </p>

          <button
            type="button"
            data-select-level="${index}"
            ${locked ? "disabled" : ""}
          >
            ${locked
              ? "🔒 BLOQUEADA"
              : progress === 100
                ? "✓ VOLVER A VISITAR"
                : "▶ EXPLORAR"}
          </button>

        </div>
      `;
    }
  ).join("");

  fqHome.innerHTML = `
    <div class="fq-home-card">

      <div class="fq-kicker">
        SELECCIÓN DE MUNDO
      </div>

      <h2>
        🗺️ ELIGE TU DESTINO
      </h2>

      <p>
        Completa los desafíos principales
        para desbloquear nuevas zonas.
      </p>

      <div class="fq-level-grid">
        ${cards}
      </div>

      <button
        id="fqBackHome"
        type="button"
        data-home-action="home"
      >
        ← VOLVER AL INICIO
      </button>

    </div>
  `;

  fqHome.classList.add("open");
}

/* =====================================================
   9. CREAR INTERFAZ DEL JUEGO
===================================================== */

function createGameInterface() {
  let interfaceElement = $(
    "fqGameInterface"
  );

  if (!interfaceElement) {
    interfaceElement =
      document.createElement("div");

    interfaceElement.id =
      "fqGameInterface";

    document.body.appendChild(
      interfaceElement
    );
  }

  fqInterface = interfaceElement;

  fqInterface.innerHTML = `
    <div class="fq-topbar">

      <div class="fq-pill" id="fqZoneLabel">
        🌎 ZONA 01
      </div>

      <div class="fq-actions">

        <div class="fq-pill" id="fqXPLabel">
          ⭐ 0 XP
        </div>

        <button
          class="fq-button"
          type="button"
          data-game-action="map"
        >
          🗺️ MAPA
        </button>

        <button
          class="fq-button"
          type="button"
          data-game-action="inventory"
        >
          🎒 MOCHILA
        </button>

        <button
          class="fq-button"
          type="button"
          data-game-action="home"
        >
          🏠 INICIO
        </button>

      </div>

    </div>

    <div class="fq-progress">

      <div
        class="fq-progress-label"
        id="fqProgressLabel"
      >
        MISIÓN: 0%
      </div>

      <div class="fq-track">
        <div
          class="fq-fill"
          id="fqProgressFill"
        ></div>
      </div>

    </div>

    <div
      class="interaction-prompt"
      id="fqInteractionPrompt"
      style="display:none"
    ></div>

    <div class="fq-touch">

      <div></div>

      <button
        type="button"
        data-touch="up"
        aria-label="Arriba"
      >▲</button>

      <div></div>

      <button
        type="button"
        data-touch="left"
        aria-label="Izquierda"
      >◀</button>

      <button
        type="button"
        data-touch="down"
        aria-label="Abajo"
      >▼</button>

      <button
        type="button"
        data-touch="right"
        aria-label="Derecha"
      >▶</button>

    </div>

    <button
      class="fq-interact"
      type="button"
      data-game-action="interact"
    >
      E
    </button>

    <div
      class="fq-panel hidden"
      id="fqGamePanel"
    ></div>
  `;

  fqPanel = $("fqGamePanel");
  fqPrompt = $("fqInteractionPrompt");

  setupTouchControls();

  return fqInterface;
}

/* =====================================================
   10. ACTUALIZAR INTERFAZ
===================================================== */

function updateGameUI() {
  if (!fqInterface) return;

  const mission = getMission();

  if (!mission) return;

  const zoneLabel = $("fqZoneLabel");
  const xpLabel = $("fqXPLabel");
  const progressLabel = $("fqProgressLabel");
  const progressFill = $("fqProgressFill");

  const progress = getMissionProgress();

  if (zoneLabel) {
    zoneLabel.textContent =
      `${mission.icon} ${mission.name}`;
  }

  if (xpLabel) {
    xpLabel.textContent =
      `⭐ ${xp} XP`;
  }

  if (progressLabel) {
    progressLabel.textContent =
      `🎯 MISIÓN: ${progress}%`;
  }

  if (progressFill) {
    progressFill.style.width =
      `${progress}%`;
  }
}

/* =====================================================
   11. INDICADOR DE INTERACCIÓN
===================================================== */

function updateInteractionPrompt() {
  if (!fqPrompt) return;

  const message = getInteractionPrompt();

  if (!message || fqCurrentPanel !== null) {
    fqPrompt.style.display = "none";
    return;
  }

  fqPrompt.textContent = message;
  fqPrompt.style.display = "block";
}

/* =====================================================
   12. MOSTRAR Y CERRAR PANELES
===================================================== */

function openGamePanel(type, html) {
  if (!fqPanel) return;

  fqCurrentPanel = type;

  fqPanel.innerHTML = html;
  fqPanel.classList.remove("hidden");
}

function closeGamePanel() {
  fqCurrentPanel = null;

  if (fqPanel) {
    fqPanel.classList.add("hidden");
    fqPanel.innerHTML = "";
  }
}

/* =====================================================
   13. MOCHILA
===================================================== */

function showInventory() {
  if (fqCurrentPanel === "inventory") {
    closeGamePanel();
    return;
  }

  const itemsHTML = inventory.length
    ? inventory.map(item => `
        <div class="fq-level-card">
          🎒 ${escapeGameHTML(item)}
        </div>
      `).join("")
    : `
      <p>
        Tu mochila está vacía.
        ¡Explora el mundo y completa desafíos!
      </p>
    `;

  openGamePanel(
    "inventory",
    `
      <h2>🎒 MI MOCHILA</h2>

      <p>
        Aquí encontrarás las pistas,
        documentos e insignias que consigas.
      </p>

      <div class="fq-level-card">
        ⭐ <strong>${xp} XP</strong>
      </div>

      ${itemsHTML}

      <button
        class="fq-button"
        type="button"
        data-game-action="close-panel"
      >
        CERRAR
      </button>
    `
  );
}

/* =====================================================
   14. MAPA DEL MUNDO
===================================================== */

function showMap() {
  if (fqCurrentPanel === "map") {
    closeGamePanel();
    return;
  }

  const levelsHTML = missions.map(
    (mission, index) => {
      const locked = index > unlocked;
      const progress = getMissionProgress(index);

      return `
        <div class="fq-level-card">

          <h3>
            ${mission.icon}
            ${escapeGameHTML(mission.name)}
          </h3>

          <p>
            Progreso: ${progress}%
          </p>

          <div class="fq-progress-mini">
            <span style="width:${progress}%"></span>
          </div>

          <button
            class="fq-button"
            type="button"
            data-map-level="${index}"
            ${locked ? "disabled" : ""}
          >
            ${locked
              ? "🔒 BLOQUEADA"
              : index === currentLevel
                ? "📍 ESTÁS AQUÍ"
                : "IR A ESTA ZONA"}
          </button>

        </div>
      `;
    }
  ).join("");

  openGamePanel(
    "map",
    `
      <h2>🗺️ MAPA DEL MUNDO</h2>

      <p>
        Explora las zonas desbloqueadas
        y completa tu aventura.
      </p>

      ${levelsHTML}

      <button
        class="fq-button"
        type="button"
        data-game-action="close-panel"
      >
        CERRAR
      </button>
    `
  );
}

/* =====================================================
   15. CAMBIAR DE ZONA
===================================================== */

function changeLevel(level) {
  const index = Number(level);

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= missions.length ||
    index > unlocked
  ) {
    return;
  }

  currentLevel = index;

  player.x = 130;
  player.y = 610;

  player.facing = "right";
  player.moving = false;
  player.frame = 0;

  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });

  Object.keys(touch).forEach(key => {
    touch[key] = false;
  });

  closeGameModal();
  closeGamePanel();

  screen = "game";

  if (fqHome) {
    fqHome.classList.remove("open");
  }

  if (fqInterface) {
    fqInterface.style.display = "block";
  }

  updateCamera();
  updateGameUI();
  saveGame();
}

/* =====================================================
   16. COMENZAR EL JUEGO
===================================================== */

function startGame() {
  if (!fqGameStarted) {
    fqGameStarted = true;
  }

  screen = "game";

  if (fqHome) {
    fqHome.classList.remove("open");
  }

  if (fqInterface) {
    fqInterface.style.display = "block";
  }

  closeGamePanel();

  updateGameUI();
  updateCamera();
}

/* =====================================================
   17. CONTROLES TÁCTILES

   Pointer Events permiten usar mouse
   y pantallas táctiles.
===================================================== */

function setupTouchControls() {
  const buttons =
    fqInterface.querySelectorAll(
      "[data-touch]"
    );

  buttons.forEach(button => {
    const direction =
      button.dataset.touch;

    const release = event => {
      touch[direction] = false;

      if (
        event &&
        button.hasPointerCapture?.(
          event.pointerId
        )
      ) {
        button.releasePointerCapture(
          event.pointerId
        );
      }
    };

    button.addEventListener(
      "pointerdown",
      event => {
        event.preventDefault();

        touch[direction] = true;

        button.setPointerCapture(
          event.pointerId
        );
      }
    );

    button.addEventListener(
      "pointerup",
      release
    );

    button.addEventListener(
      "pointercancel",
      release
    );

    button.addEventListener(
      "lostpointercapture",
      () => {
        touch[direction] = false;
      }
    );
  });
}

/* =====================================================
   18. BOTONES DEL INICIO
===================================================== */

document.addEventListener(
  "click",
  event => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const homeAction =
      target.closest(
        "[data-home-action]"
      );

    if (homeAction) {
      const action =
        homeAction.dataset.homeAction;

      if (action === "play") {
        startGame();
      }

      if (action === "levels") {
        showLevelSelection();
      }

      if (action === "home") {
        showHomeScreen();
      }

      if (action === "reset") {
        resetGame();
      }

      return;
    }

    const levelButton =
      target.closest(
        "[data-select-level]"
      );

    if (levelButton) {
      changeLevel(
        Number(
          levelButton.dataset.selectLevel
        )
      );

      return;
    }
  }
);

/* =====================================================
   19. BOTONES DE LA INTERFAZ
===================================================== */

document.addEventListener(
  "click",
  event => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const gameAction =
      target.closest(
        "[data-game-action]"
      );

    if (gameAction) {
      const action =
        gameAction.dataset.gameAction;

      if (action === "map") {
        showMap();
      }

      if (action === "inventory") {
        showInventory();
      }

      if (action === "close-panel") {
        closeGamePanel();
      }

      if (action === "interact") {
        if (fqCurrentPanel === null) {
          interact();
        }
      }

      if (action === "home") {
        saveGame();
        closeGamePanel();
        showHomeScreen();
      }

      return;
    }

    const mapLevel =
      target.closest(
        "[data-map-level]"
      );

    if (mapLevel) {
      changeLevel(
        Number(
          mapLevel.dataset.mapLevel
        )
      );
    }
  }
);

/* =====================================================
   20. AJUSTAR CANVAS A LA PANTALLA
===================================================== */

function resizeGameCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  updateCamera();
}

window.addEventListener(
  "resize",
  resizeGameCanvas
);

/* =====================================================
   21. DIBUJAR MUNDO

   Orden:
   1. Fondo
   2. Objetos y personajes
   3. Jugador
===================================================== */

function renderWorld(time) {
  ctx.clearRect(
    0, 0,
    canvas.width,
    canvas.height
  );

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  drawBackground(time);

  const mission = getMission();
  const npc = getNPC();
  const sideQuest = getSideQuest();

  // Ordenar por coordenada Y para crear
  // una profundidad sencilla tipo RPG.
  const entities = [];

  if (mission) {
    mission.objects.forEach(object => {
      entities.push({
        y: object.y,
        draw: () => drawObject(
          object,
          time
        )
      });
    });
  }

  if (npc) {
    entities.push({
      y: npc.y,
      draw: () => drawNPC(
        npc,
        time
      )
    });
  }

  if (sideQuest) {
    entities.push({
      y: sideQuest.y,
      draw: () => drawSideQuest(
        sideQuest,
        time
      )
    });
  }

  entities.push({
    y: player.y,
    draw: () => drawPlayer(time)
  });

  entities.sort(
    (a, b) => a.y - b.y
  );

  entities.forEach(entity => {
    entity.draw();
  });

  ctx.restore();
}

/* =====================================================
   22. BUCLE PRINCIPAL
===================================================== */

function gameLoop(time) {
  const dt = lastTime
    ? Math.min(
        (time - lastTime) / 16.6667,
        2
      )
    : 1;

  lastTime = time;
  animationFrame = time;

  if (screen === "game") {
    updatePlayer(dt);
    updateCamera();
    renderWorld(time);

    updateInteractionPrompt();

    // Guardado automático cada 10 segundos.
    if (time - fqLastSave >= 10000) {
      fqLastSave = time;
      saveGame();
    }
  }

  requestAnimationFrame(gameLoop);
}

/* =====================================================
   23. VICTORIA FINAL

   Se comprueba cuando se cierra el modal
   de recompensa, evitando que el mensaje
   final quede oculto.
===================================================== */

function checkVictory() {
  if (victoryShown) return;

  const allCompleted = missions.every(
    mission => mission.objects.every(
      object => completed.has(object.id)
    )
  );

  if (!allCompleted) return;

  if (isGameModalOpen()) return;

  victoryShown = true;

  saveGame();

  showGameModal(
    fqModalLayout({
      icon: "🏆",

      title: "¡FUTURO RESTAURADO!",

      description:
        "¡Felicitaciones! Has completado las tres zonas de FUTURE QUEST. Investigaste información, defendiste la convivencia, construiste acuerdos democráticos y recuperaste la memoria histórica. Tus decisiones ayudaron a construir un futuro más justo y pacífico.",

      body: `
        <div class="modal-feedback">
          ⭐ EXPERIENCIA TOTAL:
          <strong>${xp} XP</strong>

          <p>
            🎯 12 DESAFÍOS PRINCIPALES
            COMPLETADOS
          </p>

          <p>
            🌎 3 ZONAS RESTAURADAS
          </p>
        </div>

        <div class="modal-actions">
          ${fqButton(
            "SEGUIR EXPLORANDO",
            "close"
          )}

          <button
            class="secondary-button"
            type="button"
            data-fq-victory-home
          >
            VOLVER AL INICIO
          </button>
        </div>
      `
    })
  );
}

/* =====================================================
   24. BOTÓN DE VICTORIA
===================================================== */

document.addEventListener(
  "click",
  event => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (
      target.closest(
        "[data-fq-victory-home]"
      )
    ) {
      closeGameModal();
      saveGame();
      showHomeScreen();
    }
  }
);

/* =====================================================
   25. AJUSTES VISUALES FINALES

   Estos estilos complementan style.css.
===================================================== */

function installGameStyles() {
  if ($("fqFinalFixStyles")) return;

  const style = document.createElement("style");

  style.id = "fqFinalFixStyles";

  style.textContent = `
    #fqStandaloneScreen {
      display: none;
    }

    #fqStandaloneScreen.open {
      display: flex;
    }

    #fqGameInterface {
      display: none;
    }

    #futureQuestModal {
      display: none;
    }

    #futureQuestModal.open {
      display: flex;
    }

    .fq-panel.hidden {
      display: none !important;
    }

    .fq-touch button {
      touch-action: none;
    }

    .fq-home-card,
    .modal-card,
    .fq-panel {
      scrollbar-width: thin;
    }

    @media (min-width: 950px) {
      .fq-touch,
      .fq-interact {
        opacity: .65;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =====================================================
   26. INICIALIZACIÓN
===================================================== */

function initializeFutureQuest() {
  installGameStyles();

  createHomeScreen();
  createGameInterface();

  resizeGameCanvas();

  // Recuperar progreso guardado.
  loadGame();

  // Preparar interfaz.
  updateGameUI();

  // Mostrar inicio.
  showHomeScreen();

  // Iniciar animación.
  requestAnimationFrame(gameLoop);

  // Guardar antes de cerrar la página.
  window.addEventListener(
    "beforeunload",
    () => {
      saveGame();
    }
  );

  console.log(
    "🎮 FUTURE QUEST — ARCADE RPG EDITION listo."
  );
}

/* =====================================================
   27. ARRANQUE SEGURO
===================================================== */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeFutureQuest,
    { once: true }
  );

} else {
  initializeFutureQuest();
}

/* =====================================================
   FIN DEL GAME.JS COMPLETO

   FUTURE QUEST — ARCADE RPG EDITION
   PARTES 2 + 3 + 4 + 5 + 6
===================================================== */
