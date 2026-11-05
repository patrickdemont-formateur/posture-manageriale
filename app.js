/* ==========================================================================
   app.js - Posture managériale
   JavaScript natif, aucune dépendance, aucune requête réseau.
   Les contenus sont dans data.js. Toute saisie est insérée via textContent
   ou value (jamais via innerHTML) : pas d'injection HTML possible.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.POSTURE_DATA;
  var root = document.getElementById("app");
  if (!root) { return; }
  if (!D) {
    root.textContent = "Erreur : le fichier data.js n’a pas pu être chargé.";
    return;
  }

  var TOTAL = D.scenarios.length;
  var PHASES = ["intro", "play1", "bascule", "play2", "debrief", "final"];

  /* ------------------------------------------------------------------
     Utilitaires DOM
     ------------------------------------------------------------------ */
  function append(parent, child) {
    if (child === null || child === undefined || child === false) { return; }
    if (Array.isArray(child)) {
      child.forEach(function (c) { append(parent, c); });
      return;
    }
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
  }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v === null || v === undefined) { return; }
        if (k === "class") { el.className = v; }
        else if (k === "text") { el.textContent = v; }
        else if (k === "value") { el.value = v; }
        else if (k === "checked") { el.checked = true; }
        else if (k.slice(0, 2) === "on" && typeof v === "function") { el.addEventListener(k.slice(2), v); }
        else if (v === true) { el.setAttribute(k, ""); }
        else { el.setAttribute(k, v); }
      });
    }
    kids.forEach(function (c) { append(el, c); });
    return el;
  }

  /* ------------------------------------------------------------------
     Retour utilisateur : toast (aria-live) et boîte de confirmation
     ------------------------------------------------------------------ */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  var toastDelay = null;

  function toast(message) {
    if (!toastEl) { return; }
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastDelay);
    toastEl.classList.remove("show");
    toastEl.textContent = "";
    toastDelay = window.setTimeout(function () {
      toastEl.textContent = message;
      toastEl.classList.add("show");
    }, 60);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 5000);
  }

  function confirmAction(message, okLabel) {
    return new Promise(function (resolve) {
      var dlg = document.getElementById("confirm-dialog");
      if (!dlg || typeof dlg.showModal !== "function") {
        resolve(window.confirm(message));
        return;
      }
      document.getElementById("confirm-message").textContent = message;
      document.getElementById("confirm-ok").textContent = okLabel || "Confirmer";
      var opener = document.activeElement;
      function onClose() {
        dlg.removeEventListener("close", onClose);
        resolve(dlg.returnValue === "ok");
        if (opener && typeof opener.focus === "function" && document.contains(opener)) {
          opener.focus();
        }
      }
      dlg.addEventListener("close", onClose);
      dlg.returnValue = "cancel";
      dlg.showModal();
    });
  }

  function copyText(text) {
    function legacy() {
      var ok = false;
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      try {
        ta.select();
        ta.setSelectionRange(0, text.length);
        ok = document.execCommand("copy");
      } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
    }
    return Promise.resolve(legacy());
  }

  /* ------------------------------------------------------------------
     Routage : sans paramètre p -> page d'accueil de l'animateur (admin.js)
               avec p valide   -> parcours du participant
               avec p invalide -> message d'erreur
     ------------------------------------------------------------------ */
  var NAME_MAX = 20;

  function cleanName(v) {
    return String(v === null || v === undefined ? "" : v)
      .replace(/[\u0000-\u001f\u007f~]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, NAME_MAX);
  }

  var params;
  try { params = new URLSearchParams(window.location.search); }
  catch (e) { params = { has: function () { return false; }, get: function () { return null; } }; }

  if (!params.has("p")) {
    if (window.LM_ADMIN && typeof window.LM_ADMIN.start === "function") {
      window.LM_ADMIN.start({
        D: D, root: root, h: h, append: append, toast: toast,
        confirmAction: confirmAction, copyText: copyText,
        cleanName: cleanName, NAME_MAX: NAME_MAX
      });
    } else {
      root.textContent = "Erreur : le fichier admin.js n’a pas pu être chargé.";
    }
    return;
  }

  /* ------------------------------------------------------------------
     Participant (paramètre ?p=A|B|C)
     ------------------------------------------------------------------ */
  var P = (params.get("p") || "").trim().toUpperCase();
  if (D.participants.indexOf(P) === -1) { P = null; }

  /* Prénoms facultatifs transmis par le lien : ?n=Prénom A~Prénom B~Prénom C */
  var NAMES = { A: "", B: "", C: "" };
  (function () {
    var parts = (params.get("n") || "").split("~");
    D.participants.forEach(function (q, i) { NAMES[q] = cleanName(parts[i] || ""); });
  })();

  function who(q) { return NAMES[q] ? NAMES[q] : "participant " + q; }

  var badge = document.getElementById("participant-badge");

  if (!P) {
    document.title = "Lien invalide - Posture managériale";
    root.textContent = "";
    root.appendChild(h("div", { class: "view" },
      h("h1", { text: "Lien personnel absent ou invalide" }),
      h("div", { class: "card" },
        h("p", { text: "Cette application s’utilise avec le lien personnel communiqué par l’animateur." }),
        h("p", { text: "Demandez-lui de vous renvoyer votre lien, puis ouvrez-le depuis cet appareil." }),
        h("p", { class: "muted small", text: "Pour l’animateur : l’adresse doit se terminer par ?p=A, ?p=B ou ?p=C (voir le README)." })
      )
    ));
    return;
  }

  if (badge) {
    badge.textContent = NAMES[P] ? NAMES[P] + " (participant " + P + ")" : "Participant " + P;
    badge.hidden = false;
  }

  /* ------------------------------------------------------------------
     Persistance locale (localStorage) - une clé par participant
     ------------------------------------------------------------------ */
  var KEY = "posture-manageriale-v1:" + P;

  var storageOk = (function () {
    try {
      var k = "__posture_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function defaultState() {
    return { round: 1, phase: "intro", obs: {}, fiche: {} };
  }

  function isPlainObject(o) {
    return o !== null && typeof o === "object" && !Array.isArray(o);
  }

  function loadState() {
    var s = defaultState();
    if (!storageOk) { return s; }
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) { return s; }
      var o = JSON.parse(raw);
      if (isPlainObject(o)) {
        var r = parseInt(o.round, 10);
        if (r >= 1 && r <= TOTAL) { s.round = r; }
        if (PHASES.indexOf(o.phase) !== -1) { s.phase = o.phase; }
        if (isPlainObject(o.obs)) { s.obs = o.obs; }
        if (isPlainObject(o.fiche)) { s.fiche = o.fiche; }
      }
    } catch (e) { /* données illisibles : on repart de zéro */ }
    if (s.phase === "final") { s.round = TOTAL; }
    return s;
  }

  var state = loadState();

  function save() {
    if (!storageOk) { return; }
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; }
  }

  function roleFor(round) {
    return D.rotation[round][P];
  }

  /* ------------------------------------------------------------------
     Observations (rôle observateur)
     ------------------------------------------------------------------ */
  var GAUGE_MAX = (D.grille && D.grille.max) || 5;

  function getObs(round) {
    var k = String(round);
    if (!isPlainObject(state.obs[k])) { state.obs[k] = {}; }
    var o = state.obs[k];
    if (!isPlainObject(o.grid)) { o.grid = {}; }
    /* Ne garde que des compteurs valides (les anciens formats sont ignorés) */
    Object.keys(o.grid).forEach(function (key) {
      var v = o.grid[key];
      if (typeof v !== "number" || v % 1 !== 0 || v < 1 || v > GAUGE_MAX) { delete o.grid[key]; }
    });
    D.champsObservateur.forEach(function (c) {
      if (typeof o[c.id] !== "string") { o[c.id] = ""; }
    });
    return o;
  }

  /* ------------------------------------------------------------------
     Chronomètre (basé sur l'horloge : pas de dérive)
     ------------------------------------------------------------------ */
  var T = { remaining: D.dureeSimulation, running: false, endTs: 0, id: null, warned: false };

  function stopTimer() {
    if (T.id) { window.clearInterval(T.id); T.id = null; }
    T.running = false;
    T.remaining = D.dureeSimulation;
    T.warned = false;
  }

  function fmt(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  function renderTimer() {
    var card = h("section", { class: "card timer-card", "aria-labelledby": "timer-title" });
    var flag = h("p", { class: "timer-flag", hidden: true });
    var display = h("p", { class: "timer-display", role: "timer", "aria-live": "off", "aria-atomic": "true" });
    var status = h("p", { class: "timer-status", role: "status", "aria-live": "polite", "aria-atomic": "true" });
    var bStart = h("button", { type: "button", class: "btn btn-primary" }, "Démarrer");
    var bPause = h("button", { type: "button", class: "btn btn-secondary" }, "Pause");
    var bReset = h("button", { type: "button", class: "btn btn-secondary" }, "Réinitialiser");

    function setStatus(msg, alertLevel) {
      status.textContent = msg;
      status.classList.toggle("is-alert", !!alertLevel);
    }

    function update() {
      var warn = T.remaining > 0 && T.remaining <= D.alerteSecondes;
      var ended = T.remaining === 0;
      display.textContent = fmt(T.remaining);
      card.classList.toggle("is-warning", warn);
      card.classList.toggle("is-ended", ended);
      flag.hidden = !(warn || ended);
      flag.textContent = ended ? "Temps écoulé" : "Dernière minute";
      bStart.disabled = T.running || ended;
      bPause.disabled = !T.running;
      bStart.textContent = (T.remaining < D.dureeSimulation && T.remaining > 0) ? "Reprendre" : "Démarrer";
    }

    function remainingNow() {
      return Math.max(0, Math.ceil((T.endTs - Date.now()) / 1000));
    }

    function tick() {
      T.remaining = remainingNow();
      if (T.remaining === 0) {
        window.clearInterval(T.id);
        T.id = null;
        T.running = false;
        setStatus("Temps écoulé. Concluez l’entretien.", true);
      } else if (T.remaining <= D.alerteSecondes && !T.warned) {
        T.warned = true;
        setStatus("Attention : il reste moins d’une minute.", true);
      }
      update();
    }

    bStart.addEventListener("click", function () {
      if (T.running || T.remaining === 0) { return; }
      var fresh = T.remaining === D.dureeSimulation;
      T.endTs = Date.now() + T.remaining * 1000;
      T.running = true;
      T.id = window.setInterval(tick, 250);
      setStatus(fresh ? "Chronomètre démarré." : "Chronomètre repris.", false);
      update();
    });

    bPause.addEventListener("click", function () {
      if (!T.running) { return; }
      T.remaining = remainingNow();
      window.clearInterval(T.id);
      T.id = null;
      T.running = false;
      setStatus("Chronomètre en pause.", false);
      update();
    });

    bReset.addEventListener("click", function () {
      if (T.id) { window.clearInterval(T.id); T.id = null; }
      T.running = false;
      T.remaining = D.dureeSimulation;
      T.warned = false;
      setStatus("Chronomètre réinitialisé.", false);
      update();
    });

    card.appendChild(h("h2", { id: "timer-title", text: "Chronomètre (facultatif)" }));
    card.appendChild(h("p", { class: "muted", text: "Simulation : " + Math.round(D.dureeSimulation / 60) + " minutes. Le chronomètre ne démarre jamais automatiquement et reste local à cet appareil." }));
    card.appendChild(flag);
    card.appendChild(display);
    card.appendChild(status);
    card.appendChild(h("div", { class: "actions" }, bStart, bPause, bReset));
    update();
    return card;
  }

  /* ------------------------------------------------------------------
     Blocs de contenu des scénarios
     ------------------------------------------------------------------ */
  function renderBlocks(blocks) {
    var frag = document.createDocumentFragment();
    blocks.forEach(function (b) {
      if (b.t === "p") { frag.appendChild(h("p", { text: b.text })); }
      else if (b.t === "h3") { frag.appendChild(h("h3", { text: b.text })); }
      else if (b.t === "ul") {
        frag.appendChild(h("ul", null, b.items.map(function (i) { return h("li", { text: i }); })));
      }
      else if (b.t === "quote") { frag.appendChild(h("blockquote", { class: "quote", text: b.text })); }
      else if (b.t === "alert") {
        frag.appendChild(h("p", { class: "callout callout-warn" },
          h("strong", { text: "Point de vigilance : " }), b.text));
      }
      else if (b.t === "desc") {
        frag.appendChild(h("div", { class: "desc-box" },
          h("p", { class: "desc-title", text: "Repères pour formuler votre message (D-E-S-C)" }),
          h("ul", { class: "desc-list" }, D.desc.map(function (d) {
            return h("li", null, h("strong", { class: "desc-letter", text: d.lettre }), " " + d.phrase);
          }))));
      }
    });
    return frag;
  }

  /* ------------------------------------------------------------------
     Composants communs
     ------------------------------------------------------------------ */
  function stepper() {
    var ol = h("ol", { class: "steps", "aria-label": "Progression des trois manches" });
    for (var i = 1; i <= TOTAL; i++) {
      var done = i < state.round || state.phase === "final";
      var current = !done && i === state.round && state.phase !== "intro";
      var label = done ? "terminée" : (current ? "en cours" : "à venir");
      var cls = "steps-item" + (done ? " is-done" : "") + (current ? " is-current" : "");
      ol.appendChild(h("li", { class: cls, "aria-current": current ? "step" : false },
        h("span", { class: "steps-n", text: "Manche " + i }),
        h("span", { class: "steps-state", text: label })));
    }
    return ol;
  }

  function roleCard(role, scene) {
    var r = D.roles[role];
    var name = r.label + (scene && r.labelScene ? " : " + r.labelScene[scene] : "");
    var desc = scene && r.descScene ? r.descScene[scene] : r.desc;
    return h("div", { class: "role-card role-" + role },
      h("p", { class: "role-label", text: "Votre rôle" }),
      h("p", { class: "role-name", text: name }),
      h("p", { class: "role-desc", text: desc }));
  }

  function roleLong(role) { return D.roles[role].long || D.roles[role].label; }

  function rhythmText() {
    var parts = D.rythme.map(function (r) { return r.label.toLowerCase() + " (" + r.minutes + " min)"; });
    var total = D.rythme.reduce(function (a, r) { return a + r.minutes; }, 0);
    return "Une manche dure environ " + total + " minutes : " + parts.join(", ") + ".";
  }

  function storageWarning() {
    if (storageOk) { return null; }
    return h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }),
      "le stockage local est indisponible sur ce navigateur (navigation privée ?). Votre progression ne sera pas conservée si vous actualisez la page.");
  }

  function rolesList(round) {
    var items = ["manager", "interlocuteur", "observateur"].map(function (role) {
      var q = D.participants.filter(function (x) { return D.rotation[round][x] === role; })[0];
      return h("li", null,
        h("strong", { text: roleLong(role) + " : " }),
        who(q) + (q === P ? " (vous)" : ""));
    });
    return h("ul", { class: "roles-list", "aria-label": "Répartition des rôles dans cette manche" }, items);
  }

  function goBack() {
    if (state.phase === "play1") {
      if (state.round === 1) { state.phase = "intro"; }
      else { state.round -= 1; state.phase = "debrief"; }
    } else if (state.phase === "bascule") {
      state.phase = "play1";
    } else if (state.phase === "play2") {
      state.phase = "bascule";
    } else if (state.phase === "debrief") {
      state.phase = "play2";
    } else if (state.phase === "final") {
      state.round = TOTAL;
      state.phase = "debrief";
    }
    save();
    render(true);
  }

  function backLabel() {
    if (state.phase === "play1") {
      return state.round === 1 ? "Revenir à l’accueil" : "Revenir au débriefing de la manche " + (state.round - 1);
    }
    if (state.phase === "bascule") { return "Revenir à la scène 1"; }
    if (state.phase === "play2") { return "Revenir à l’arbitrage"; }
    if (state.phase === "debrief") { return "Revenir à la scène 2"; }
    return "Revenir au débriefing de la manche " + TOTAL;
  }

  function backButton() {
    return h("button", { type: "button", class: "btn btn-secondary", onclick: goBack }, backLabel());
  }

  /* ------------------------------------------------------------------
     Grille d'observation (observateur uniquement) : tuiles + / -
     ------------------------------------------------------------------ */
  function renderGrid(round) {
    var G = D.grille;
    var o = getObs(round);
    var total = G.groupes.reduce(function (a, g) { return a + g.criteres.length; }, 0);
    var section = h("section", { class: "card", "aria-labelledby": "grid-title" });
    var count = h("p", { class: "grid-count", role: "status", "aria-live": "polite" });

    function updateCount() {
      var n = Object.keys(o.grid).length;
      count.textContent = n === 0
        ? "Aucun critère noté pour l’instant : c’est normal, rien n’est obligatoire."
        : n + " critère" + (n > 1 ? "s" : "") + " noté" + (n > 1 ? "s" : "") + " sur " + total + ".";
    }

    function buildTile(c) {
      var el = h("div", { class: "tile" });
      var segs = [];
      var gauge = h("div", { class: "gauge", "aria-hidden": "true" });
      for (var i = 0; i < GAUGE_MAX; i++) {
        var seg = h("i");
        segs.push(seg);
        gauge.appendChild(seg);
      }
      var cnt = h("span", { class: "tile-count", "aria-live": "polite", "aria-atomic": "true" });
      var minus = h("button", { type: "button", class: "tile-btn tile-minus", "aria-label": "Retirer une observation : " + c.texte }, "\u2212");
      var plus = h("button", { type: "button", class: "tile-btn tile-plus", "aria-label": "Ajouter une observation : " + c.texte }, "+");

      function paint() {
        var v = o.grid[c.id] || 0;
        el.setAttribute("data-level", String(v));
        cnt.textContent = "";
        cnt.appendChild(h("span", { "aria-hidden": "true", text: v ? "\u00d7" + v : "0" }));
        cnt.appendChild(h("span", { class: "sr-only", text: v === 0 ? "non noté" : "observé " + v + " fois" }));
        segs.forEach(function (sg, idx) { sg.className = idx < v ? "on" : ""; });
        minus.setAttribute("aria-disabled", v === 0 ? "true" : "false");
        plus.setAttribute("aria-disabled", v >= GAUGE_MAX ? "true" : "false");
      }

      plus.addEventListener("click", function () {
        var v = o.grid[c.id] || 0;
        if (v >= GAUGE_MAX) { return; }
        o.grid[c.id] = v + 1;
        save(); paint(); updateCount();
      });
      minus.addEventListener("click", function () {
        var v = o.grid[c.id] || 0;
        if (v <= 0) { return; }
        if (v === 1) { delete o.grid[c.id]; } else { o.grid[c.id] = v - 1; }
        save(); paint(); updateCount();
      });

      el.appendChild(h("p", { class: "tile-label", text: c.texte }));
      el.appendChild(h("div", { class: "tile-ctl" }, minus, cnt, plus));
      el.appendChild(gauge);
      paint();
      return el;
    }

    section.appendChild(h("h2", { id: "grid-title", text: "Grille d’observation" }));
    section.appendChild(h("p", { class: "callout" },
      h("strong", { text: "Rien n’oblige à tout renseigner. " }),
      "Notez uniquement ce que vous avez réellement observé : un critère laissé à 0 signifie simplement « pas noté »."));
    section.appendChild(h("p", { class: "muted", text: "Touchez + à chaque fois que vous observez le comportement (1 fois : observé, 2 fois ou plus : comportement renforcé). Touchez − pour corriger. Vos notes restent uniquement sur cet appareil." }));
    section.appendChild(count);
    section.appendChild(h("p", { class: "stem", text: G.amorce }));

    G.groupes.forEach(function (g) {
      var gid = "grp-" + round + "-" + g.id;
      section.appendChild(h("div", { class: "tile-group", role: "group", "aria-labelledby": gid },
        h("h3", { id: gid, text: g.titre }),
        h("div", { class: "tiles" }, g.criteres.map(buildTile))));
    });

    D.champsObservateur.forEach(function (c) {
      var id = "obs-" + round + "-" + c.id;
      section.appendChild(h("div", { class: "field" },
        h("label", { for: id, text: c.label }),
        h("textarea", {
          id: id, rows: 3, maxlength: 1000, value: o[c.id],
          oninput: function (ev) { o[c.id] = ev.target.value; save(); }
        })));
    });

    section.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-warn",
        onclick: function () {
          confirmAction("Effacer toutes vos observations enregistrées sur cet appareil ?", "Effacer").then(function (ok) {
            if (!ok) { return; }
            state.obs[String(round)] = {};
            save();
            var fresh = renderGrid(round);
            section.replaceWith(fresh);
            var t = fresh.querySelector("h2");
            if (t) { t.setAttribute("tabindex", "-1"); t.focus(); }
            toast("Vos observations ont été effacées.");
          });
        }
      }, "Effacer mes observations")));

    updateCount();
    return section;
  }

  /* ------------------------------------------------------------------
     Fiche de transfert (synthèse individuelle)
     ------------------------------------------------------------------ */
  function ficheValue(id) {
    var v = state.fiche[id];
    return typeof v === "string" ? v : "";
  }

  function formatDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? m[3] + "/" + m[2] + "/" + m[1] : v;
  }

  function optionLabel(list, value) {
    var f = list.filter(function (o) { return o.value === value; })[0];
    return f ? f.label : "-";
  }

  function ficheText() {
    function v(id) { var x = ficheValue(id).trim(); return x ? x : "-"; }
    var date = ficheValue("date").trim();
    return [
      "FICHE DE PRÉPARATION - Posture managériale",
      "",
      "Décision concernée (en quelques mots) : " + v("decision"),
      "Où en est la décision : " + optionLabel(D.ficheMoments, ficheValue("moment")),
      "Ma zone : " + optionLabel(D.ficheZones, ficheValue("zone")),
      "",
      "Les raisons de la décision, telles que je les comprends :",
      v("raisons"),
      "",
      "Ce que je constate sur le terrain (faits) :",
      v("faits"),
      "",
      "Mon message d’alerte (D-E-S-C) :",
      "- Je constate que… " + v("d"),
      "- Mon point d’alerte concerne… " + v("e"),
      "- Je propose que… " + v("s"),
      "- L’intérêt serait de… " + v("c"),
      "",
      "Ce que l’équipe attend de moi :",
      v("attentes"),
      "",
      "Ma phrase pour l’équipe (honnête et solidaire) :",
      v("phrase"),
      "",
      "Les difficultés à anticiper avec l’équipe :",
      v("difficultes"),
      "",
      "Date prévue de l’échange : " + (date ? formatDate(date) : "-")
    ].join("\n");
  }

  function renderFiche() {
    var section = h("section", { class: "card", "aria-labelledby": "fiche-title" });

    function field(id, label, kind, options) {
      var fid = "fiche-" + id;
      var control;
      function onInput(ev) { state.fiche[id] = ev.target.value; save(); }
      if (kind === "textarea") {
        control = h("textarea", { id: fid, rows: 3, maxlength: 1000, value: ficheValue(id), oninput: onInput });
      } else if (kind === "select") {
        control = h("select", { id: fid, onchange: onInput },
          h("option", { value: "" }, "Choisir…"),
          options.map(function (o) { return h("option", { value: o.value, selected: ficheValue(id) === o.value }, o.label); }));
      } else {
        var attrs = { type: kind === "date" ? "date" : "text", id: fid };
        if (kind !== "date") { attrs.maxlength = 300; attrs.autocomplete = "off"; }
        attrs.value = ficheValue(id);
        attrs.oninput = onInput;
        control = h("input", attrs);
      }
      return h("div", { class: "field" }, h("label", { for: fid, text: label }), control);
    }

    section.appendChild(h("h2", { id: "fiche-title", text: "Ma situation réelle : fiche de préparation" }));
    section.appendChild(h("p", { text: "Choisissez une décision de votre direction que vous n’approuvez pas (ou que vous devez porter) et préparez votre prochain échange avec la démarche de l’exercice." }));
    section.appendChild(h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }),
      "décrivez la décision en quelques mots, sans nom de personne ni information sensible. Rien n’est envoyé vers un serveur."));

    var form = h("form", { novalidate: true, onsubmit: function (ev) { ev.preventDefault(); } });
    form.appendChild(field("decision", "Décision concernée (en quelques mots)", "text"));
    form.appendChild(field("moment", "Où en est la décision ?", "select", D.ficheMoments));
    form.appendChild(field("zone", "Ma zone sur cette décision", "select", D.ficheZones));
    form.appendChild(field("raisons", "Les raisons de la décision, telles que je les comprends", "textarea"));
    form.appendChild(field("faits", "Ce que je constate sur le terrain (des faits)", "textarea"));
    form.appendChild(h("fieldset", { class: "fieldset" },
      h("legend", { text: "Mon message d’alerte (D-E-S-C)" }),
      field("d", D.desc[0].phrase, "text"),
      field("e", D.desc[1].phrase, "text"),
      field("s", D.desc[2].phrase, "text"),
      field("c", D.desc[3].phrase, "text")));
    form.appendChild(field("attentes", "Ce que mon équipe attend de moi", "textarea"));
    form.appendChild(field("phrase", "Ma phrase pour l’équipe (honnête et solidaire)", "textarea"));
    form.appendChild(field("difficultes", "Les difficultés à anticiper avec l’équipe", "textarea"));
    form.appendChild(field("date", "Date prévue de l’échange", "date"));
    section.appendChild(form);

    var copyBtn = h("button", { type: "button", class: "btn btn-teal" }, "Copier ma synthèse");
    var copyTimer = null;
    var fallback = null;

    copyBtn.addEventListener("click", function () {
      var text = ficheText();
      copyText(text).then(function (ok) {
        if (ok) {
          toast("Synthèse copiée dans le presse-papiers.");
          copyBtn.textContent = "Synthèse copiée";
          window.clearTimeout(copyTimer);
          copyTimer = window.setTimeout(function () { copyBtn.textContent = "Copier ma synthèse"; }, 3000);
        } else {
          toast("La copie automatique a échoué : copiez le texte affiché sous les boutons.");
          if (!fallback) {
            fallback = h("textarea", { class: "copy-fallback", readonly: true, rows: 10, "aria-label": "Texte de ma synthèse à copier manuellement" });
            actions.insertAdjacentElement("afterend", fallback);
          }
          fallback.value = text;
          fallback.focus();
          fallback.select();
        }
      });
    });

    var clearBtn = h("button", {
      type: "button", class: "btn btn-warn",
      onclick: function () {
        confirmAction("Effacer toute votre synthèse enregistrée sur cet appareil ?", "Effacer").then(function (ok) {
          if (!ok) { return; }
          state.fiche = {};
          save();
          var fresh = renderFiche();
          section.replaceWith(fresh);
          var t = fresh.querySelector("h2");
          if (t) { t.setAttribute("tabindex", "-1"); t.focus(); }
          toast("Votre synthèse a été effacée.");
        });
      }
    }, "Effacer ma synthèse");

    var actions = h("div", { class: "actions" }, copyBtn, clearBtn);
    section.appendChild(actions);
    return section;
  }

  /* ------------------------------------------------------------------
     Vues
     ------------------------------------------------------------------ */
  function viewIntro() {
    var wrap = h("div", { class: "view" });
    wrap.appendChild(h("div", null,
      h("h1", { text: D.titre }),
      h("p", { class: "muted", text: D.sousTitre })));
    append(wrap, storageWarning());
    wrap.appendChild(h("p", { class: "muted", text: (NAMES[P] ? "Bonjour " + NAMES[P] + ", vous" : "Vous") + " êtes le participant " + P + "." }));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "intro-obj" },
      h("h2", { id: "intro-obj", text: "Ce que vous allez pratiquer" }),
      h("p", { text: "À trois, vous vous entraînez à tenir une posture managériale quand la direction prend une décision avec laquelle vous n’êtes pas d’accord : exercer votre devoir d’alerte avant l’arbitrage, puis porter la décision devant votre équipe." }),
      h("p", { text: "Chaque manche comporte deux scènes : un entretien avec la direction, puis un échange avec l’équipe. Chacun lit uniquement sa propre fiche, sur son propre appareil." })));

    var rows = D.scenarios.map(function (sc, i) {
      return h("tr", null,
        h("th", { scope: "row", text: "Manche " + (i + 1) }),
        h("td", { text: sc.titre }),
        h("td", null, h("strong", { text: roleLong(roleFor(i + 1)) })));
    });
    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "intro-rot" },
      h("h2", { id: "intro-rot", text: "Votre rotation" }),
      h("p", { text: "Vous jouez chaque rôle une fois. La manche active détermine automatiquement votre rôle." }),
      h("div", { class: "table-wrap" },
        h("table", { class: "table" },
          h("thead", null, h("tr", null,
            h("th", { scope: "col", text: "Manche" }),
            h("th", { scope: "col", text: "Situation" }),
            h("th", { scope: "col", text: "Votre rôle" }))),
          h("tbody", null, rows))),
      h("p", { class: "muted small", text: rhythmText() })));

    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () { state.phase = "play1"; state.round = 1; save(); render(true); }
      }, "Commencer")));
    return wrap;
  }

  function viewPlay(scene) {
    var round = state.round;
    var role = roleFor(round);
    var sc = D.scenarios[round - 1];
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("div", null,
      h("p", { class: "eyebrow", text: "Manche " + round + " sur " + TOTAL + ", scène " + scene + " sur 2" }),
      h("h1", { text: sc.titre + " : " + D.scenes[scene].court })));
    wrap.appendChild(roleCard(role, scene));
    wrap.appendChild(rolesList(round));
    wrap.appendChild(h("p", { class: "muted small", text: rhythmText() }));
    wrap.appendChild(renderTimer());

    var r = D.roles[role];
    var card = h("section", {
      class: "card" + (role === "interlocuteur" ? " card-confidential" : ""),
      "aria-labelledby": "content-title"
    });
    if (role === "interlocuteur") {
      card.appendChild(h("p", { class: "confidential", text: "Informations confidentielles : ne pas montrer aux autres participants" }));
    }
    card.appendChild(h("h2", { id: "content-title", text: r.titreContenu + (role === "interlocuteur" ? " : " + r.labelScene[scene] : "") }));
    card.appendChild(renderBlocks(sc["scene" + scene][role]));
    wrap.appendChild(card);

    if (role === "observateur") { wrap.appendChild(renderGrid(round)); }

    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () { state.phase = scene === 1 ? "bascule" : "debrief"; save(); render(true); }
      }, scene === 1 ? "Passer à l’arbitrage" : "Passer au débriefing"),
      backButton()));
    return wrap;
  }

  function flowLine() {
    var steps = [
      { nom: "Contester", etat: "terminé" },
      { nom: "Arbitrer", etat: "vous êtes ici" },
      { nom: "Porter", etat: "à venir" }
    ];
    return h("ol", { class: "flow", "aria-label": "Étapes de la séquence" }, steps.map(function (st, i) {
      return h("li", { class: "flow-item" + (i === 0 ? " is-done" : (i === 1 ? " is-current" : "")), "aria-current": i === 1 ? "step" : false },
        h("span", { class: "flow-name", text: st.nom }),
        h("span", { class: "flow-state", text: st.etat }));
    }));
  }

  function viewBascule() {
    var round = state.round;
    var role = roleFor(round);
    var sc = D.scenarios[round - 1];
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("div", null,
      h("p", { class: "eyebrow", text: "Manche " + round + " sur " + TOTAL + ", entre les deux scènes" }),
      h("h1", { text: "L’arbitrage est rendu" })));
    wrap.appendChild(flowLine());
    wrap.appendChild(roleCard(role, null));
    wrap.appendChild(rolesList(round));
    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "bascule-title" },
      h("h2", { id: "bascule-title", text: "Ce qui vient de se passer" }),
      h("p", { text: sc.bascule.texte }),
      h("p", { class: "callout", text: sc.bascule[role] })));
    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () { state.phase = "play2"; save(); render(true); }
      }, "Commencer la scène 2"),
      backButton()));
    return wrap;
  }

  function viewDebrief() {
    var round = state.round;
    var role = roleFor(round);
    var sc = D.scenarios[round - 1];
    var last = round === TOTAL;
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("div", null,
      h("p", { class: "eyebrow", text: "Manche " + round + " sur " + TOTAL }),
      h("h1", { text: "Débriefing : " + sc.titre })));
    wrap.appendChild(roleCard(role, null));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "debrief-title" },
      h("h2", { id: "debrief-title", text: "Questions pour le rôle : " + D.roles[role].label.toLowerCase() }),
      h("p", { class: "muted", text: "Échangez à l’oral, environ 3 minutes. Chacun peut répondre à partir de son propre rôle." }),
      h("ol", null, D.debrief[role].map(function (q) { return h("li", { text: q }); }))));

    if (role === "observateur") { wrap.appendChild(renderGrid(round)); }

    wrap.appendChild(h("p", { class: "muted small", text: last
      ? "Prenez environ une minute avant la synthèse finale."
      : "Prenez environ une minute avant la manche suivante : les rôles changent." }));

    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () {
          if (last) { state.phase = "final"; }
          else { state.round = round + 1; state.phase = "play1"; }
          save(); render(true);
        }
      }, last ? "Voir la synthèse finale" : "Passer à la manche suivante"),
      backButton()));
    return wrap;
  }

  function viewFinal() {
    var S = D.synthese;
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("h1", { text: "Synthèse : Contester → Arbitrer → Porter" }));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-princ" },
      h("h2", { id: "syn-princ", text: "Le fil de la posture" }),
      h("blockquote", { class: "quote", text: S.principe }),
      h("p", { class: "chain", text: S.demarche }),
      h("div", { class: "oiia oiia-3" }, D.fil.etapes.map(function (e) {
        return h("div", { class: "oiia-item" },
          h("h3", { text: e.nom }),
          h("p", { text: e.quand }),
          h("ul", null, e.points.map(function (p) { return h("li", { text: p }); })));
      }))));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-retenir" },
      h("h2", { id: "syn-retenir", text: "Ce qu’il faut retenir" }),
      h("ul", null, D.vote.principes.map(function (p) { return h("li", { text: p }); })),
      h("blockquote", { class: "quote", text: D.piege.conclusion })));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-piege" },
      h("h2", { id: "syn-piege", text: "Le piège : « Vous êtes d’accord avec ça, vous ? »" }),
      h("p", { class: "muted", text: "Exemple : « " + D.piege.phrase + " »" }),
      h("div", { class: "compare" },
        h("div", { class: "compare-item compare-fragile" },
          h("h3", { text: "Réponse fragile" }),
          h("p", { text: "« " + D.piege.fragile.reponse + " »" }),
          h("ul", null, D.piege.fragile.consequences.map(function (c) { return h("li", { text: c }); }))),
        h("div", { class: "compare-item compare-pro" },
          h("h3", { text: "Réponse professionnelle" }),
          h("p", { text: "« " + D.piege.pro.reponse + " »" })))));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-zones" },
      h("h2", { id: "syn-zones", text: "Les trois zones" }),
      h("ul", { class: "familles" }, D.zones.liste.map(function (z) {
        return h("li", null, h("strong", { text: "Zone " + z.id + " : " + z.nom }), " : " + z.def);
      })),
      h("p", { class: "muted", text: S.zonesRappel })));

    wrap.appendChild(h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }), S.vigilance));

    wrap.appendChild(renderFiche());
    wrap.appendChild(h("div", { class: "actions" }, backButton()));
    return wrap;
  }

  /* ------------------------------------------------------------------
     Rendu principal
     ------------------------------------------------------------------ */
  function render(moveFocus) {
    stopTimer();
    var view;
    if (state.phase === "play1") { view = viewPlay(1); }
    else if (state.phase === "bascule") { view = viewBascule(); }
    else if (state.phase === "play2") { view = viewPlay(2); }
    else if (state.phase === "debrief") { view = viewDebrief(); }
    else if (state.phase === "final") { view = viewFinal(); }
    else { view = viewIntro(); }

    root.textContent = "";
    root.appendChild(view);
    document.title = "Posture managériale - Participant " + P;

    if (moveFocus) {
      var title = root.querySelector("h1");
      if (title) {
        title.setAttribute("tabindex", "-1");
        title.focus();
      }
      try { window.scrollTo(0, 0); } catch (e) { /* sans importance */ }
    }
  }

  /* ------------------------------------------------------------------
     Pied de page : recommencer l'exercice
     ------------------------------------------------------------------ */
  var footer = document.getElementById("footer-actions");
  if (footer) {
    footer.appendChild(h("button", {
      type: "button", class: "btn btn-warn",
      onclick: function () {
        confirmAction("Recommencer l’exercice ? Votre progression, vos observations et votre synthèse enregistrées sur cet appareil seront effacées.", "Recommencer").then(function (ok) {
          if (!ok) { return; }
          try { window.localStorage.removeItem(KEY); } catch (e) { /* ignoré */ }
          state = defaultState();
          render(true);
          toast("L’exercice a été remis à zéro.");
        });
      }
    }, "Recommencer l’exercice"));
  }

  render(false);
})();
