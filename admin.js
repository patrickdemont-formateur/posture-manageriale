/* ==========================================================================
   admin.js - Espace animateur : accueil (liens + QR codes), moments collectifs, administration, aide
   Affiché quand l'adresse ne contient pas de paramètre ?p=.
   Aucune protection par mot de passe (voulu) ; aucun envoi de données.
   Les réglages sont conservés uniquement sur l'appareil de l'animateur.
   ========================================================================== */
(function () {
  "use strict";

  var SETTINGS_KEY = "posture-manageriale-admin-v1";
  var PARTICIPANTS = ["A", "B", "C"];

  window.LM_ADMIN = { start: start };

  function start(LM) {
    var D = LM.D;
    var h = LM.h;
    var append = LM.append;
    var root = LM.root;
    var toast = LM.toast;

    /* ------------------------------------------------------------------
       Mise en page « large » et roue crantée
       ------------------------------------------------------------------ */
    root.classList.add("container-wide");
    var headerInner = document.querySelector(".header-inner");
    if (headerInner) { headerInner.classList.add("container-wide"); }
    var gear = document.getElementById("admin-link");
    if (gear) { gear.hidden = false; }
    var footerInner = document.querySelector(".site-footer .container");
    if (footerInner) { footerInner.classList.add("container-wide"); }

    /* ------------------------------------------------------------------
       Réglages (localStorage de l'animateur)
       ------------------------------------------------------------------ */
    var settings = { names: ["", "", ""], base: "" };
    var storageOk = true;

    (function load() {
      try {
        var raw = window.localStorage.getItem(SETTINGS_KEY);
        if (!raw) { return; }
        var o = JSON.parse(raw);
        if (o && Array.isArray(o.names)) {
          for (var i = 0; i < 3; i++) {
            settings.names[i] = typeof o.names[i] === "string" ? o.names[i].slice(0, LM.NAME_MAX) : "";
          }
        }
        if (o && typeof o.base === "string") { settings.base = o.base.slice(0, 300); }
      } catch (e) { storageOk = false; }
    })();

    function saveSettings() {
      try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
      catch (e) { storageOk = false; }
    }

    /* ------------------------------------------------------------------
       Construction des liens
       ------------------------------------------------------------------ */
    function detectedBase() {
      return window.location.href.split("#")[0].split("?")[0];
    }

    function isValidBase(u) {
      return /^(https?|file):\/\/\S+$/i.test(u);
    }

    function normalizeBase(u) {
      u = u.split("#")[0].split("?")[0];
      var last = u.slice(u.lastIndexOf("/") + 1);
      if (u.slice(-1) !== "/" && !/\.[a-z0-9]+$/i.test(last)) { u += "/"; }
      return u;
    }

    function baseUrl() {
      var custom = (settings.base || "").trim();
      return custom && isValidBase(custom) ? normalizeBase(custom) : detectedBase();
    }

    function cleanNames() {
      return settings.names.map(LM.cleanName);
    }

    function linkFor(P) {
      var url = baseUrl() + "?p=" + P;
      var names = cleanNames();
      if (names.some(function (n) { return n; })) {
        url += "&n=" + encodeURIComponent(names.join("~"));
      }
      return url;
    }

    function label(P) {
      var n = cleanNames()[PARTICIPANTS.indexOf(P)];
      return n ? n + " (" + P + ")" : "Participant " + P;
    }

    function roleHolder(round, role) {
      var q = PARTICIPANTS.filter(function (x) { return D.rotation[round][x] === role; })[0];
      return label(q);
    }

    /* ------------------------------------------------------------------
       Composants
       ------------------------------------------------------------------ */
    function rotationTable() {
      var rows = D.scenarios.map(function (sc, i) {
        var r = i + 1;
        return h("tr", null,
          h("th", { scope: "row", text: "Manche " + r }),
          h("td", { text: sc.titre }),
          h("td", { text: roleHolder(r, "manager") }),
          h("td", { text: roleHolder(r, "interlocuteur") }),
          h("td", { text: roleHolder(r, "observateur") }));
      });
      return h("div", { class: "table-wrap" },
        h("table", { class: "table" },
          h("caption", { text: "Qui joue quel rôle, manche par manche" }),
          h("thead", null, h("tr", null,
            h("th", { scope: "col", text: "Manche" }),
            h("th", { scope: "col", text: "Situation" }),
            h("th", { scope: "col", text: "Manager" }),
            h("th", { scope: "col", text: "Interlocuteur (direction, puis équipe)" }),
            h("th", { scope: "col", text: "Observateur" }))),
          h("tbody", null, rows)));
    }

    function storageNote() {
      if (storageOk) { return null; }
      return h("p", { class: "callout callout-warn", role: "note" },
        h("strong", { text: "Point de vigilance : " }),
        "le stockage local est indisponible (navigation privée ?). Les prénoms saisis ne seront pas conservés si vous actualisez la page.");
    }

    function openQrDialog(P, url, qr) {
      var dlg = document.createElement("dialog");
      dlg.className = "qr-dialog";
      dlg.setAttribute("aria-labelledby", "qr-dlg-title");
      var closeBtn = h("button", { type: "button", class: "btn btn-primary" }, "Fermer");
      dlg.appendChild(h("h2", { id: "qr-dlg-title", text: label(P) }));
      dlg.appendChild(h("div", { class: "qr-box qr-box-large" }, window.QR.svgElement(qr, "QR code du lien de " + label(P))));
      dlg.appendChild(h("p", { class: "url-text", text: url }));
      dlg.appendChild(h("div", { class: "dialog-actions" }, closeBtn));
      document.body.appendChild(dlg);

      function closeDlg() {
        if (typeof dlg.close === "function") { dlg.close(); }
        dlg.removeAttribute("open");
        if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); }
      }
      closeBtn.addEventListener("click", closeDlg);
      dlg.addEventListener("click", function (ev) { if (ev.target === dlg) { closeDlg(); } });
      dlg.addEventListener("close", function () { if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); } });
      if (typeof dlg.showModal === "function") { dlg.showModal(); } else { dlg.setAttribute("open", ""); }
      closeBtn.focus();
    }

    function accessTile(P) {
      var idx = PARTICIPANTS.indexOf(P);
      var name = LM.cleanName(settings.names[idx]);
      var url = linkFor(P);
      var qr = window.QR ? window.QR.encode(url) : null;
      var inputId = "url-" + P;

      var tile = h("section", { class: "card access-tile", "aria-labelledby": "tile-title-" + P });
      tile.appendChild(h("h2", { id: "tile-title-" + P, text: "Participant " + P }));
      tile.appendChild(name
        ? h("p", { class: "access-name", text: name })
        : h("p", { class: "access-name access-name-empty", text: "Prénom non renseigné" }));

      if (qr) {
        tile.appendChild(h("div", { class: "qr-box" }, window.QR.svgElement(qr, "QR code du lien du participant " + P)));
      } else {
        tile.appendChild(h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "QR code indisponible : " }),
          "le lien est trop long. Raccourcissez les prénoms (Administration) ou utilisez le lien ci-dessous."));
      }

      var input = h("input", { type: "text", id: inputId, class: "url-input", readonly: true, value: url, spellcheck: "false", autocomplete: "off" });
      input.addEventListener("focus", function () { input.select(); });
      tile.appendChild(h("div", { class: "field" },
        h("label", { for: inputId, text: "Adresse du lien (à copier ou à saisir)" }), input));

      var copyBtn = h("button", { type: "button", class: "btn btn-primary" }, "Copier l’adresse");
      var copyTimer = null;
      copyBtn.addEventListener("click", function () {
        LM.copyText(url).then(function (ok) {
          if (ok) {
            toast("Adresse du participant " + P + " copiée.");
            copyBtn.textContent = "Adresse copiée";
            window.clearTimeout(copyTimer);
            copyTimer = window.setTimeout(function () { copyBtn.textContent = "Copier l’adresse"; }, 3000);
          } else {
            input.focus();
            input.select();
            toast("Copie automatique impossible : l’adresse est sélectionnée, faites Ctrl+C.");
          }
        });
      });

      var subject = "Séquence « Posture managériale » : votre lien personnel";
      var body = "Bonjour" + (name ? " " + name : "") + ",\n\nVoici votre lien personnel pour l’exercice. "
        + "Ouvrez-le sur votre ordinateur ou votre smartphone (et uniquement le vôtre) :\n\n" + url + "\n";
      var mail = h("a", {
        class: "btn btn-secondary",
        href: "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
      }, "Préparer un e-mail");

      var actions = h("div", { class: "actions" }, copyBtn);
      if (qr) {
        actions.appendChild(h("button", {
          type: "button", class: "btn btn-secondary",
          onclick: function () { openQrDialog(P, url, qr); }
        }, "Agrandir le QR code"));
      }
      actions.appendChild(mail);
      tile.appendChild(actions);
      return tile;
    }

    function pageLinks(current) {
      var links = [];
      if (current !== "home") { links.push(h("a", { class: "btn btn-secondary", href: "#accueil" }, "Retour aux liens des participants")); }
      if (current !== "admin") { links.push(h("a", { class: "btn btn-secondary", href: "#admin" }, "Administration")); }
      if (current !== "aide") { links.push(h("a", { class: "btn btn-secondary", href: "#aide" }, "Aide")); }
      return h("nav", { class: "actions", "aria-label": "Navigation de l’espace animateur" }, links);
    }

    /* ------------------------------------------------------------------
       Vue : accueil (3 tuiles)
       ------------------------------------------------------------------ */
    function viewHome() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Posture managériale : accès des participants" }));
      wrap.appendChild(h("p", { class: "muted", text: "Projetez cette page pour faire scanner les QR codes, ou envoyez à chacun son adresse par e-mail. Chaque participant utilise uniquement son propre lien, sur le même appareil pendant tout l’exercice." }));
      if (window.location.protocol === "file:" && !(settings.base || "").trim()) {
        wrap.appendChild(h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Point de vigilance : " }),
          "cette page est ouverte depuis un fichier local. Ces liens ne fonctionneront pas sur les autres appareils : publiez le site (GitHub Pages) et ouvrez-le depuis son adresse, ou renseignez l’adresse du site dans l’Administration."));
      }
      append(wrap, storageNote());
      wrap.appendChild(h("div", { class: "access-grid" }, PARTICIPANTS.map(accessTile)));
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "home-coll" },
        h("h2", { id: "home-coll", text: "Animation collective" }),
        h("p", { class: "muted", text: "Quatre moments à projeter, dans l’ordre conseillé. Ils se pilotent depuis cet appareil." }),
        h("ol", { class: "collectif-links" }, COLLECTIF.map(function (c) {
          return h("li", null, h("a", { class: "collectif-link", href: "#" + c.route },
            h("span", { class: "collectif-title", text: c.titre }),
            h("span", { class: "collectif-desc", text: c.desc }),
            h("span", { class: "collectif-min", text: "environ " + c.min + " min" })));
        }))));
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "home-rot" },
        h("h2", { id: "home-rot", text: "Rotation des rôles" }),
        rotationTable()));
      wrap.appendChild(pageLinks("home"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : administration et paramétrage
       ------------------------------------------------------------------ */
    function viewAdmin() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Administration et paramètres" }));
      append(wrap, storageNote());

      /* Prénoms */
      var namesCard = h("section", { class: "card", "aria-labelledby": "adm-names" });
      namesCard.appendChild(h("h2", { id: "adm-names", text: "Prénoms des participants" }));
      namesCard.appendChild(h("p", { text: "Les prénoms évitent les confusions et personnalisent l’exercice (accueil, répartition des rôles de chaque manche). Ils sont facultatifs." }));
      PARTICIPANTS.forEach(function (P, i) {
        var id = "adm-name-" + P;
        namesCard.appendChild(h("div", { class: "field" },
          h("label", { for: id, text: "Prénom du participant " + P }),
          h("input", {
            type: "text", id: id, maxlength: LM.NAME_MAX, autocomplete: "off", value: settings.names[i],
            oninput: function (ev) { settings.names[i] = ev.target.value; saveSettings(); }
          })));
      });
      namesCard.appendChild(h("p", { class: "callout callout-warn", role: "note" },
        h("strong", { text: "À savoir : " }),
        "un site statique n’a pas de serveur pour retenir les prénoms. Ils sont donc intégrés dans chaque lien et chaque QR code : après une modification, renvoyez ou faites rescanner les liens. Ils apparaissent dans l’adresse, donc aussi côté hébergeur du site : utilisez un prénom d’usage ou des initiales si cela pose problème."));
      namesCard.appendChild(h("div", { class: "actions" },
        h("a", { class: "btn btn-primary", href: "#accueil" }, "Voir les liens et QR codes")));
      wrap.appendChild(namesCard);

      /* Adresse du site */
      var baseId = "adm-base";
      var baseInput = h("input", {
        type: "url", id: baseId, autocomplete: "off", spellcheck: "false",
        placeholder: detectedBase(), value: settings.base, "aria-describedby": "adm-base-help adm-base-msg"
      });
      var baseMsg = h("p", { id: "adm-base-msg", class: "small", role: "status", "aria-live": "polite" });
      function checkBase() {
        var v = (settings.base || "").trim();
        if (!v) { baseMsg.textContent = "Adresse utilisée : " + detectedBase() + " (détectée automatiquement)."; baseMsg.className = "small muted"; }
        else if (!isValidBase(v)) { baseMsg.textContent = "Adresse non valide : elle doit commencer par https:// . L’adresse détectée est utilisée à la place."; baseMsg.className = "small is-error"; }
        else { baseMsg.textContent = "Adresse utilisée : " + normalizeBase(v); baseMsg.className = "small muted"; }
      }
      baseInput.addEventListener("input", function (ev) { settings.base = ev.target.value; saveSettings(); checkBase(); });
      var baseCard = h("section", { class: "card", "aria-labelledby": "adm-base-title" },
        h("h2", { id: "adm-base-title", text: "Adresse du site" }),
        h("p", { id: "adm-base-help", text: "Par défaut, l’adresse de cette page est utilisée pour fabriquer les liens. Ne la modifiez que si vous préparez les liens depuis un autre emplacement (par exemple en testant en local) : saisissez l’adresse publique du site, par exemple https://compte.github.io/posture-manageriale/" }),
        h("div", { class: "field" }, h("label", { for: baseId, text: "Adresse publique du site (facultatif)" }), baseInput),
        baseMsg);
      checkBase();
      wrap.appendChild(baseCard);

      /* Remise à zéro */
      var resetCard = h("section", { class: "card", "aria-labelledby": "adm-reset" },
        h("h2", { id: "adm-reset", text: "Remise à zéro sur cet appareil" }),
        h("p", { text: "Utile entre deux sessions ou après un test réalisé sur cet ordinateur." }),
        h("div", { class: "actions" },
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Effacer les prénoms et l’adresse du site enregistrés sur cet appareil ?", "Effacer").then(function (ok) {
                if (!ok) { return; }
                settings = { names: ["", "", ""], base: "" };
                try { window.localStorage.removeItem(SETTINGS_KEY); } catch (e) { /* ignoré */ }
                render(true);
                toast("Les paramètres ont été effacés.");
              });
            }
          }, "Effacer les paramètres"),
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Effacer la progression, les observations et les synthèses des participants A, B et C enregistrées sur cet appareil ?", "Effacer").then(function (ok) {
                if (!ok) { return; }
                PARTICIPANTS.forEach(function (P) {
                  try { window.localStorage.removeItem("posture-manageriale-v1:" + P); } catch (e) { /* ignoré */ }
                });
                toast("La progression des participants a été effacée sur cet appareil.");
              });
            }
          }, "Effacer la progression des participants")));
      wrap.appendChild(resetCard);

      wrap.appendChild(pageLinks("admin"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Moments collectifs : réglages, compteurs (rien n'est envoyé nulle part)
       ------------------------------------------------------------------ */
    var COLLECTIF_KEY = "posture-manageriale-collectif-v1";
    var COUNT_MAX = 999;
    var collectif = { vote: {}, zones: {} };
    D.vote.options.forEach(function (o) { collectif.vote[o.id] = 0; });

    function validCount(n) { return typeof n === "number" && n % 1 === 0 && n >= 0 && n <= COUNT_MAX; }

    (function loadCollectif() {
      try {
        var raw = window.localStorage.getItem(COLLECTIF_KEY);
        if (!raw) { return; }
        var o = JSON.parse(raw);
        if (o && o.vote && typeof o.vote === "object") {
          D.vote.options.forEach(function (op) { if (validCount(o.vote[op.id])) { collectif.vote[op.id] = o.vote[op.id]; } });
        }
        if (o && o.zones && typeof o.zones === "object") {
          D.zones.situations.forEach(function (sit) {
            var z = o.zones[sit.id];
            if (z && typeof z === "object") {
              var rec = {};
              D.zones.liste.forEach(function (zz) { rec[zz.id] = validCount(z[zz.id]) ? z[zz.id] : 0; });
              collectif.zones[sit.id] = rec;
            }
          });
        }
      } catch (e) { storageOk = false; }
    })();

    function saveCollectif() {
      try { window.localStorage.setItem(COLLECTIF_KEY, JSON.stringify(collectif)); }
      catch (e) { storageOk = false; }
    }

    function zoneCounts(sitId) {
      if (!collectif.zones[sitId]) {
        var rec = {};
        D.zones.liste.forEach(function (z) { rec[z.id] = 0; });
        collectif.zones[sitId] = rec;
      }
      return collectif.zones[sitId];
    }

    /* Compteur + / - : retourne { el, paint } */
    function makeCounter(label, get, set, onChange) {
      var value = h("span", { class: "cnt-value", "aria-live": "polite", "aria-atomic": "true" });
      var minus = h("button", { type: "button", class: "tile-btn tile-minus", "aria-label": "Retirer une personne : " + label }, "\u2212");
      var plus = h("button", { type: "button", class: "tile-btn tile-plus", "aria-label": "Ajouter une personne : " + label }, "+");
      function paint() {
        var v = get();
        value.textContent = String(v);
        minus.setAttribute("aria-disabled", v <= 0 ? "true" : "false");
        plus.setAttribute("aria-disabled", v >= COUNT_MAX ? "true" : "false");
      }
      plus.addEventListener("click", function () {
        var v = get();
        if (v >= COUNT_MAX) { return; }
        set(v + 1); saveCollectif(); paint(); if (onChange) { onChange(); }
      });
      minus.addEventListener("click", function () {
        var v = get();
        if (v <= 0) { return; }
        set(v - 1); saveCollectif(); paint(); if (onChange) { onChange(); }
      });
      paint();
      return { el: h("div", { class: "cnt" }, minus, value, plus), paint: paint };
    }

    function toggleButton(labelShow, labelHide, target) {
      var btn = h("button", { type: "button", class: "btn btn-secondary", "aria-expanded": "false" }, labelShow);
      btn.addEventListener("click", function () {
        var opening = target.hidden;
        target.hidden = !opening;
        btn.setAttribute("aria-expanded", opening ? "true" : "false");
        btn.textContent = opening ? labelHide : labelShow;
      });
      return btn;
    }

    var COLLECTIF = [
      { route: "fil",   titre: "Fil rouge",             min: 3,  desc: "Contester, arbitrer, porter : le cadre de la séquence." },
      { route: "vote",  titre: "Question provocatrice", min: 5,  desc: "« Votre direction maintient sa décision… » : vote à main levée." },
      { route: "piege", titre: "Le piège",              min: 4,  desc: "« Vous êtes d’accord avec ça, vous ? » : réponse fragile ou professionnelle." },
      { route: "zones", titre: "Jeu des trois zones",   min: 12, desc: "Dix situations : je décide, j’influence ou j’applique ?" }
    ];

    function collectifNav(current) {
      var i = -1;
      COLLECTIF.forEach(function (c, idx) { if (c.route === current) { i = idx; } });
      var links = [h("a", { class: "btn btn-secondary", href: "#accueil" }, "Retour à l’accueil")];
      if (i > 0) { links.push(h("a", { class: "btn btn-secondary", href: "#" + COLLECTIF[i - 1].route }, "Précédent : " + COLLECTIF[i - 1].titre)); }
      if (i >= 0 && i < COLLECTIF.length - 1) { links.push(h("a", { class: "btn btn-primary", href: "#" + COLLECTIF[i + 1].route }, "Suivant : " + COLLECTIF[i + 1].titre)); }
      return h("nav", { class: "actions", "aria-label": "Navigation entre les moments collectifs" }, links);
    }

    /* ------------------------------------------------------------------
       Vue : fil rouge
       ------------------------------------------------------------------ */
    function viewFil() {
      var F = D.fil;
      var wrap = h("div", { class: "view projection" });
      wrap.appendChild(h("h1", { text: F.titre }));
      wrap.appendChild(h("div", { class: "fil-grid" }, F.etapes.map(function (e, i) {
        return h("section", { class: "card fil-card", "aria-labelledby": "fil-" + i },
          h("h2", { id: "fil-" + i, text: e.nom }),
          h("p", { class: "fil-quand", text: e.quand }),
          h("ul", null, e.points.map(function (p) { return h("li", { text: p }); })));
      })));
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "fil-desc" },
        h("h2", { id: "fil-desc", text: "Pour contester : le DESC, déjà connu" }),
        h("ul", { class: "desc-list desc-list-big" }, D.desc.map(function (d) {
          return h("li", null, h("strong", { class: "desc-letter", text: d.lettre }), " " + d.phrase);
        }))));
      wrap.appendChild(h("blockquote", { class: "quote quote-big", text: F.message }));
      wrap.appendChild(collectifNav("fil"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : question provocatrice (vote à main levée)
       ------------------------------------------------------------------ */
    function viewVote() {
      var V = D.vote;
      var wrap = h("div", { class: "view projection" });
      wrap.appendChild(h("h1", { text: "Question provocatrice" }));
      wrap.appendChild(h("blockquote", { class: "quote quote-big", text: V.question }));
      wrap.appendChild(h("p", { class: "muted", text: "Vote à main levée : comptez les mains pour chaque réponse avec + et −. Les chiffres restent sur cet appareil." }));

      var total = h("p", { class: "vote-total", role: "status", "aria-live": "polite" });
      var painters = [];

      function sum() { return V.options.reduce(function (a, o) { return a + collectif.vote[o.id]; }, 0); }
      function refresh() {
        var t = sum();
        total.textContent = t === 0 ? "Aucune main comptée pour l’instant." : "Total : " + t + " personne" + (t > 1 ? "s" : "") + ".";
        painters.forEach(function (fn) { fn(t); });
      }

      var grid = h("div", { class: "vote-grid" }, V.options.map(function (op) {
        var fill = h("div", { class: "bar-fill" });
        var lab = h("p", { class: "bar-label" });
        var counter = makeCounter("réponse " + op.id, function () { return collectif.vote[op.id]; }, function (v) { collectif.vote[op.id] = v; }, refresh);
        painters.push(function (t) {
          var n = collectif.vote[op.id];
          var pct = t > 0 ? Math.round((n * 100) / t) : 0;
          fill.style.width = pct + "%";
          lab.textContent = n + " personne" + (n > 1 ? "s" : "") + " (" + pct + " %)";
        });
        return h("div", { class: "vote-card", role: "group", "aria-labelledby": "vote-op-" + op.id },
          h("p", { class: "vote-letter", text: op.id }),
          h("p", { class: "vote-text", id: "vote-op-" + op.id, text: op.texte }),
          counter.el,
          h("div", { class: "bar", "aria-hidden": "true" }, fill),
          lab);
      }));
      wrap.appendChild(grid);
      wrap.appendChild(total);

      var pistes = h("section", { class: "card", hidden: true, "aria-labelledby": "vote-pistes" },
        h("h2", { id: "vote-pistes", text: "Pistes de lecture (à adapter)" }),
        h("ul", null, V.options.map(function (op) { return h("li", null, h("strong", { text: op.id + " : " }), op.lecture); })),
        h("p", { class: "muted", text: "Relances possibles :" }),
        h("ul", null, V.relances.map(function (r) { return h("li", { text: r }); })));
      var principe = h("section", { class: "card", hidden: true, "aria-labelledby": "vote-principe" },
        h("h2", { id: "vote-principe", text: "Principe à construire avec le groupe" }),
        h("ul", null, V.principes.map(function (p) { return h("li", { class: "principe", text: p }); })));

      wrap.appendChild(h("div", { class: "actions" },
        toggleButton("Afficher les pistes de lecture", "Masquer les pistes de lecture", pistes),
        toggleButton("Révéler le principe", "Masquer le principe", principe),
        h("button", {
          type: "button", class: "btn btn-warn",
          onclick: function () {
            LM.confirmAction("Remettre à zéro le décompte de la question provocatrice ?", "Remettre à zéro").then(function (ok) {
              if (!ok) { return; }
              D.vote.options.forEach(function (o) { collectif.vote[o.id] = 0; });
              saveCollectif();
              render(true);
              toast("Le décompte a été remis à zéro.");
            });
          }
        }, "Remettre le décompte à zéro")));
      wrap.appendChild(pistes);
      wrap.appendChild(principe);
      wrap.appendChild(collectifNav("vote"));

      /* initialisation des compteurs et des barres */
      refresh();
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : le piège
       ------------------------------------------------------------------ */
    function viewPiege() {
      var X = D.piege;
      var wrap = h("div", { class: "view projection" });
      wrap.appendChild(h("h1", { text: "Le piège" }));
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "piege-q" },
        h("h2", { id: "piege-q", text: X.qui + " dit à son manager :" }),
        h("blockquote", { class: "quote quote-big", text: "« " + X.phrase + " »" }),
        h("p", { class: "muted", text: "Que répondez-vous ? Laissez quelques personnes répondre à l’oral avant de poursuivre." })));

      var fragile = h("section", { class: "card compare-fragile", hidden: true, "aria-labelledby": "piege-f" },
        h("h2", { id: "piege-f", text: "Réponse managériale fragile" }),
        h("blockquote", { class: "quote", text: "« " + X.fragile.reponse + " »" }),
        h("p", { text: "Conséquences :" }),
        h("ul", null, X.fragile.consequences.map(function (c) { return h("li", { text: c }); })));
      var pro = h("section", { class: "card compare-pro", hidden: true, "aria-labelledby": "piege-p" },
        h("h2", { id: "piege-p", text: "Réponse professionnelle" }),
        h("blockquote", { class: "quote", text: "« " + X.pro.reponse + " »" }),
        h("blockquote", { class: "quote quote-big", text: X.conclusion }));

      var stage = 0;
      var next = h("button", { type: "button", class: "btn btn-primary" });
      var hide = h("button", { type: "button", class: "btn btn-secondary" }, "Tout masquer");
      function paint() {
        fragile.hidden = stage < 1;
        pro.hidden = stage < 2;
        next.textContent = stage === 0 ? "Afficher la réponse fragile" : (stage === 1 ? "Afficher la réponse professionnelle" : "Tout est affiché");
        next.setAttribute("aria-disabled", stage >= 2 ? "true" : "false");
      }
      next.addEventListener("click", function () { if (stage < 2) { stage += 1; paint(); } });
      hide.addEventListener("click", function () { stage = 0; paint(); });
      paint();

      wrap.appendChild(h("div", { class: "actions" }, next, hide));
      wrap.appendChild(fragile);
      wrap.appendChild(pro);
      wrap.appendChild(collectifNav("piege"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : jeu des trois zones
       ------------------------------------------------------------------ */
    var zoneIdx = 0;

    function viewZones() {
      var Z = D.zones;
      var n = Z.situations.length;
      var wrap = h("div", { class: "view projection" });
      wrap.appendChild(h("h1", { text: "Jeu des trois zones" }));
      var stage = h("div", { class: "zones-stage" });
      wrap.appendChild(stage);
      wrap.appendChild(collectifNav("zones"));

      function go(i) {
        zoneIdx = Math.max(0, Math.min(n, i));
        renderStage(true);
      }

      function situationStep(i) {
        var sit = Z.situations[i];
        var counts = zoneCounts(sit.id);
        var box = h("div", { class: "view" });
        var progress = h("p", { class: "eyebrow", tabindex: "-1", text: "Situation " + (i + 1) + " sur " + n });
        box.appendChild(progress);
        box.appendChild(h("section", { class: "card situation-card", "aria-label": "Situation à classer" },
          h("p", { class: "situation-text", text: sit.texte })));
        box.appendChild(h("p", { class: "muted", text: "Chaque participant se place physiquement dans la zone de son choix. Comptez les personnes de chaque zone avec + et −." }));

        var refLabels = {};
        var panels = h("div", { class: "zone-panels" }, Z.liste.map(function (z) {
          var counter = makeCounter("zone " + z.id + ", " + z.nom, function () { return counts[z.id]; }, function (v) { counts[z.id] = v; });
          refLabels[z.id] = h("p", { class: "zone-ref", hidden: true, text: "Zone de référence" });
          return h("div", { class: "zone-panel zone-" + z.id, role: "group", "aria-labelledby": "zone-t-" + z.id },
            h("p", { class: "zone-num", text: "Zone " + z.id }),
            h("h2", { id: "zone-t-" + z.id, text: z.nom }),
            h("p", { class: "zone-def", text: z.def }),
            counter.el,
            refLabels[z.id]);
        }));
        box.appendChild(panels);

        var refZone = Z.liste.filter(function (z) { return z.id === sit.zone; })[0];
        var explain = h("section", { class: "card", hidden: true, "aria-labelledby": "zone-expl" },
          h("h2", { id: "zone-expl", text: "Zone de référence : zone " + refZone.id + ", " + refZone.nom }),
          h("p", { text: sit.pourquoi }),
          sit.nuance ? h("p", { class: "muted", text: "Nuance : " + sit.nuance }) : null);
        var reveal = h("button", { type: "button", class: "btn btn-primary", "aria-expanded": "false" }, "Afficher la zone de référence");
        reveal.addEventListener("click", function () {
          var opening = explain.hidden;
          explain.hidden = !opening;
          reveal.setAttribute("aria-expanded", opening ? "true" : "false");
          reveal.textContent = opening ? "Masquer la zone de référence" : "Afficher la zone de référence";
          Z.liste.forEach(function (z) {
            var isRef = z.id === sit.zone;
            refLabels[z.id].hidden = !(opening && isRef);
            panels.querySelector(".zone-" + z.id).classList.toggle("is-ref", opening && isRef);
          });
        });

        box.appendChild(h("div", { class: "actions" },
          reveal,
          h("button", { type: "button", class: "btn btn-secondary", "aria-disabled": i === 0 ? "true" : "false", onclick: function () { if (i > 0) { go(i - 1); } } }, "Situation précédente"),
          h("button", { type: "button", class: "btn btn-primary", onclick: function () { go(i + 1); } }, i === n - 1 ? "Voir le bilan" : "Situation suivante")));
        box.appendChild(explain);
        return { el: box, focus: progress };
      }

      function bilanStep() {
        var box = h("div", { class: "view" });
        var title = h("h2", { tabindex: "-1", text: "Bilan : où le groupe s’est-il placé ?" });
        box.appendChild(title);
        var rows = Z.situations.map(function (sit, i) {
          var c = zoneCounts(sit.id);
          var short = sit.texte.length > 80 ? sit.texte.slice(0, 77) + "…" : sit.texte;
          return h("tr", null,
            h("th", { scope: "row", text: String(i + 1) }),
            h("td", { text: short }),
            h("td", { text: String(c["1"]) }),
            h("td", { text: String(c["2"]) }),
            h("td", { text: String(c["3"]) }),
            h("td", null, h("strong", { text: "Zone " + sit.zone })));
        });
        box.appendChild(h("div", { class: "card table-wrap" },
          h("table", { class: "table" },
            h("caption", { text: "Nombre de personnes par zone et zone de référence (à discuter)" }),
            h("thead", null, h("tr", null,
              h("th", { scope: "col", text: "N°" }),
              h("th", { scope: "col", text: "Situation" }),
              h("th", { scope: "col", text: "Zone 1" }),
              h("th", { scope: "col", text: "Zone 2" }),
              h("th", { scope: "col", text: "Zone 3" }),
              h("th", { scope: "col", text: "Référence" }))),
            h("tbody", null, rows))));
        box.appendChild(h("section", { class: "card", "aria-labelledby": "zone-final" },
          h("h2", { id: "zone-final", text: "La question qui fait apprendre" }),
          h("blockquote", { class: "quote quote-big", text: Z.questionFinale }),
          h("ul", null, Z.relances.map(function (r) { return h("li", { text: r }); })),
          h("p", { class: "muted", text: D.synthese.zonesRappel })));
        box.appendChild(h("div", { class: "actions" },
          h("button", { type: "button", class: "btn btn-secondary", onclick: function () { go(n - 1); } }, "Revenir à la dernière situation"),
          h("button", { type: "button", class: "btn btn-secondary", onclick: function () { go(0); } }, "Revenir à la première situation"),
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Remettre à zéro tous les comptages du jeu des zones ?", "Remettre à zéro").then(function (ok) {
                if (!ok) { return; }
                collectif.zones = {};
                saveCollectif();
                renderStage(true);
                toast("Les comptages ont été remis à zéro.");
              });
            }
          }, "Remettre les comptages à zéro")));
        return { el: box, focus: title };
      }

      function renderStage(moveFocus) {
        stage.textContent = "";
        var step = zoneIdx >= n ? bilanStep() : situationStep(zoneIdx);
        stage.appendChild(step.el);
        if (moveFocus && step.focus) { step.focus.focus(); }
      }

      renderStage(false);
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : aide
       ------------------------------------------------------------------ */
    function helpCard(id, title) {
      var card = h("section", { class: "card", "aria-labelledby": id }, h("h2", { id: id, text: title }));
      for (var i = 2; i < arguments.length; i++) { append(card, arguments[i]); }
      return card;
    }

    function viewHelp() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Aide pour l’animateur" }));

      wrap.appendChild(helpCard("aide-avant", "Avant la séance",
        h("ol", null,
          h("li", null, "Ouvrez le site depuis son adresse publique (GitHub Pages) : l’accueil affiche alors les liens corrects."),
          h("li", null, "Facultatif : saisissez les prénoms dans l’Administration (roue crantée en haut à gauche). Utile pour un seul trio."),
          h("li", null, "Projetez l’accueil pour faire scanner les QR codes, ou envoyez les adresses par e-mail."),
          h("li", null, "Plusieurs trios ? Tous utilisent les mêmes trois liens, chacun sur son propre appareil : A, B et C se répartissent à l’intérieur de chaque trio."),
          h("li", null, "Chacun garde le même appareil et le même lien pendant toute la séance : la progression est enregistrée sur l’appareil."))));

      var timeline = [
        ["Fil rouge", "3 min", "Console (page « Fil rouge »)"],
        ["Question provocatrice", "5 min", "Console (vote à main levée)"],
        ["Le piège", "4 min", "Console (réponse fragile / professionnelle)"],
        ["Trois manches", "33 min", "Appareils des participants (11 min chacune)"],
        ["Jeu des trois zones", "12 min", "Console (dix situations, positionnement physique)"],
        ["Synthèse et fiche de transfert", "3 min", "Appareils des participants"]
      ];
      wrap.appendChild(helpCard("aide-deroule", "Déroulé conseillé (60 minutes)",
        h("div", { class: "table-wrap" },
          h("table", { class: "table" },
            h("caption", { text: "Une séquence d’une heure" }),
            h("thead", null, h("tr", null,
              h("th", { scope: "col", text: "Moment" }),
              h("th", { scope: "col", text: "Durée" }),
              h("th", { scope: "col", text: "Où" }))),
            h("tbody", null, timeline.map(function (r) {
              return h("tr", null, h("th", { scope: "row", text: r[0] }), h("td", { text: r[1] }), h("td", { text: r[2] }));
            })))),
        h("p", { class: "muted", text: "Une manche : " + D.rythme.map(function (r) { return r.label.toLowerCase() + " " + r.minutes + " min"; }).join(", ") + "." }),
        h("p", { text: "Variante : placez « Le piège » après les manches si vous préférez que chacun s’y confronte avant d’en parler. Les durées des scènes se règlent dans data.js." })));

      wrap.appendChild(helpCard("aide-scenes", "Les deux scènes d’une manche",
        h("ul", null,
          h("li", { text: "Scène 1 : le manager rencontre la direction avant l’arbitrage et exerce son devoir d’alerte (contester)." }),
          h("li", { text: "Bascule : la direction annonce son arbitrage. Le manager doit changer de position (arbitrer)." }),
          h("li", { text: "Scène 2 : le manager retrouve son équipe et porte la décision (porter)." }),
          h("li", { text: "L’interlocuteur joue deux personnages : la direction, puis un membre de l’équipe. Ses deux fiches sont confidentielles et s’affichent au bon moment." }),
          h("li", { text: "La direction n’ajuste la décision que si l’alerte du manager l’a justifié : la qualité de l’alerte a donc un effet visible." })),
        rotationTable()));

      wrap.appendChild(helpCard("aide-obs", "Le rôle d’observateur",
        h("ul", null,
          h("li", { text: "Les 13 critères sont regroupés selon la grille : contester, arbitrer, porter. Touchez + à chaque fois que le comportement est observé, − pour corriger." }),
          h("li", { text: "La jauge se remplit au fil des observations (1 fois : observé, 2 fois ou plus : comportement renforcé)." }),
          h("li", { text: "Rien n’oblige à renseigner tous les critères : mieux vaut noter peu et juste." }),
          h("li", { text: "Les champs de texte servent au débriefing : phrase la plus professionnelle, phrase fragile, suggestion pour le rejeu." }))));

      wrap.appendChild(helpCard("aide-collectif", "Les moments collectifs",
        h("ul", null,
          h("li", { text: "Ils se pilotent depuis cet appareil, sur l’accueil (section « Animation collective »). Projetez la page." }),
          h("li", { text: "Question provocatrice : comptez les mains avec + et −. Les pistes de lecture et le principe sont masqués tant que vous ne les affichez pas." }),
          h("li", { text: "Jeu des trois zones : pour chaque situation, les participants se placent physiquement ; vous comptez les personnes par zone, puis affichez la zone de référence. Le bilan rassemble les comptages et la question finale." }),
          h("li", { text: "Les comptages restent sur cet appareil. Chaque page propose sa remise à zéro." }))));

      wrap.appendChild(helpCard("aide-depannage", "Dépannage",
        h("ul", null,
          h("li", null, h("strong", { text: "« Lien invalide » : " }), "le lien doit contenir ?p=A, ?p=B ou ?p=C. Renvoyez-le depuis l’accueil."),
          h("li", null, h("strong", { text: "Le QR code ouvre une page introuvable : " }), "vérifiez l’adresse du site dans l’Administration ; les liens doivent pointer vers le site publié."),
          h("li", null, h("strong", { text: "Un participant a perdu sa progression : " }), "elle est liée à l’appareil et au navigateur. Il peut reprendre à la bonne étape avec les boutons de navigation."),
          h("li", null, h("strong", { text: "La copie ne fonctionne pas : " }), "l’adresse est sélectionnée automatiquement, faites Ctrl+C (ou appui long sur smartphone)."),
          h("li", null, h("strong", { text: "Prénom modifié : " }), "le lien change. Renvoyez-le ou rescannez-le ; la progression enregistrée est conservée."))));

      wrap.appendChild(helpCard("aide-limites", "Confidentialité et limites",
        h("ul", null,
          h("li", { text: "Le cloisonnement des rôles est pédagogique, pas informatique : un site statique ne peut pas empêcher quelqu’un d’ouvrir le code source ou de modifier l’adresse." }),
          h("li", { text: "Aucune donnée n’est envoyée à un serveur applicatif. Les prénoms figurent dans l’adresse des liens, donc dans les journaux de l’hébergeur du site." }),
          h("li", { text: "Les scénarios sont fictifs. Dans la fiche de transfert, ne saisissez ni nom de personne ni information sensible." }),
          h("li", { text: "Porter une décision a une limite : une décision illégale ou mettant des personnes en danger relève d’un autre traitement. Cadrez ce point avec le groupe." }))));

      wrap.appendChild(h("details", { class: "card notes" },
        h("summary", { text: "Notes de l’animateur : décisions et marges de manœuvre des scénarios" }),
        h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Ne pas projeter : " }), "ces informations contiennent les consignes confidentielles de la direction."),
        h("ul", null, D.scenarios.map(function (sc, i) {
          return h("li", null,
            h("strong", { text: "Manche " + (i + 1) + " (" + sc.titre + ") : " }),
            sc.notesAnimateur.decision + " " + sc.notesAnimateur.marge);
        }))));

      wrap.appendChild(pageLinks("aide"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Routage par hash : #accueil (défaut), #admin, #aide, #fil, #vote, #piege, #zones
       ------------------------------------------------------------------ */
    var ROUTES = ["admin", "aide", "fil", "vote", "piege", "zones"];

    function currentRoute() {
      var hsh = window.location.hash.replace(/^#/, "");
      return ROUTES.indexOf(hsh) !== -1 ? hsh : "home";
    }

    var TITLES = {
      home: "Accès des participants", admin: "Administration", aide: "Aide",
      fil: "Fil rouge", vote: "Question provocatrice", piege: "Le piège", zones: "Jeu des trois zones"
    };

    function render(moveFocus) {
      var r = currentRoute();
      var view;
      if (r === "admin") { view = viewAdmin(); }
      else if (r === "aide") { view = viewHelp(); }
      else if (r === "fil") { view = viewFil(); }
      else if (r === "vote") { view = viewVote(); }
      else if (r === "piege") { view = viewPiege(); }
      else if (r === "zones") { view = viewZones(); }
      else { view = viewHome(); }
      root.textContent = "";
      root.appendChild(view);
      document.title = "Posture managériale - " + TITLES[r];
      if (gear) {
        if (r === "admin") { gear.setAttribute("aria-current", "page"); } else { gear.removeAttribute("aria-current"); }
      }
      if (moveFocus) {
        var title = root.querySelector("h1");
        if (title) { title.setAttribute("tabindex", "-1"); title.focus(); }
        try { window.scrollTo(0, 0); } catch (e) { /* sans importance */ }
      }
    }

    window.addEventListener("hashchange", function () { render(true); });
    render(false);
  }
})();
