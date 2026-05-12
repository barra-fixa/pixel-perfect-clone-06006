// Banco de exercícios — referência única do app.
// Imagens: Free Exercise DB (https://github.com/yuhonas/free-exercise-db, domínio público / Unlicense).
// Formato: 2 imagens por exercício (início/fim da execução).
//
// Convenção: cada exercício tem uma chave em camelCase usada nos templates de treino.
// fxId é o ID no banco Free Exercise DB; quando ausente, mostramos só o emoji.

const FX_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export type Dificuldade = "Iniciante" | "Intermediário" | "Avançado";

export type ExercicioBase = {
  nome: string;
  musculo: string;
  emoji: string;
  fxId?: string; // ID no Free Exercise DB → derivamos as URLs das imagens
  instrucoes: string[];
  errosComuns: string[];
  dicas?: string[];
  equipamentos?: string[]; // tags pra possíveis filtros futuros
};

// Lista canônica de IDs — fonte da verdade para autocompletar em `lib/treinos.ts`.
const _IDS = [
  "flexao",
  "supino",
  "triceps",
  "flexaoDiamante",
  "barraFixa",
  "barraFixaSupinada",
  "remadaAustraliana",
  "remadaCurvada",
  "rosca",
  "roscaMartelo",
  "agachamento",
  "agachamentoBulgaro",
  "afundo",
  "panturrilha",
  "glutePonte",
  "steup",
  "desenvolvimento",
  "elevacaoLateral",
  "elevacaoFrontal",
  "prancha",
  "pranchaLateral",
  "abdominal",
  "bicycleCrunch",
  "deadbug",
  "pranchaAlta",
  "burpee",
  "jumpingJack",
  "mountainClimber",
  "corrida",
  "pular",
] as const;

export type ExercicioId = (typeof _IDS)[number];

export const EXERCICIOS_BASE: Record<ExercicioId, ExercicioBase> = {
  // ========== PEITO / TRÍCEPS ==========
  flexao: {
    nome: "Flexão de braço",
    musculo: "Peito",
    emoji: "🤜",
    fxId: "Pushups",
    instrucoes: [
      "Apoie as mãos no chão na largura dos ombros, corpo reto da cabeça aos calcanhares.",
      "Desça o peito até quase tocar o chão, cotovelos a 45° do tronco.",
      "Empurre o chão e suba com força até estender os braços.",
    ],
    errosComuns: [
      "Deixar o quadril cair (lordose) ou subir muito (corcunda).",
      "Abrir demais os cotovelos a 90° — sobrecarrega o ombro.",
      "Descer pouco — perde estímulo no peito.",
    ],
    dicas: [
      "Se difícil, comece com flexão apoiando os joelhos no chão.",
      "Para evoluir: flexão diamante (mãos juntas) ou pés elevados.",
    ],
    equipamentos: ["nenhum"],
  },
  supino: {
    nome: "Supino reto com halteres",
    musculo: "Peito",
    emoji: "🏋️",
    fxId: "Dumbbell_Bench_Press",
    instrucoes: [
      "Deite no banco com halteres na altura do peito, pés firmes no chão.",
      "Empurre verticalmente até quase estender os cotovelos.",
      "Desça com controle por 2 segundos.",
    ],
    errosComuns: [
      "Bater os halteres no topo — perde estabilidade.",
      "Descer rápido demais — sem controle excêntrico.",
      "Arquear muito a lombar.",
    ],
    equipamentos: ["halteres", "banco"],
  },
  triceps: {
    nome: "Tríceps no banco",
    musculo: "Tríceps",
    emoji: "💪",
    fxId: "Bench_Dips",
    instrucoes: [
      "Apoie as mãos na borda de um banco ou cadeira atrás de você.",
      "Desça flexionando os cotovelos até cerca de 90°.",
      "Empurre de volta usando o tríceps, sem trancar os cotovelos no topo.",
    ],
    errosComuns: [
      "Afastar muito o quadril do banco — vira flexão de ombro.",
      "Descer pouco.",
    ],
    equipamentos: ["banco"],
  },
  flexaoDiamante: {
    nome: "Flexão diamante",
    musculo: "Tríceps",
    emoji: "💎",
    fxId: "Pushups_-_Close_Triceps_Position",
    instrucoes: [
      "Mãos juntas no chão formando um diamante com polegares e indicadores.",
      "Desça o peito quase tocando as mãos, cotovelos colados ao corpo.",
      "Empurre forte até estender os braços.",
    ],
    errosComuns: ["Abrir os cotovelos para fora.", "Descer pouco."],
    equipamentos: ["nenhum"],
  },

  // ========== COSTAS / BÍCEPS ==========
  barraFixa: {
    nome: "Barra fixa pegada pronada",
    musculo: "Costas",
    emoji: "🤸",
    fxId: "Pullups",
    instrucoes: [
      "Pegada pronada (palmas pra frente), um pouco mais aberta que os ombros.",
      "Puxe levando o peito em direção à barra, sem balançar.",
      "Desça com controle até estender os braços.",
    ],
    errosComuns: [
      "Balançar o corpo para impulsionar (kipping não controlado).",
      "Não estender completamente em baixo.",
    ],
    dicas: ["Se difícil: comece com remada australiana ou negativa de barra (só a descida)."],
    equipamentos: ["barra fixa"],
  },
  barraFixaSupinada: {
    nome: "Barra fixa pegada supinada (chin-up)",
    musculo: "Bíceps",
    emoji: "💪",
    fxId: "Chin-Up",
    instrucoes: [
      "Pegada supinada (palmas para você), largura dos ombros.",
      "Puxe levando o queixo acima da barra.",
      "Desça com controle.",
    ],
    errosComuns: ["Não descer completamente."],
    equipamentos: ["barra fixa"],
  },
  remadaAustraliana: {
    nome: "Remada australiana",
    musculo: "Costas",
    emoji: "🚣",
    fxId: "Inverted_Row",
    instrucoes: [
      "Posicione-se sob a barra, corpo reto e calcanhares no chão.",
      "Puxe o peito em direção à barra mantendo o tronco alinhado.",
      "Desça lentamente até estender os braços.",
    ],
    errosComuns: ["Quebrar a postura quando cansa.", "Não tocar o peito na barra."],
    equipamentos: ["barra fixa"],
  },
  remadaCurvada: {
    nome: "Remada curvada com halteres",
    musculo: "Costas",
    emoji: "🏋️",
    fxId: "Bent_Over_Two-Dumbbell_Row",
    instrucoes: [
      "Tronco inclinado a ~45°, joelhos semi-flexionados, halteres ao lado das pernas.",
      "Puxe os halteres em direção à cintura, cotovelos próximos ao corpo.",
      "Desça lentamente sem balançar o tronco.",
    ],
    errosComuns: ["Curvar as costas (arredondar a lombar).", "Usar impulso do tronco."],
    equipamentos: ["halteres"],
  },
  rosca: {
    nome: "Rosca direta com halteres",
    musculo: "Bíceps",
    emoji: "💪",
    fxId: "Dumbbell_Bicep_Curl",
    instrucoes: [
      "Em pé, halteres com pegada supinada ao lado do corpo.",
      "Flexione os cotovelos sem balançar o tronco.",
      "Segure 1 segundo no topo e desça lentamente.",
    ],
    errosComuns: ["Balançar o tronco.", "Levantar o cotovelo (vira elevação frontal)."],
    equipamentos: ["halteres"],
  },
  roscaMartelo: {
    nome: "Rosca martelo",
    musculo: "Bíceps",
    emoji: "🔨",
    fxId: "Hammer_Curls",
    instrucoes: [
      "Em pé, halteres com pegada neutra (polegares apontando pra frente).",
      "Flexione os cotovelos mantendo pegada neutra.",
      "Desça com controle.",
    ],
    errosComuns: ["Mexer o cotovelo pra frente."],
    equipamentos: ["halteres"],
  },

  // ========== PERNAS ==========
  agachamento: {
    nome: "Agachamento livre",
    musculo: "Pernas",
    emoji: "🦵",
    fxId: "Bodyweight_Squat",
    instrucoes: [
      "Pés na largura dos ombros, joelhos alinhados com a ponta dos pés.",
      "Desça empurrando o quadril pra trás até as coxas paralelas ao chão.",
      "Suba empurrando o chão com os calcanhares.",
    ],
    errosComuns: [
      "Joelhos caírem pra dentro (valgo).",
      "Calcanhar tirar do chão.",
      "Curvar a coluna pra frente.",
    ],
    dicas: ["Olhe para frente, peito aberto, abdômen contraído."],
    equipamentos: ["nenhum"],
  },
  agachamentoBulgaro: {
    nome: "Agachamento búlgaro",
    musculo: "Pernas",
    emoji: "🦿",
    fxId: "Dumbbell_Squat",
    instrucoes: [
      "Apoie o peito de um pé em um banco atrás de você, o outro pé à frente.",
      "Desça flexionando o joelho da frente até a coxa paralela ao chão.",
      "Suba empurrando o calcanhar da frente.",
    ],
    errosComuns: ["Apoiar pouca distância do banco.", "Joelho da frente passar muito da ponta do pé."],
    equipamentos: ["banco"],
  },
  afundo: {
    nome: "Afundo alternado",
    musculo: "Pernas",
    emoji: "🚶",
    fxId: "Bodyweight_Walking_Lunge",
    instrucoes: [
      "Dê um passo à frente e desça flexionando os dois joelhos a ~90°.",
      "O joelho de trás quase encosta no chão.",
      "Volte à posição inicial e alterne a perna.",
    ],
    errosComuns: ["Passo muito curto.", "Joelho da frente passa muito do pé."],
    equipamentos: ["nenhum"],
  },
  panturrilha: {
    nome: "Elevação de panturrilha",
    musculo: "Pernas",
    emoji: "🦶",
    fxId: "Standing_Calf_Raises",
    instrucoes: [
      "Em pé, pontas dos pés em uma elevação (degrau opcional).",
      "Suba o máximo na ponta dos pés.",
      "Desça lentamente até alongar a panturrilha.",
    ],
    errosComuns: ["Movimento curto.", "Não alongar lá embaixo."],
    equipamentos: ["nenhum"],
  },
  glutePonte: {
    nome: "Elevação de quadril (ponte)",
    musculo: "Glúteo",
    emoji: "🍑",
    fxId: "Glute_Bridge",
    instrucoes: [
      "Deite com joelhos flexionados e pés apoiados no chão.",
      "Empurre o quadril para cima contraindo o glúteo no topo.",
      "Desça com controle.",
    ],
    errosComuns: ["Não contrair glúteo (vira lombar).", "Subir só com a lombar."],
    equipamentos: ["nenhum"],
  },
  steup: {
    nome: "Subida no banco",
    musculo: "Pernas",
    emoji: "🪜",
    fxId: "Step-up_with_knee_raise",
    instrucoes: [
      "Em frente a um banco firme, suba com um pé empurrando o calcanhar.",
      "No topo, elevar levemente o joelho oposto.",
      "Desça com controle e alterne.",
    ],
    errosComuns: ["Empurrar com o pé do chão em vez do que está em cima."],
    equipamentos: ["banco"],
  },

  // ========== OMBRO ==========
  desenvolvimento: {
    nome: "Desenvolvimento com halteres",
    musculo: "Ombro",
    emoji: "🏋️",
    fxId: "Seated_Dumbbell_Press",
    instrucoes: [
      "Sentado, halteres na altura dos ombros, palmas pra frente.",
      "Empurre verticalmente até quase estender os braços.",
      "Desça com controle.",
    ],
    errosComuns: ["Arquear muito a lombar.", "Travar os cotovelos no topo."],
    equipamentos: ["halteres", "banco"],
  },
  elevacaoLateral: {
    nome: "Elevação lateral",
    musculo: "Ombro",
    emoji: "🤲",
    fxId: "Side_Lateral_Raise",
    instrucoes: [
      "Em pé, halteres ao lado do corpo, cotovelos levemente flexionados.",
      "Eleve os braços lateralmente até a altura dos ombros.",
      "Desça lentamente sem balançar.",
    ],
    errosComuns: ["Subir acima do ombro (ativa trapézio).", "Usar impulso."],
    equipamentos: ["halteres"],
  },
  elevacaoFrontal: {
    nome: "Elevação frontal",
    musculo: "Ombro",
    emoji: "✋",
    fxId: "Front_Dumbbell_Raise",
    instrucoes: [
      "Em pé, halteres na frente das coxas, palmas para baixo.",
      "Eleve um braço por vez até a altura dos ombros.",
      "Desça com controle e alterne.",
    ],
    errosComuns: ["Balançar o tronco.", "Subir além da linha do ombro."],
    equipamentos: ["halteres"],
  },

  // ========== CORE ==========
  prancha: {
    nome: "Prancha frontal",
    musculo: "Core",
    emoji: "🧘",
    fxId: "Plank",
    instrucoes: [
      "Apoie antebraços e pontas dos pés no chão.",
      "Mantenha o corpo em linha reta da cabeça aos calcanhares.",
      "Respire profundamente durante toda a série.",
    ],
    errosComuns: ["Quadril alto (corcunda).", "Quadril baixo (lordose)."],
    dicas: ["Imagine puxar o umbigo em direção à coluna pra ativar o core."],
    equipamentos: ["nenhum"],
  },
  pranchaLateral: {
    nome: "Prancha lateral",
    musculo: "Core",
    emoji: "🧎",
    fxId: "Side_Bridge",
    instrucoes: [
      "Deitado de lado, apoie o antebraço no chão alinhado com o ombro.",
      "Suba o quadril formando linha reta dos pés à cabeça.",
      "Mantenha o tempo de série e alterne o lado.",
    ],
    errosComuns: ["Quadril cair.", "Cabeça pendendo."],
    equipamentos: ["nenhum"],
  },
  abdominal: {
    nome: "Abdominal supra",
    musculo: "Core",
    emoji: "🔥",
    fxId: "Crunches",
    instrucoes: [
      "Deitado, joelhos flexionados, mãos atrás da cabeça (sem puxar o pescoço).",
      "Suba contraindo o abdômen até as escápulas saírem do chão.",
      "Desça com controle.",
    ],
    errosComuns: ["Puxar o pescoço com as mãos.", "Subir só com tronco (vira flexão de quadril)."],
    equipamentos: ["nenhum"],
  },
  bicycleCrunch: {
    nome: "Abdominal bicicleta",
    musculo: "Core",
    emoji: "🚴",
    fxId: "Air_Bike",
    instrucoes: [
      "Deitado, mãos atrás da cabeça, pernas em ângulo reto no ar.",
      "Toque o cotovelo direito no joelho esquerdo enquanto estende a perna direita.",
      "Alterne em movimento contínuo de pedalada.",
    ],
    errosComuns: ["Puxar o pescoço.", "Movimentos muito rápidos sem controle."],
    equipamentos: ["nenhum"],
  },
  deadbug: {
    nome: "Dead bug",
    musculo: "Core",
    emoji: "🐞",
    fxId: "Dead_Bug",
    instrucoes: [
      "Deitado de costas, braços estendidos pra cima, joelhos a 90°.",
      "Estenda o braço direito atrás e a perna esquerda à frente, mantendo a lombar colada no chão.",
      "Volte e alterne os lados.",
    ],
    errosComuns: ["Lombar arquear durante o movimento."],
    equipamentos: ["nenhum"],
  },
  pranchaAlta: {
    nome: "Prancha alta com toque no ombro",
    musculo: "Core",
    emoji: "🦾",
    fxId: "Push-Up_Wide",
    instrucoes: [
      "Posição de flexão alta, mãos sob os ombros.",
      "Toque um ombro com a mão oposta sem balançar o quadril.",
      "Alterne os lados em ritmo controlado.",
    ],
    errosComuns: ["Rotacionar o quadril.", "Movimento muito rápido."],
    equipamentos: ["nenhum"],
  },

  // ========== CARDIO / FUNCIONAL ==========
  burpee: {
    nome: "Burpee",
    musculo: "Cardio",
    emoji: "💥",
    fxId: "Burpee",
    instrucoes: [
      "Agache, apoie as mãos no chão e jogue os pés para trás (prancha).",
      "Faça uma flexão (opcional), volte os pés e salte com os braços para cima.",
      "Aterrisse suavemente e repita.",
    ],
    errosComuns: ["Pular sem extensão completa do corpo.", "Aterrissar com joelhos rígidos."],
    equipamentos: ["nenhum"],
  },
  jumpingJack: {
    nome: "Polichinelo",
    musculo: "Cardio",
    emoji: "🤸",
    fxId: "Jumping_Jacks",
    instrucoes: [
      "Em pé, pés juntos, braços ao longo do corpo.",
      "Salte abrindo pernas e elevando braços acima da cabeça.",
      "Salte de volta à posição inicial em ritmo constante.",
    ],
    errosComuns: ["Não abrir totalmente os braços.", "Ritmo irregular."],
    equipamentos: ["nenhum"],
  },
  mountainClimber: {
    nome: "Escalador",
    musculo: "Cardio",
    emoji: "🏔️",
    fxId: "Mountain_Climbers",
    instrucoes: [
      "Posição de flexão alta, mãos sob os ombros.",
      "Traga alternadamente um joelho em direção ao peito em ritmo rápido.",
      "Mantenha o quadril estável (sem subir/descer).",
    ],
    errosComuns: ["Quadril alto.", "Pé não vai longe o bastante."],
    equipamentos: ["nenhum"],
  },
  corrida: {
    nome: "Corrida intervalada",
    musculo: "Cardio",
    emoji: "🏃",
    instrucoes: [
      "Aqueça por 5 minutos em ritmo leve.",
      "Alterne 1 minuto em ritmo forte e 1 minuto leve.",
      "Finalize com 5 minutos de desaquecimento.",
    ],
    errosComuns: ["Não aquecer.", "Ritmo forte sem intensidade real."],
    equipamentos: ["nenhum"],
  },
  pular: {
    nome: "Pular corda",
    musculo: "Cardio",
    emoji: "🪢",
    fxId: "Rope_Jumping",
    instrucoes: [
      "Pés levemente afastados, joelhos relaxados.",
      "Gire a corda usando os punhos, não os braços inteiros.",
      "Aterrisse na ponta dos pés.",
    ],
    errosComuns: ["Saltar muito alto.", "Usar os braços em vez dos punhos."],
    equipamentos: ["corda"],
  },
};

/** Retorna a URL da primeira imagem do exercício (ou null se não houver). */
export function imagemDe(id: ExercicioId): string | null {
  const e = EXERCICIOS_BASE[id];
  if (!e.fxId) return null;
  return `${FX_BASE}/${e.fxId}/0.jpg`;
}

/** Retorna a URL da segunda imagem (final do movimento), pra mostrar "antes/depois". */
export function imagemFinalDe(id: ExercicioId): string | null {
  const e = EXERCICIOS_BASE[id];
  if (!e.fxId) return null;
  return `${FX_BASE}/${e.fxId}/1.jpg`;
}
