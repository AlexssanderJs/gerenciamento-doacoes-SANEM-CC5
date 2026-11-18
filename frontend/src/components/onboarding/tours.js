// RNF11 – Roteiros dos tours guiados.
//
// Cada passo aponta para um elemento marcado com o atributo data-tour="..." na tela.
// Passos sem "element" aparecem centralizados (boas-vindas / encerramento).
// Passos cujo elemento não existe no momento (ex.: tabela vazia) são pulados.

const el = (name) => `[data-tour="${name}"]`;

export const TOURS = {
  geral: {
    id: "geral",
    title: "Conhecendo o SANEM",
    description: "Visão geral do menu e das principais áreas do sistema.",
    path: "/home",
    match: (p) => p === "/home",
    steps: [
      {
        popover: {
          title: "Bem-vindo(a) ao SANEM!",
          description:
            "Este tour rápido mostra onde fica cada coisa. Use os botões abaixo ou as setas do teclado para avançar. Você pode sair a qualquer momento.",
        },
      },
      {
        element: el("nav-menu"),
        popover: {
          title: "Menu principal",
          description: "Todas as áreas do sistema ficam aqui. A área em que você está fica destacada.",
          side: "right",
        },
      },
      {
        element: el("nav-doacoes"),
        popover: {
          title: "Doações",
          description: "Registre tudo o que a SANEM recebeu. O estoque aumenta sozinho.",
          side: "right",
        },
      },
      {
        element: el("nav-retirada"),
        popover: {
          title: "Retirada",
          description:
            "Registre o que um beneficiário levou. O estoque diminui sozinho e o sistema confere o limite mensal da família.",
          side: "right",
        },
      },
      {
        element: el("nav-estoque"),
        popover: {
          title: "Estoque",
          description: "Veja quanto há de cada item, cadastre itens novos e imprima etiquetas.",
          side: "right",
        },
      },
      {
        element: el("nav-beneficiarios"),
        popover: {
          title: "Beneficiários",
          description: "Cadastre e consulte as famílias atendidas.",
          side: "right",
        },
      },
      {
        element: el("nav-demandas"),
        popover: {
          title: "Demandas prioritárias",
          description: "Os itens que a SANEM mais precisa receber, com o progresso de cada campanha.",
          side: "right",
        },
      },
      {
        element: el("notificacoes"),
        popover: {
          title: "Avisos",
          description: "O sino mostra alertas, como itens que chegaram ao estoque mínimo.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: el("tour-button"),
        popover: {
          title: "Ficou com dúvida?",
          description:
            "Clique em \"Tour\" a qualquer momento para ver o passo a passo da tela em que você está.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: el("nav-ajuda"),
        popover: {
          title: "Ajuda",
          description: "Aqui ficam os tutoriais escritos e a lista de todos os tours guiados.",
          side: "right",
        },
      },
    ],
  },

  estoque: {
    id: "estoque",
    title: "Estoque",
    description: "Consultar, cadastrar e editar itens.",
    tip: "Aqui você consulta e cadastra itens. As quantidades mudam sozinhas com doações e retiradas.",
    path: "/estoque",
    match: (p) => p === "/estoque",
    steps: [
      {
        element: el("estoque-adicionar"),
        popover: {
          title: "Cadastrar item",
          description: "Clique no \"+\" para cadastrar um item novo. Você pode definir um estoque mínimo para receber avisos.",
          side: "left",
        },
      },
      {
        element: el("estoque-filtros"),
        popover: {
          title: "Buscar e filtrar",
          description: "Digite o nome ou o código do item. Em \"Avançado\" você filtra por quantidade, tamanho, gênero, tipo e estado.",
          side: "bottom",
        },
      },
      {
        element: el("estoque-baixo"),
        popover: {
          title: "Itens acabando",
          description: "Marque esta opção para ver só os itens que estão no estoque mínimo ou abaixo dele.",
          side: "bottom",
        },
      },
      {
        element: el("estoque-tabela"),
        popover: {
          title: "Lista de itens",
          description: "Cada linha é um item, com a quantidade disponível agora.",
          side: "top",
        },
      },
      {
        element: el("estoque-acoes"),
        popover: {
          title: "Ações do item",
          description: "Use estes botões para editar, imprimir a etiqueta ou excluir o item.",
          side: "left",
        },
      },
    ],
  },

  "doacao-lista": {
    id: "doacao-lista",
    title: "Doações registradas",
    description: "Consultar doações e registrar uma nova.",
    tip: "Recebeu uma doação? Clique no \"+\" para registrá-la.",
    path: "/doacao/lista",
    match: (p) => p === "/doacao/lista",
    steps: [
      {
        element: el("doacao-novo"),
        popover: {
          title: "Registrar doação",
          description: "Clique aqui sempre que chegar uma doação.",
          side: "left",
        },
      },
      {
        element: el("doacao-filtros"),
        popover: {
          title: "Buscar doações",
          description: "Filtre por doador, período, atendente ou item.",
          side: "bottom",
        },
      },
      {
        element: el("doacao-tabela"),
        popover: {
          title: "Histórico",
          description: "Todas as doações já registradas aparecem aqui.",
          side: "top",
        },
      },
    ],
  },

  "doacao-registrar": {
    id: "doacao-registrar",
    title: "Registrar doação",
    description: "Passo a passo para registrar o que chegou.",
    tip: "São só três passos: escolher o doador, adicionar os itens e confirmar.",
    path: "/doacao/registrar",
    match: (p) => p === "/doacao/registrar",
    steps: [
      {
        element: el("doacao-doador"),
        popover: {
          title: "1. Quem doou?",
          description: "Digite o nome ou CPF do doador e escolha na lista.",
          side: "bottom",
        },
      },
      {
        element: el("doacao-buscar-item"),
        popover: {
          title: "2. O que foi doado?",
          description: "Busque o item no estoque e clique nele para adicionar. Depois ajuste a quantidade.",
          side: "bottom",
        },
      },
      {
        element: el("doacao-novo-item"),
        popover: {
          title: "Item que ainda não existe",
          description: "Se o item não aparecer na busca, digite o nome aqui e clique em \"Criar Novo Item\".",
          side: "top",
        },
      },
      {
        element: el("doacao-registrar"),
        popover: {
          title: "3. Confirmar",
          description: "Confira os itens e clique aqui. O estoque é atualizado na hora.",
          side: "top",
        },
      },
    ],
  },

  "retirada-lista": {
    id: "retirada-lista",
    title: "Retiradas registradas",
    description: "Consultar retiradas e registrar uma nova.",
    tip: "Um beneficiário veio buscar itens? Clique no \"+\" para registrar a retirada.",
    path: "/retirada/lista",
    match: (p) => p === "/retirada/lista",
    steps: [
      {
        element: el("retirada-novo"),
        popover: {
          title: "Registrar retirada",
          description: "Clique aqui quando um beneficiário retirar itens.",
          side: "left",
        },
      },
      {
        element: el("retirada-filtros"),
        popover: {
          title: "Buscar retiradas",
          description: "Filtre por beneficiário, período, atendente ou item.",
          side: "bottom",
        },
      },
      {
        element: el("retirada-tabela"),
        popover: {
          title: "Histórico",
          description: "Todas as retiradas já registradas aparecem aqui.",
          side: "top",
        },
      },
    ],
  },

  "retirada-registrar": {
    id: "retirada-registrar",
    title: "Registrar retirada",
    description: "Passo a passo para registrar o que um beneficiário levou.",
    tip: "Escolha o beneficiário primeiro: o sistema mostra quantos itens ele ainda pode retirar no mês.",
    path: "/retirada/registrar",
    match: (p) => p === "/retirada/registrar",
    steps: [
      {
        element: el("retirada-beneficiario"),
        popover: {
          title: "1. Quem está retirando?",
          description:
            "Digite o nome ou CPF do beneficiário. Ao escolher, aparece o limite mensal: quantos itens ele já retirou e quantos ainda pode levar.",
          side: "bottom",
        },
      },
      {
        element: el("retirada-limite"),
        popover: {
          title: "Limite do mês",
          description: "Se os itens escolhidos passarem do limite, o sistema avisa antes de registrar.",
          side: "bottom",
        },
      },
      {
        element: el("retirada-itens"),
        popover: {
          title: "2. Quais itens?",
          description: "Busque cada item, clique para adicionar e ajuste a quantidade com \"+\" e \"-\".",
          side: "top",
        },
      },
      {
        element: el("retirada-registrar"),
        popover: {
          title: "3. Confirmar",
          description: "O botão é liberado depois de escolher o beneficiário e pelo menos um item.",
          side: "top",
        },
      },
    ],
  },

  beneficiarios: {
    id: "beneficiarios",
    title: "Beneficiários",
    description: "Consultar e cadastrar famílias atendidas.",
    tip: "Antes de cadastrar, busque pelo CPF para não criar o mesmo beneficiário duas vezes.",
    path: "/cadastrobeneficiario/lista",
    match: (p) => p === "/cadastrobeneficiario/lista",
    steps: [
      {
        element: el("benef-novo"),
        popover: {
          title: "Novo beneficiário",
          description: "Clique aqui para cadastrar uma família.",
          side: "left",
        },
      },
      {
        element: el("benef-filtros"),
        popover: {
          title: "Buscar",
          description: "Procure por nome, CPF/CRNM ou telefone, e filtre pela situação do cadastro.",
          side: "bottom",
        },
      },
      {
        element: el("benef-tabela"),
        popover: {
          title: "Lista de beneficiários",
          description: "Em cada linha você pode editar, aprovar ou rejeitar cadastros novos, e inativar ou reativar.",
          side: "top",
        },
      },
    ],
  },

  doadores: {
    id: "doadores",
    title: "Doadores",
    description: "Consultar e cadastrar doadores.",
    tip: "Cadastre o doador uma vez e depois é só escolhê-lo ao registrar cada doação.",
    path: "/cadastrodoador/lista",
    match: (p) => p === "/cadastrodoador/lista",
    steps: [
      {
        element: el("doador-novo"),
        popover: {
          title: "Novo doador",
          description: "Clique aqui para cadastrar uma pessoa ou empresa doadora.",
          side: "left",
        },
      },
      {
        element: el("doador-filtros"),
        popover: {
          title: "Buscar",
          description: "Procure por nome, CPF/CNPJ, telefone ou e-mail.",
          side: "bottom",
        },
      },
      {
        element: el("doador-tabela"),
        popover: {
          title: "Lista de doadores",
          description: "Use os botões de cada linha para editar ou excluir.",
          side: "top",
        },
      },
    ],
  },

  demandas: {
    id: "demandas",
    title: "Demandas prioritárias",
    description: "Cadastrar e acompanhar o que a SANEM mais precisa.",
    tip: "Cada demanda mostra quanto já foi recebido. O progresso é atualizado sozinho a cada doação.",
    path: "/demandas",
    match: (p) => p === "/demandas",
    steps: [
      {
        element: el("demanda-nova"),
        popover: {
          title: "Nova demanda",
          description: "Clique aqui para dizer qual item a SANEM precisa, quanto e até quando.",
          side: "left",
        },
      },
      {
        element: el("demanda-resumo"),
        popover: {
          title: "Resumo",
          description: "Quantas demandas estão ativas, quais são urgentes e quais já atingiram a meta.",
          side: "bottom",
        },
      },
      {
        element: el("demanda-filtros"),
        popover: {
          title: "Filtros",
          description: "Veja as ativas, as inativas ou filtre pela prioridade.",
          side: "bottom",
        },
      },
      {
        element: el("demanda-cards"),
        popover: {
          title: "Progresso",
          description: "A barra mostra \"recebido X de Y\". Use \"Editar\" ou \"Inativar\" em cada card.",
          side: "top",
        },
      },
    ],
  },
};

/** Ordem em que os tours aparecem na página de Ajuda. */
export const TOUR_ORDER = [
  "geral",
  "doacao-registrar",
  "retirada-registrar",
  "estoque",
  "beneficiarios",
  "doadores",
  "demandas",
  "doacao-lista",
  "retirada-lista",
];

export function tourForPath(pathname) {
  if (!pathname) return null;
  return Object.values(TOURS).find((t) => t.match(pathname)) || null;
}
