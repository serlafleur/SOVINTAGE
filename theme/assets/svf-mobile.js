/* SOVINTAGEFRIP — comportements mobiles des sections svf-* (≤ 860 px), chargé après svf.js.
   Ne modifie pas svf.js : sur mobile, ce script reprend la main sur les gestes (défilement natif, scroll-snap)
   et rend la main à svf.js dès que l'écran repasse au-dessus de 860 px.
   - En-tête : panier en icône avec nom accessible, menu en vraie fenêtre modale (focus piégé, fond inerte, défilement bloqué).
   - Bannière : lookbook à faire glisser, légende synchronisée, défilement automatique coupé (WCAG 2.2.2).
   - Drop : bouton « 360° » qui ouvre la scène sur la bonne Signature.
   - Signature 360° : indication « glissez pour tourner ».
   - Silhouettes : bande à faire glisser, synchronisée avec la fiche du look. */
(function () {
  "use strict";
  if (window.SVFM) return;
  window.SVFM = true;

  var mq = window.matchMedia("(max-width: 860px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isM = function () { return mq.matches; };
  var behavior = function () { return reduce ? "auto" : "smooth"; };
  var pad = function (v) { return String(v).padStart(2, "0"); };
  function onSettle(el, fn) {
    var t = 0;
    if ("onscrollend" in window) el.addEventListener("scrollend", fn);
    el.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(fn, 140); }, { passive: true });
  }
  function nearestIndex(track, items) {
    var c = track.scrollLeft + track.clientWidth / 2, best = 0, d = Infinity;
    items.forEach(function (el, i) { var m = el.offsetLeft + el.offsetWidth / 2, x = Math.abs(m - c); if (x < d) { d = x; best = i; } });
    return best;
  }
  function startIndex(track, items) {
    var pl = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0, best = 0, d = Infinity;
    items.forEach(function (el, i) { var x = Math.abs(el.offsetLeft - pl - track.scrollLeft); if (x < d) { d = x; best = i; } });
    return best;
  }
  var mods = []; // { root, on(), off() }
  function apply() { mods.forEach(function (m) { if (isM()) m.on(); else m.off(); }); }

  /* ---------- En-tête ---------- */
  function header(root) {
    var hd = $("[data-hd]", root), btn = $("[data-hd-btn]", root), menu = $("[data-hd-menu]", root), cart = $("[data-hd-cart]", root);
    if (!hd || !btn || !menu) return null;

    /* Panier : « Panier (0) » devient une icône + compteur ; le nom accessible reste complet */
    var count = cart && $("[data-hd-count]", cart);
    if (cart && count && !cart.dataset.svfm) {
      cart.dataset.svfm = "1";
      cart.innerHTML = '<span class="svfm-cart-txt">Panier (</span><svg class="svfm-bag" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.5 6.5h11l-.9 10.5H5.4L4.5 6.5Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7.5 8V5.5a2.5 2.5 0 0 1 5 0V8" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>' +
        '<span class="svf-hd-count" data-hd-count>' + count.textContent + '</span><span class="svfm-cart-txt">)</span>';
      var label = function () { var n = +($("[data-hd-count]", cart).textContent || 0); cart.setAttribute("aria-label", "Panier, " + n + (n > 1 ? " articles" : " article")); };
      label();
      new MutationObserver(label).observe(cart, { childList: true, subtree: true, characterData: true });
    }

    /* Bas du menu : Instagram et langue · devise, repris de la page */
    if (!$(".svfm-menu-foot", menu)) {
      var ig = $(".svf-ig-center a[href*='instagram']") || $("a[href*='instagram.com']");
      var fx = $(".svf-hd-fx", root);
      var foot = document.createElement("div");
      foot.className = "svfm-menu-foot svfm-only";
      foot.innerHTML = (ig ? '<a href="' + ig.href + '" target="_blank" rel="noopener">Instagram · ' + (ig.textContent.trim().charAt(0) === "@" ? ig.textContent.trim() : "@sovintagefrip") + "</a>" : "<span></span>") + (fx ? "<span>" + fx.textContent + "</span>" : "");
      menu.appendChild(foot);
    }

    /* Menu : fenêtre modale accessible. svf-header gère l'ouverture ; on suit sa classe is-open. */
    menu.setAttribute("aria-label", "Menu");
    var opened = false, lastFocus = null;
    function background() { return $$("#MainContent, body > footer, .shopify-section-group-footer-group, #header-group > :not(.svf-header-section)"); }
    function focusables() { return [btn].concat($$("a[href],button", menu)); }
    function trap(e) {
      if (e.key !== "Tab" || !opened) return;
      var f = focusables(), i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
    function sync() {
      var open = menu.classList.contains("is-open");
      if (open === opened) return;
      opened = open;
      if (open) {
        lastFocus = document.activeElement;
        menu.setAttribute("role", "dialog"); menu.setAttribute("aria-modal", "true");
        document.documentElement.classList.add("svfm-lock");
        background().forEach(function (el) { el.inert = true; });
        $$(".svf-hd-logo, [data-hd-cart]", root).forEach(function (el) { el.inert = true; });
        var first = $("a", menu); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduce ? 0 : 350);
      } else {
        menu.removeAttribute("role"); menu.removeAttribute("aria-modal");
        document.documentElement.classList.remove("svfm-lock");
        background().forEach(function (el) { el.inert = false; });
        $$(".svf-hd-logo, [data-hd-cart]", root).forEach(function (el) { el.inert = false; });
        if (menu.contains(document.activeElement) || document.activeElement === document.body) (lastFocus && lastFocus.isConnected && lastFocus !== document.body ? lastFocus : btn).focus({ preventScroll: true });
      }
    }
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("keydown", trap);
    return {
      on: function () {},
      off: function () { if (menu.classList.contains("is-open")) btn.click(); }
    };
  }

  /* ---------- Bannière éditoriale ---------- */
  function hero(root) {
    var track = $(".svf-ed-slides", root), main = $(".svf-ed-main", root);
    var slides = $$(".svf-ed-slide", root), n = slides.length;
    if (!track || n < 1) return null;
    var prevB = $("[data-ed-prev]", root), nextB = $("[data-ed-next]", root);
    var numEl = $("[data-ed-num]", root), lookEl = $("[data-ed-look]", root), descEl = $("[data-ed-desc]", root);
    var cap = $(".svf-ed-cap", root), title = $(".svf-ed-title", root);
    var active = false, cur = 0, raf = 0;

    var dots = $(".svfm-dots", cap);
    if (!dots && cap && n > 1) { dots = document.createElement("span"); dots.className = "svfm-dots"; dots.setAttribute("aria-hidden", "true"); dots.innerHTML = slides.map(function () { return "<span></span>"; }).join(""); cap.appendChild(dots); }

    function caption(i) {
      if (numEl) numEl.textContent = pad(i + 1) + " / " + pad(n);
      if (lookEl && lookEl.textContent !== slides[i].dataset.look) lookEl.textContent = slides[i].dataset.look;
      if (descEl && descEl.textContent !== slides[i].dataset.desc) descEl.textContent = slides[i].dataset.desc;
      if (dots) $$("span", dots).forEach(function (d, j) { d.classList.toggle("is-on", j === i); });
      slides.forEach(function (s, j) { s.classList.toggle("is-on", j === i); s.classList.remove("is-prev"); s.setAttribute("aria-hidden", j === i ? "false" : "true"); });
      if (prevB) prevB.disabled = i === 0;
      if (nextB) nextB.disabled = i === n - 1;
    }
    function go(i) { i = Math.max(0, Math.min(n - 1, i)); var s = slides[i]; track.scrollTo({ left: s.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0), behavior: behavior() }); }
    onSettle(track, function () { if (!active) return; var i = startIndex(track, slides); if (i !== cur) { cur = i; caption(i); } });
    track.addEventListener("scroll", function () { if (!active) return; cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var i = startIndex(track, slides); if (i !== cur) { cur = i; caption(i); } }); }, { passive: true });

    /* Sur mobile, svf.js ne reçoit plus les gestes de la bannière : on les intercepte avant lui (phase de capture). */
    root.addEventListener("click", function (e) {
      if (!active) return;
      var b = e.target.closest("[data-ed-prev],[data-ed-next]");
      if (b) { e.stopPropagation(); e.preventDefault(); go(cur + (b.hasAttribute("data-ed-next") ? 1 : -1)); return; }
      if (e.target.closest(".svf-ed-slides")) e.stopPropagation();
    }, true);
    root.addEventListener("keydown", function (e) {
      if (!active || !e.target.closest(".svf-ed-slides")) return;
      e.stopPropagation();
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    }, true);
    /* svf.js met le défilement automatique en pause au survol : on garde cet état tant que l'écran est mobile */
    root.addEventListener("pointerleave", function (e) { if (active && e.target === main) e.stopPropagation(); }, true);

    /* Titre ajusté à la largeur de l'écran, quelle que soit la police chargée */
    function fit() {
      if (!title) return;
      if (!active) { title.style.fontSize = ""; return; }
      title.style.fontSize = "100px";
      var r = document.createRange(); r.selectNodeContents(title);
      var w = r.getBoundingClientRect().width, avail = title.clientWidth;
      if (w && avail) title.style.fontSize = Math.min(220, Math.floor(100 * avail / w * 0.985)) + "px";
    }
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    return {
      on: function () {
        if (active) return; active = true;
        if (main) main.dispatchEvent(new PointerEvent("pointerenter"));
        track.setAttribute("role", "region");
        track.setAttribute("aria-roledescription", "carrousel");
        track.setAttribute("aria-label", "Lookbook Crépuscule, " + n + " looks à faire glisser");
        slides.forEach(function (s, j) { s.setAttribute("role", "group"); s.setAttribute("aria-roledescription", "diapositive"); s.setAttribute("aria-label", (j + 1) + " sur " + n + " : " + (s.dataset.look || "")); });
        cur = startIndex(track, slides); caption(cur); fit();
      },
      off: function () {
        if (!active) return; active = false;
        track.setAttribute("role", "button"); track.setAttribute("aria-label", "Look suivant"); track.removeAttribute("aria-roledescription");
        slides.forEach(function (s) { s.removeAttribute("role"); s.removeAttribute("aria-roledescription"); s.removeAttribute("aria-label"); s.removeAttribute("aria-hidden"); });
        if (prevB) prevB.disabled = false; if (nextB) nextB.disabled = false;
        fit();
        if (main) main.dispatchEvent(new PointerEvent("pointerleave"));
      }
    };
  }

  /* ---------- Le drop ---------- */
  function drop(root) {
    var stage = document.getElementById("svf-signature");
    var hint = $(".svf-head > p.svf-mono", root);
    if (hint && !hint.dataset.desk) hint.dataset.desk = hint.textContent;
    $$(".svf-card", root).forEach(function (card) {
      var media = $(".svf-card-media", card), nameEl = $(".svf-card-name em", card);
      if (!media || !nameEl || !stage || $(".svfm-turn", media)) return;
      var name = nameEl.textContent.trim();
      var b = document.createElement("button");
      b.type = "button"; b.className = "svfm-turn"; b.textContent = "360°";
      b.setAttribute("aria-label", "Voir la Signature " + name + " à 360°");
      b.addEventListener("click", function () {
        var sw = $$(".svf-sw", stage).filter(function (s) { return (s.dataset.name || "").trim() === name; })[0];
        if (sw) sw.click();
        stage.scrollIntoView({ behavior: behavior(), block: "start" });
        var tie = $(".svf-tie", stage); if (tie) setTimeout(function () { tie.focus({ preventScroll: true }); }, reduce ? 0 : 700);
      });
      media.appendChild(b);
    });
    return {
      on: function () { if (hint) hint.textContent = "Faites glisser · touchez « 360° » pour la voir tourner"; },
      off: function () { if (hint) hint.textContent = hint.dataset.desk; }
    };
  }

  /* ---------- Signature 360° ---------- */
  function stage(root) {
    var tie = $(".svf-tie", root); if (!tie || $(".svfm-drag-hint", root)) return null;
    var h = document.createElement("p");
    h.className = "svfm-drag-hint"; h.setAttribute("aria-hidden", "true"); h.textContent = "← Glissez pour faire tourner →";
    tie.insertAdjacentElement("afterend", h);
    tie.addEventListener("pointerdown", function () { h.classList.add("is-off"); }, { once: true });
    return { on: function () {}, off: function () {} };
  }

  /* ---------- Silhouettes ---------- */
  function looks(root) {
    var track = $(".svf-v-stage", root), items = $$(".svf-v-item", root);
    if (!track || !items.length) return null;
    var active = false, prog = false;
    function center(el) { track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2, behavior: prog ? "auto" : behavior() }); }
    /* svf.js marque le look courant (.is-active) : flèches, clic ou geste, on recentre la bande dessus */
    new MutationObserver(function () {
      if (!active) return;
      var cur = items.filter(function (el) { return el.classList.contains("is-active"); })[0];
      if (cur && Math.abs(nearestIndex(track, items) - items.indexOf(cur)) > 0) center(cur);
    }).observe(track, { attributes: true, subtree: true, attributeFilter: ["class"] });
    /* Geste terminé : le look centré devient le look courant (svf.js met à jour la fiche) */
    onSettle(track, function () {
      if (!active) return;
      var i = nearestIndex(track, items);
      if (!items[i].classList.contains("is-active")) items[i].click();
    });
    return {
      on: function () {
        if (active) return; active = true;
        var cur = items.filter(function (el) { return el.classList.contains("is-active"); })[0] || items[0];
        prog = true; center(cur); prog = false;
      },
      off: function () { active = false; }
    };
  }

  var BUILD = { hero: hero, drop: drop, stage: stage, looks: looks };
  var seen = new WeakSet();
  function init(scope) {
    var hr = $("[data-svf-header]", scope);
    if (hr && !seen.has(hr)) { seen.add(hr); var m = header(hr); if (m) mods.push(m); }
    $$("[data-svf]", scope).forEach(function (root) {
      var fn = BUILD[root.dataset.svf]; if (!fn || seen.has(root)) return;
      seen.add(root); var m = fn(root); if (m) mods.push(m);
    });
    apply();
  }
  function boot() {
    init(document);
    if (mq.addEventListener) mq.addEventListener("change", apply); else mq.addListener(apply);
    /* Éditeur de thème : svf.js réinitialise la section rechargée, puis on la reprend */
    document.addEventListener("shopify:section:load", function (e) { mods = mods.filter(function (m) { return m && document.contains(m.root || document.body); }); init(e.target); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
