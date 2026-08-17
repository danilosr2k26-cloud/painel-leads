# Landing + Painel de Leads (tudo em um, na Render)

Um único servidor Node.js que hospeda **as duas coisas no mesmo endereço**:

- a **landing** (site) na raiz `/`;
- o **painel** de leads em `/painel` (login, KPIs, gráfico, tabela, WhatsApp, CSV);
- o **endpoint** que recebe os cadastros em `/api/leads`.

Como está tudo no mesmo endereço, o formulário nem precisa de CORS: o endpoint
da landing é só `/api/leads`.

## Estrutura

```
painel-leads/
├── server.js            → servidor (site + painel + API)
├── package.json
├── .env.example         → copie para .env e configure
├── public/painel.html   → o painel (dashboard)
├── site/                → COLOQUE AQUI a sua landing (index.html, css, js, img)
└── data/                → leads.json é criado aqui automaticamente
```

## Passo 1 — Colocar a landing dentro do projeto

Copie os arquivos da sua landing (o `index.html`, e as pastas `css`, `js` e
`img`) para dentro da pasta **`site/`**.

Depois, no `site/js/config.js`, ajuste o endpoint para o caminho relativo:

```js
leads: {
  endpoint: "/api/leads",
  ...
}
```

## Passo 2 — Rodar local (opcional, para testar)

Precisa de Node.js 18+.

```bash
npm install
cp .env.example .env      # no Windows: copy .env.example .env
# edite o .env: defina ADMIN_PASSWORD e AUTH_SECRET
npm start
```

- Site:   http://localhost:3000/
- Painel: http://localhost:3000/painel

## Passo 3 — Publicar na Render

1. Suba esta pasta para um repositório no GitHub (sem `node_modules` e sem `.env`).
2. Na Render: **New + → Web Service** → selecione o repositório.
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free
4. Em **Environment**, adicione as variáveis:
   - `ADMIN_USER` = `admin`
   - `ADMIN_PASSWORD` = *(sua senha)*
   - `AUTH_SECRET` = *(uma chave longa e aleatória)*
   - `ALLOWED_ORIGINS` = `*` (não é essencial aqui, pois é tudo mesmo-origem)
5. **Create Web Service** e aguarde ficar "Live".

Sua URL final (ex.: `https://seu-app.onrender.com`):
- Site:   `https://seu-app.onrender.com/`
- Painel: `https://seu-app.onrender.com/painel`

## Observações do plano grátis da Render

- O serviço "dorme" após ~15 min sem acesso; a **primeira** visita depois disso
  demora alguns segundos para "acordar".
- O disco é temporário: num novo deploy o `leads.json` pode ser zerado. Para
  produção, ative um **Disk** (persistente) na Render ou troque por um banco
  (Postgres/Supabase).

## Rotas da API

| Método | Rota | Protegida | Função |
|---|---|---|---|
| POST | `/api/leads` | não | recebe um lead (a landing chama esta) |
| POST | `/api/login` | não | login do painel → token |
| GET | `/api/leads` | sim | lista com filtros `?status=&q=&from=&to=` |
| GET | `/api/stats` | sim | números dos KPIs e do gráfico |
| PATCH | `/api/leads/:id` | sim | muda `status`/`nota` |
| DELETE | `/api/leads/:id` | sim | exclui |
| GET | `/api/export` | sim | baixa CSV |
