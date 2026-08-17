/* =========================================================================
   MOTOR DA LANDING — lê o CONFIG (js/config.js) e monta a página.
   Não precisa editar este arquivo — mexa só no config.js.
   ========================================================================= */
(function () {
  "use strict";

  function pega(caminho) { return caminho.split(".").reduce(function (o, k) { return o != null ? o[k] : undefined; }, CONFIG); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }

  /* 1. Cores + fonte */
  function tema() {
    var r = document.documentElement.style, c = CONFIG.cores;
    r.setProperty("--primaria", c.primaria);
    r.setProperty("--primaria-escura", c.primariaEscura);
    r.setProperty("--destaque", c.destaque);
    r.setProperty("--texto", c.texto);
    r.setProperty("--titulo", c.titulo);
    r.setProperty("--claro", c.claro);
    if (CONFIG.empresa.fonteTitulos) r.setProperty("--fonte-titulos", CONFIG.empresa.fonteTitulos);
  }

  /* 2. Textos, links e imagens (com placeholder se a imagem faltar) */
  function estaticos() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) { var v = pega(el.getAttribute("data-cfg")); if (v !== undefined) el.textContent = v; });
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) { var v = pega(el.getAttribute("data-cfg-href")); if (v !== undefined) el.setAttribute("href", v); });
    document.querySelectorAll("[data-cfg-src]").forEach(function (el) {
      var v = pega(el.getAttribute("data-cfg-src"));
      if (v === undefined) return;
      el.setAttribute("src", v);
      el.addEventListener("error", function () {
        var ph = document.createElement("div");
        ph.className = "foto-placeholder";
        ph.textContent = el.getAttribute("alt") || "Sua imagem aqui";
        if (el.parentNode) el.parentNode.replaceChild(ph, el);
      });
    });
  }

  /* 2b. Hero: imagem de fundo (lado a lado) + opacidade da camada */
  function heroBg() {
    var ov = CONFIG.hero.overlay;
    if (ov === undefined || ov === null) ov = 0.5;
    document.documentElement.style.setProperty("--hero-overlay", ov);
    if (CONFIG.hero.imagem) {
      document.documentElement.style.setProperty("--hero-img", "url('" + CONFIG.hero.imagem + "')");
    }
  }

  /* 3. Título da aba + favicon */
  function meta() {
    document.title = CONFIG.empresa.nome + " — " + (CONFIG.hero.eyebrow || "");
    var fav = document.querySelector('link[rel="icon"]'); if (fav) fav.setAttribute("href", CONFIG.empresa.favicon);
  }

  /* 4. WhatsApp */
  function whatsapp() {
    var url = "https://wa.me/" + CONFIG.contato.whatsappNumero + "?text=" + encodeURIComponent(CONFIG.contato.whatsappMensagem || "");
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) { el.setAttribute("href", url); });
  }

  /* 5. Listas dinâmicas */
  var construtores = {
    bullets: function () { return CONFIG.confianca.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join(""); },
    servicos: function () {
      return CONFIG.servicos.cards.map(function (c) {
        return '<div class="card"><div class="card-img"><img src="' + esc(c.imagem) + '" alt="' + esc(c.titulo) + '" onerror="this.outerHTML=\'&lt;div class=&quot;foto-placeholder&quot;&gt;' + esc(c.titulo) + '&lt;/div&gt;\'"></div>' +
               '<div class="card-body"><h3>' + esc(c.titulo) + '</h3><p>' + esc(c.texto) + '</p></div></div>';
      }).join("");
    },
    requisitos: function () {
      return CONFIG.requisitos.itens.map(function (r) {
        return '<div class="req"><div class="ic">' + esc(r.icone) + '</div><h3>' + esc(r.titulo) + '</h3><p>' + esc(r.texto) + '</p></div>';
      }).join("");
    },
    faq: function () {
      return CONFIG.faq.map(function (f) {
        return '<div class="faq-item"><button type="button">' + esc(f.pergunta) + '<span class="mais">+</span></button><div class="resp"><p>' + esc(f.resposta) + '</p></div></div>';
      }).join("");
    }
  };
  function listas() {
    document.querySelectorAll("[data-list]").forEach(function (el) { var n = el.getAttribute("data-list"); if (construtores[n]) el.innerHTML = construtores[n](); });
  }

  /* 6. Monta os campos do formulário a partir do config */
  function montarForm() {
    var alvo = document.querySelector("[data-campos]");
    if (!alvo || !CONFIG.leads) return;
    alvo.innerHTML = CONFIG.leads.campos.map(function (c) {
      var req = c.obrigatorio ? " required" : "";
      var campo = c.tipo === "textarea"
        ? '<textarea id="' + c.name + '" name="' + c.name + '"' + req + '></textarea>'
        : '<input type="' + (c.tipo || "text") + '" id="' + c.name + '" name="' + c.name + '"' + req + '>';
      return '<div class="form-campo"><label for="' + c.name + '">' + esc(c.label) + (c.obrigatorio ? " *" : "") + "</label>" + campo + "</div>";
    }).join("");
  }

  /* 7. Acordeão FAQ */
  function acordeao() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-item button");
      if (btn) btn.parentNode.classList.toggle("aberto");
    });
  }

  /* 8. Envio do formulário de leads */
  function enviarForm() {
    var form = document.querySelector("#form-lead");
    var msg = document.querySelector("#form-msg");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var dados = {};
      CONFIG.leads.campos.forEach(function (c) { dados[c.name] = (form[c.name] && form[c.name].value || "").trim(); });
      dados._origem = CONFIG.empresa.nome + " - Landing";

     function ok() {
        form.reset();
        window.location.href = "sucesso.html";
      }
      function erro() {
        msg.className = "form-msg erro";
        msg.textContent = "Não foi possível enviar agora. Tente novamente ou use o WhatsApp.";
      }

      if (CONFIG.leads.endpoint) {
        // Envia para o painel/webhook (Formspree, Getform, n8n, Apps Script...)
        fetch(CONFIG.leads.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(dados)
        }).then(function (r) { r.ok ? ok() : erro(); }).catch(erro);
      } else {
        // Sem endpoint: abre o e-mail do cliente com os dados preenchidos
        var corpo = Object.keys(dados).map(function (k) { return k + ": " + dados[k]; }).join("%0D%0A");
        var assunto = encodeURIComponent("Novo lead - " + CONFIG.empresa.nome);
        window.location.href = "mailto:" + CONFIG.contato.email + "?subject=" + assunto + "&body=" + corpo;
        ok();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    tema(); estaticos(); heroBg(); meta(); whatsapp(); listas(); montarForm(); acordeao(); enviarForm();
  });
})();
