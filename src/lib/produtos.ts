// Produtos da Barra Fixa — links de afiliado / loja oficial.
// Usados nos rodapés educativos de Home e Treino do dia.

export type Produto = {
  id: number;
  nome: string;
  link: string;
  descricao: string;
  preco: string;
  emoji: string;
};

export const PRODUTOS_BARRA_FIXA: Produto[] = [
  {
    id: 1,
    nome: "Barra Fixa de Parede Pull-Up (Interna e Externa)",
    link: "https://www.mercadolivre.com.br/barra-fixa-de-parede-completa--pullup-interna-e-externa/up/MLBU3408644480",
    descricao: "Modelo clássico, interna/externa",
    preco: "A partir de R$ 199",
    emoji: "🏋️",
  },
  {
    id: 2,
    nome: "Barra Fixa Paralela Multifuncional TAF (Modo Colors)",
    link: "https://produto.mercadolivre.com.br/MLB-3638609339-barra-fixa-paralela-de-parede-multifuncional-taf-modo-colors-_JM",
    descricao: "Modelo paralela, mais versátil",
    preco: "A partir de R$ 289",
    emoji: "🦾",
  },
  {
    id: 3,
    nome: "Barra Fixa Multifuncional 5 em 1 (Reforçado)",
    link: "https://www.mercadolivre.com.br/barra-fixa-multifuncional-5-em-1-multifuncional-reforcado/up/MLBU3414849607",
    descricao: "Modelo premium, 5 funções",
    preco: "A partir de R$ 359",
    emoji: "💪",
  },
];
