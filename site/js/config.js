/* =========================================================================
   CONFIGURAÇÃO DA LANDING PAGE  (edite APENAS este arquivo)
   -------------------------------------------------------------------------
   Landing page de captação de parceiros/agências no estilo de páginas de
   "torne-se um ponto/agência". TODO o conteúdo abaixo é placeholder: troque
   pelos textos e imagens do seu cliente. Não use marca, logo, textos ou fotos
   de terceiros — use os do próprio cliente.
   ========================================================================= */

const CONFIG = {

  /* ---------- IDENTIDADE ---------- */
  empresa: {
    nome: "Mercado Livre",
    logo: "img/logo.png",           // troque por img/logo.png se preferir
    favicon: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/favicon.svg",
    ano: "2021",
    fonteTitulos: "'Poppins', sans-serif"
  },

  /* ---------- CORES (troque pelas cores da marca do cliente) ---------- */
  cores: {
    primaria: "#2f6bff",     // botões principais
    primariaEscura: "#1f4fd1",// hover
    destaque: "#ffd400",     // faixa/detalhes (dash acima dos títulos, faixa final)
    texto: "#3d3d47",        // texto padrão
    titulo: "#1b1b2b",       // títulos
    claro: "#f6f7fb"         // fundos claros
  },

  /* ---------- CONTATO / WHATSAPP ---------- */
  contato: {
    whatsappNumero: "5511933940072",       // DDI+DDD+numero, só dígitos
    whatsappMensagem: "Olá! Tenho interesse em me tornar parceiro.",
    whatsappTexto: "Falar no WhatsApp",
    whatsappNumeros: [
      { nome: "Atendente 1", numero: "5511933940072" },
      { nome: "Atendente 2", numero: "5519982691463" }
    ],
    email: "contato@cliente.com.br",
    ajudaLink: "#faq"
  },

  /* ---------- HERO ---------- */
  hero: {
    eyebrow: "",
    titulo: "Faça sua loja crescer recebendo e entregando pacotes",
    subtitulo: "",
    botao: "Quero ser uma agência",
    imagem: "https://http2.mlstatic.com/frontend-assets/shipping-places-register/hero-ultrawide-PT.jpg",         // imagem de fundo do hero (de lado a lado)
    overlay: 0.5                    // opacidade da camada escura sobre a imagem (0 a 1)
  },

  /* ---------- SEÇÃO "LOJA DE CONFIANÇA" (imagem + texto + bullets) ---------- */
  confianca: {
    eyebrow: "",
    titulo: "Torne-se a loja de confiança do seu bairro",
    texto: "Muitas pessoas vão passar na sua loja para entregar ou retirar pacotes por você fazer parte da nossa rede de envios.",
    imagem: "https://http2.mlstatic.com/frontend-assets/shipping-places-register/agency-client-interaction@x1.jpg",
    bullets: [
      // "Primeiro benefício em destaque",
      // "Segundo benefício em destaque",
      // "Terceiro benefício em destaque"
    ]
  },

  /* ---------- SEÇÃO "SERVIÇOS" (3 cards com imagem) ---------- */
  servicos: {
    titulo: "Aumente sua receita somando algumas das seguintes tarefas aos serviços que você costuma oferecer",
    cards: [
      { imagem: "https://http2.mlstatic.com/frontend-assets/shipping-places-register/seller-delivery-PT.jpg", titulo: "", texto: "Receber pacotes de vendedores" },
      { imagem: "https://http2.mlstatic.com/frontend-assets/shipping-places-register/package-handoff-PT.jpg", titulo: "", texto: "Entregar pacotes para compradores" },
      { imagem: "https://http2.mlstatic.com/frontend-assets/shipping-places-register/delivery-to-customer-PT.jpg", titulo: "", texto: "Fazer entregas de pacotes a domicílio" }
    ]
  },

  /* ---------- SEÇÃO "SEM INVESTIR" (destaque) ---------- */
  semInvestir: {
    titulo: "Participe sem investir dinheiro",
    texto: "Você só precisa ter espaço na sua loja para armazenar pacotes. Não será necessário adaptá-la ou comprar equipamentos extras.",
    imagem: "https://http2.mlstatic.com/frontend-assets/shipping-places-register/no-investment@x1.jpg"
  },

  /* ---------- SEÇÃO "REQUISITOS" ---------- */
  requisitos: {
    titulo: "O que você precisa para participar",
    itens: [
      { icone: "", titulo: "Ponto físico", texto: "Ter um local com movimento na sua região." },
      { icone: "", titulo: "Disponibilidade", texto: "Horário de funcionamento compatível." },
      { icone: "", titulo: "Smartphone", texto: "Um celular com internet para usar o app." },
      { icone: "", titulo: "Cadastro", texto: "Documentos básicos do negócio em dia." }
    ]
  },

  /* ---------- FAQ (acordeão) ---------- */
  faq: [
    { pergunta: "O que é uma Agência Mercado Livre?", resposta: "É uma loja de qualquer ramo que, além de oferecer seus serviços, recebe e entrega pacotes do Mercado Livre." },
    { pergunta: "Do que eu preciso para me cadastrar?", resposta: "Para se cadastrar, você deverá inserir alguns dados da loja. Depois disso, nós vamos avaliar e, caso decidamos incluí-la em nossa rede de agências, entraremos em contato com você." },
    { pergunta: "Como funciona o pagamento?", resposta: "Os pagamentos são mensais e feitos por depósito em conta bancária. O valor que você receberá por pacote será determinado pelo serviço que você oferecer, entre outros fatores." },
    { pergunta: "Já me cadastrei, porquê não entram em contato comigo?", resposta: "Se ainda não entramos em contato com você, é possível que sua loja não atenda aos requisitos ou que agora não precisemos de novas agências na sua região. Não se preocupe, nossa rede continua crescendo dia após dia!" },
    { pergunta: "Já me cadastrei com uma loja, posso me cadastrar com outra?", resposta: "Sim, mas lembre-se de que você só poderá registrar uma loja por CNPJ." }
  ],

  /* ---------- FAIXA FINAL (CTA) ---------- */
  ctaFinal: {
    titulo: "Junte-se a milhares de parceiros",
    botao: "Quero me cadastrar"
  },

  /* ---------- FORMULÁRIO DE LEADS ----------
     Como os leads são enviados (escolha UMA das formas):
     1) endpoint: URL que recebe o POST (painel/webhook, Formspree, Getform,
        n8n, Google Apps Script...). Se preenchido, o form envia por aqui.
     2) Se endpoint = "", o form abre o e-mail do cliente (mailto) com os dados.
     Sempre há também o botão "Enviar pelo WhatsApp".
  */
  leads: {
    endpoint: "/api/leads",   // ex.: "https://formspree.io/f/xxxxxx"  (deixe "" para usar e-mail)
    titulo: "Cadastre-se e nossa equipe entra em contato",
    subtitulo: "Preencha seus dados que retornamos rapidinho.",
    botao: "Enviar cadastro",
    sucesso: "Cadastro enviado com sucesso! Em breve entraremos em contato.",
    // Campos do formulário (name é a chave enviada ao painel/e-mail)
    campos: [
      { name: "nome", label: "Nome completo", tipo: "text", obrigatorio: true },
      { name: "telefone", label: "Telefone / WhatsApp", tipo: "tel", obrigatorio: true },
      { name: "email", label: "E-mail", tipo: "email", obrigatorio: true },
      { name: "cidade", label: "Cidade", tipo: "text", obrigatorio: false },
      { name: "mensagem", label: "Mensagem (opcional)", tipo: "textarea", obrigatorio: false }
    ]
  }
};
