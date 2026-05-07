// Mock data placeholder for the day's workout. Will be replaced by backend later.
export type Exercicio = {
  id: string;
  nome: string;
  musculo: string;
  series: number;
  reps: string;
  dificuldade: "Iniciante" | "Intermediário" | "Avançado";
  emoji: string;
  descansoSeg: number;
  instrucoes: string[];
};

export const TREINO_DO_DIA = {
  nome: "Costas + Bíceps",
  duracaoMin: 32,
  exercicios: [
    {
      id: "1",
      nome: "Barra fixa pegada pronada",
      musculo: "Costas",
      series: 4,
      reps: "6-10",
      dificuldade: "Intermediário",
      emoji: "🤸",
      descansoSeg: 75,
      instrucoes: [
        "Segure a barra com pegada pronada (palmas para frente), levemente mais aberta que os ombros.",
        "Inicie o movimento puxando os cotovelos para baixo, levando o peito em direção à barra.",
        "Desça com controle até a extensão completa dos braços.",
      ],
    },
    {
      id: "2",
      nome: "Remada australiana",
      musculo: "Costas",
      series: 3,
      reps: "10-12",
      dificuldade: "Iniciante",
      emoji: "🚣",
      descansoSeg: 60,
      instrucoes: [
        "Posicione-se sob a barra, deitado, com o corpo reto e os pés apoiados no chão.",
        "Puxe o peito em direção à barra mantendo o corpo alinhado.",
        "Desça lentamente até estender os braços.",
      ],
    },
    {
      id: "3",
      nome: "Rosca direta com isometria",
      musculo: "Bíceps",
      series: 3,
      reps: "12",
      dificuldade: "Iniciante",
      emoji: "💪",
      descansoSeg: 45,
      instrucoes: [
        "Em pé, segure os pesos (ou use a banda elástica) com pegada supinada.",
        "Flexione os cotovelos sem balançar o tronco.",
        "Segure 1 segundo no topo e desça lentamente.",
      ],
    },
    {
      id: "4",
      nome: "Prancha frontal",
      musculo: "Core",
      series: 3,
      reps: "30s",
      dificuldade: "Iniciante",
      emoji: "🧘",
      descansoSeg: 45,
      instrucoes: [
        "Apoie os antebraços e as pontas dos pés no chão.",
        "Mantenha o corpo em linha reta, sem deixar o quadril cair.",
        "Respire profundamente durante toda a série.",
      ],
    },
  ] satisfies Exercicio[],
};
