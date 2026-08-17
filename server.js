/* =========================================================================
   PAINEL DE LEADS — Backend (endpoint + API do painel)
   -------------------------------------------------------------------------
   - Recebe os leads do formulário da landing (POST /api/leads)
   - Guarda em data/leads.json
   - Serve o painel administrativo em /painel (com login)
   Node.js puro + Express. Sem banco externo.
   ========================================================================= */

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/* ---------- carrega variáveis do arquivo .env (sem dependência) ---------- */
(function carregarEnv() {
  try {
    const p = path.join(__dirname, ".env");
    if (!fs.existsSync(p)) return;
    fs.readFileSync(p, "utf8").split(/\r?\n/).forEach((linha) => {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in process.env)) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    });
  } catch (e) { /* ignora */ }
})();

const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(16).toString("hex");
const ORIGENS = (process.env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());

if (!ADMIN_PASSWORD) {
  console.error("\n[ERRO] Defina ADMIN_PASSWORD no arquivo .env antes de iniciar.");
  console.error("       Copie .env.example para .env e escolha uma senha.\n");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "100kb" }));

/* ---------- CORS: libera o POST de leads para o(s) domínio(s) da landing ---------- */
const corsLeads = cors({
  origin: ORIGENS.includes("*") ? true : ORIGENS,
  methods: ["POST", "OPTIONS"],
});

/* =========================================================================
   Armazenamento em arquivo JSON (fila de escrita para evitar corrida)
   ========================================================================= */
const PASTA_DADOS = path.join(__dirname, "data");
const ARQUIVO = path.join(PASTA_DADOS, "leads.json");
let filaEscrita = Promise.resolve();

// garante que a pasta data/ exista (mesmo que não venha no repositório)
try { fs.mkdirSync(PASTA_DADOS, { recursive: true }); } catch (e) { console.error(e); }

function lerLeads() {
  try { return JSON.parse(fs.readFileSync(ARQUIVO, "utf8")); }
  catch (e) { return []; }
}
function salvarLeads(lista) {
  filaEscrita = filaEscrita.then(() => {
    fs.mkdirSync(PASTA_DADOS, { recursive: true });
    return fs.promises.writeFile(ARQUIVO, JSON.stringify(lista, null, 2));
  });
  return filaEscrita;
}

/* =========================================================================
   Autenticação simples por token assinado (HMAC) — sem estado no servidor
   ========================================================================= */
function assinar(payload) {
  const corpo = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const assinatura = crypto.createHmac("sha256", AUTH_SECRET).update(corpo).digest("base64url");
  return corpo + "." + assinatura;
}
function verificar(token) {
  if (!token || token.indexOf(".") < 0) return null;
  const [corpo, assinatura] = token.split(".");
  const esperada = crypto.createHmac("sha256", AUTH_SECRET).update(corpo).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperada))) return null;
  try {
    const dados = JSON.parse(Buffer.from(corpo, "base64url").toString());
    if (dados.exp && Date.now() > dados.exp) return null;
    return dados;
  } catch (e) { return null; }
}
function exigirLogin(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const dados = verificar(token);
  if (!dados) return res.status(401).json({ ok: false, erro: "Não autorizado" });
  req.usuario = dados.u;
  next();
}

/* =========================================================================
   Anti-spam simples: limite por IP em memória
   ========================================================================= */
const contadorIP = new Map();
function limitar(req, res, next) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const agora = Date.now();
  const reg = contadorIP.get(ip) || { n: 0, t: agora };
  if (agora - reg.t > 60000) { reg.n = 0; reg.t = agora; }
  reg.n++;
  contadorIP.set(ip, reg);
  if (reg.n > 20) return res.status(429).json({ ok: false, erro: "Muitas tentativas. Tente mais tarde." });
  next();
}

/* =========================================================================
   ROTAS
   ========================================================================= */

/* Recebe um lead (chamado pela landing). Público. */
app.options("/api/leads", corsLeads);
app.post("/api/leads", corsLeads, limitar, async (req, res) => {
  try {
    const body = req.body || {};

    // honeypot: se o campo oculto vier preenchido, é bot — responde ok sem salvar
    if (body._gotcha) return res.json({ ok: true });

    // separa campos de controle dos dados do formulário
    const { _origem, _gotcha, ...campos } = body;
    const temAlgo = Object.values(campos).some((v) => String(v || "").trim());
    if (!temAlgo) return res.status(400).json({ ok: false, erro: "Envio vazio" });

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const lead = {
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      status: "novo",             // novo | contatado | descartado
      nota: "",
      origem: _origem || "",
      ip,
      dados: campos,
    };

    const lista = lerLeads();
    lista.unshift(lead);
    await salvarLeads(lista);
    res.json({ ok: true });
  } catch (e) {
    console.error("Erro ao salvar lead:", e);
    res.status(500).json({ ok: false, erro: "Erro ao salvar o lead" });
  }
});

/* Login do painel */
app.post("/api/login", (req, res) => {
  const { usuario, senha } = req.body || {};
  const okUser = crypto.timingSafeEqual(Buffer.from(String(usuario || "")), Buffer.from(ADMIN_USER)) ||
                 String(usuario || "") === ADMIN_USER;
  const okSenha = String(senha || "").length === ADMIN_PASSWORD.length &&
                  crypto.timingSafeEqual(Buffer.from(String(senha)), Buffer.from(ADMIN_PASSWORD));
  if (!okUser || !okSenha) return res.status(401).json({ ok: false, erro: "Usuário ou senha inválidos" });
  const token = assinar({ u: ADMIN_USER, exp: Date.now() + 1000 * 60 * 60 * 12 }); // 12h
  res.json({ ok: true, token, usuario: ADMIN_USER });
});

/* Lista de leads com filtros */
app.get("/api/leads", exigirLogin, (req, res) => {
  const { status, q, from, to } = req.query;
  let lista = lerLeads();
  if (status && status !== "todos") lista = lista.filter((l) => l.status === status);
  if (from) lista = lista.filter((l) => l.criadoEm >= from);
  if (to) lista = lista.filter((l) => l.criadoEm <= to + "T23:59:59");
  if (q) {
    const t = String(q).toLowerCase();
    lista = lista.filter((l) => JSON.stringify(l.dados).toLowerCase().includes(t));
  }
  res.json({ ok: true, total: lista.length, leads: lista });
});

/* Estatísticas para os KPIs e o gráfico */
app.get("/api/stats", exigirLogin, (req, res) => {
  const lista = lerLeads();
  const hoje = new Date().toISOString().slice(0, 10);
  const porDia = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    porDia[d.toISOString().slice(0, 10)] = 0;
  }
  lista.forEach((l) => { const d = l.criadoEm.slice(0, 10); if (d in porDia) porDia[d]++; });
  res.json({
    ok: true,
    total: lista.length,
    novos: lista.filter((l) => l.status === "novo").length,
    contatados: lista.filter((l) => l.status === "contatado").length,
    hoje: lista.filter((l) => l.criadoEm.slice(0, 10) === hoje).length,
    porDia: Object.entries(porDia).map(([dia, n]) => ({ dia, n })),
  });
});

/* Atualiza status/nota */
app.patch("/api/leads/:id", exigirLogin, async (req, res) => {
  const lista = lerLeads();
  const lead = lista.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ ok: false, erro: "Lead não encontrado" });
  if (typeof req.body.status === "string") lead.status = req.body.status;
  if (typeof req.body.nota === "string") lead.nota = req.body.nota;
  await salvarLeads(lista);
  res.json({ ok: true, lead });
});

/* Exclui um lead */
app.delete("/api/leads/:id", exigirLogin, async (req, res) => {
  let lista = lerLeads();
  const antes = lista.length;
  lista = lista.filter((l) => l.id !== req.params.id);
  if (lista.length === antes) return res.status(404).json({ ok: false, erro: "Lead não encontrado" });
  await salvarLeads(lista);
  res.json({ ok: true });
});

/* Exporta CSV */
app.get("/api/export", exigirLogin, (req, res) => {
  const lista = lerLeads();
  const colunas = new Set(["criadoEm", "status", "origem"]);
  lista.forEach((l) => Object.keys(l.dados).forEach((k) => colunas.add(k)));
  const cols = [...colunas];
  const escapar = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const linhas = [cols.join(";")];
  lista.forEach((l) => {
    linhas.push(cols.map((c) => escapar(c in l ? l[c] : l.dados[c])).join(";"));
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
  res.send("﻿" + linhas.join("\r\n")); // BOM para acentos no Excel
});

/* ---------- Arquivos estáticos ----------
   A LANDING fica na pasta "site/" e é servida na raiz "/".
   (coloque aí o index.html, css, js e img da sua landing)          */
app.use(express.static(path.join(__dirname, "site")));

/* Painel e saúde */
app.get("/painel", (req, res) => res.sendFile(path.join(__dirname, "public", "painel.html")));
app.get("/health", (req, res) => res.json({ ok: true }));
/* fallback: enquanto não houver site/index.html, "/" leva ao painel */
app.get("/", (req, res) => res.redirect("/painel"));

/* tratador de erros geral: nunca deixa a requisição travar sem resposta */
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  if (!res.headersSent) res.status(500).json({ ok: false, erro: "Erro interno" });
});

app.listen(PORT, () => {
  console.log(`\n  Landing:  http://localhost:${PORT}/`);
  console.log(`  Painel:   http://localhost:${PORT}/painel`);
  console.log(`  Endpoint: http://localhost:${PORT}/api/leads`);
  console.log(`  Usuário:  ${ADMIN_USER}\n`);
});
