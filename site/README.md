# Landing Page de Captação de Parceiros (configurável)

Landing page de uma página só, em **HTML, CSS e JavaScript puro**, no estilo de
páginas de "torne-se um parceiro/agência": hero com selo + CTA, benefícios,
cards de serviços, requisitos, FAQ em acordeão, **formulário de leads** e faixa
final. Inclui **botão flutuante de WhatsApp**.

> Recria apenas o **layout e a estrutura** — padrões comuns de landing page.
> Todo o conteúdo (textos, imagens, logo, cores) é placeholder. Use a marca, as
> fotos e os textos do **seu cliente**. Não use logo, marca, textos ou imagens
> de terceiros.

## Estrutura de pastas

```
landing-agencia/
├── index.html          → a página (todas as seções)
├── css/style.css       → estilos (cores vêm do config)
├── js/
│   ├── config.js       → ⭐ EDITE AQUI: textos, cores, imagens, formulário
│   └── script.js       → motor (monta a página — não precisa mexer)
└── img/
    └── logo.svg        → logo placeholder (troque pela do cliente)
```

## Configuração (só o `js/config.js`)

- `empresa` → nome, logo, ano e fonte.
- `cores` → cor primária (botões), destaque (faixa/detalhes), textos e fundos.
- `contato` → WhatsApp, e-mail.
- `hero`, `confianca`, `servicos`, `semInvestir`, `requisitos`, `faq`,
  `ctaFinal` → os textos e imagens de cada seção.

### Imagens

Coloque as imagens do cliente na pasta `img/` e aponte no config
(`hero.imagem`, `confianca.imagem`, `servicos.cards[].imagem`, etc.). Enquanto a
imagem não existir, aparece um **placeholder** automático — nada quebra.

## Formulário de leads — para onde vão os cadastros

Configurado em `config.leads`. Você tem duas formas (escolha uma):

**1. Enviar para um painel / webhook** (recomendado)
Preencha `leads.endpoint` com a URL que recebe os dados. Funciona com serviços
prontos e gratuitos, por exemplo:

- **Formspree** (formspree.io) → cria um endpoint tipo
  `https://formspree.io/f/xxxxxx` e envia os leads para o seu e-mail/painel.
- **Getform**, **Basin**, **n8n**, **Make/Zapier webhook** → mesma ideia.
- **Google Sheets** via **Apps Script** (Web App) → recebe o POST e grava os
  leads numa planilha, que vira seu "painel".

O formulário envia um `POST` em JSON com os campos preenchidos.

**2. Enviar por e-mail (sem endpoint)**
Se deixar `leads.endpoint: ""`, ao enviar o formulário abre o programa de e-mail
do visitante já preenchido com os dados, endereçado ao `contato.email`.

Em qualquer caso, há também o botão **"Enviar pelo WhatsApp"** e o botão
flutuante, que levam para `contato.whatsappNumero`.

> Observação: um site estático (só HTML) não consegue, sozinho, gravar leads num
> banco de dados. Por isso o caminho mais robusto é o `endpoint` (item 1) — ele
> conecta o formulário ao seu painel real.

### Campos do formulário

Edite `leads.campos` para adicionar/remover campos. Cada campo tem `name` (a
chave enviada), `label`, `tipo` (`text`, `tel`, `email`, `textarea`) e
`obrigatorio` (true/false).

## Visualizar / publicar

Rode um servidor local **de dentro desta pasta**:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Para publicar de graça: arraste a pasta no **Netlify Drop**
(app.netlify.com/drop), ou use **Vercel** / **GitHub Pages**.
