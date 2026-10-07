/* SOVINTAGEFRIP — comportements des sections svf-* (accueil Crépuscule).
   Chaque section porte data-svf="<type>". init() est rejoué par l'éditeur de thème à chaque modification. */
(function () {
  "use strict";
  if (window.SVF) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var designMode = document.documentElement.classList.contains("shopify-design-mode") || !!(window.Shopify && window.Shopify.designMode);
  var hasG = function () { return !!(window.gsap && window.ScrollTrigger); };
  var FRAMES = 72, TAU = Math.PI * 2;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 360° frames: Files named svf-<signature>-0001.webp … 0072.webp ---------- */
  function frameUrl(base, f) { return base.split("?")[0].replace(/\d{4}\.webp$/, String(f).padStart(4, "0") + ".webp"); }
  var ORDER = (function () { var o = [], seen = {}; [18, 9, 3, 1].forEach(function (step) { for (var i = 0; i < FRAMES; i += step) if (!seen[i]) { seen[i] = 1; o.push(i); } }); return o; })();
  var sets = {};
  function load(base, cb) {
    if (sets[base]) { if (cb) sets[base].cbs.push(cb); return sets[base]; }
    var s = sets[base] = { imgs: new Array(FRAMES), loaded: 0, failed: 0, cbs: cb ? [cb] : [] };
    ORDER.forEach(function (i) {
      var im = new Image(); im.decoding = "async";
      im.onload = function () { s.imgs[i] = im; s.loaded++; s.cbs.forEach(function (f) { f(s); }); };
      im.onerror = function () { s.failed++; s.cbs.forEach(function (f) { f(s); }); };
      im.src = frameUrl(base, i + 1);
    });
    return s;
  }
  function nearest(s, i) { for (var d = 0; d < FRAMES / 2; d++) { var a = s.imgs[(i + d) % FRAMES]; if (a) return a; var b = s.imgs[(i - d + FRAMES) % FRAMES]; if (b) return b; } return null; }

  /* ---------- Illustrations for looks without a photo ---------- */
  function shade(hex, p) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = p < 0 ? 0 : 255, f = Math.abs(p); r = Math.round((t - r) * f + r); g = Math.round((t - g) * f + g); b = Math.round((t - b) * f + b); return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); }
  var uid = 0;
  function lg(id, c) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="' + shade(c, .2) + '"/><stop offset=".5" stop-color="' + c + '"/><stop offset="1" stop-color="' + shade(c, -.38) + '"/></linearGradient>'; }
  function sheen(id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".16"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>'; }
  function svg(defs, body) { return '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' + defs + '</defs>' + body + '</svg>'; }
  function coat(c) {
    var k = "svfc" + (++uid), dk = shade(c, -.42), dk2 = shade(c, -.2);
    var all = "M126 84 C106 90 90 104 82 128 L66 330 L106 338 L120 186 L132 168 Q128 126 126 84 Z M274 84 C294 90 310 104 318 128 L334 330 L294 338 L280 186 L268 168 Q272 126 274 84 Z M126 84 L164 62 Q200 74 236 62 L274 84 Q272 126 268 168 L270 226 L302 452 Q200 466 98 452 L130 226 L132 168 Q128 126 126 84 Z";
    var tw = '<pattern id="' + k + 't" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="' + c + '"/><path d="M0 0h4v4H0zM4 4h4v4H4z" fill="' + shade(c, -.18) + '"/><path d="M1 6h2M5 2h2" stroke="' + shade(c, .35) + '" stroke-width="1"/></pattern>';
    var g = '<path d="' + all + '" fill="url(#' + k + 'b)"/><path d="' + all + '" fill="url(#' + k + 't)" opacity=".75"/><path d="M164 62 Q200 50 236 62 Q200 74 164 62Z" fill="#2A221B"/>';
    g += '<path d="M164 62 L138 104 L158 114 L148 128 L198 206 L200 74 Q182 70 164 62Z M236 62 L262 104 L242 114 L252 128 L202 206 L200 74 Q218 70 236 62Z" fill="' + shade(c, .06) + '" stroke="' + dk + '" stroke-width="1.2" stroke-linejoin="round"/>';
    g += '<path d="M214 206 L226 456" stroke="' + dk + '" stroke-width="1.4"/><path d="M158 252 Q150 350 136 452 M244 252 Q254 350 266 452" stroke="' + dk + '" stroke-opacity=".28" stroke-width="2" fill="none"/>';
    [272, 322, 372].forEach(function (y) { [184, 240].forEach(function (x) { g += '<circle cx="' + x + '" cy="' + y + '" r="5.5" fill="#2A221B"/>'; }); });
    g += '<path d="M68 302 L106 310 L105 321 L67 313Z M332 302 L294 310 L295 321 L333 313Z" fill="' + dk2 + '"/><path d="' + all + '" fill="url(#' + k + 'h)"/>';
    return svg(lg(k + "b", c) + sheen(k + "h") + tw, g);
  }
  function jacket(c) {
    var k = "svfj" + (++uid), dk = shade(c, -.5), dk2 = shade(c, -.28);
    var all = "M122 92 C104 98 86 112 78 134 L58 368 L100 376 L118 196 L130 180 Q124 140 122 92 Z M278 92 C296 98 314 112 322 134 L342 368 L300 376 L282 196 L270 180 Q276 140 278 92 Z M122 92 L160 70 Q200 84 240 70 L278 92 Q276 140 270 180 L272 400 L128 400 L130 180 Q124 140 122 92 Z";
    var g = '<path d="' + all + '" fill="url(#' + k + 'b)"/><path d="M160 70 Q200 54 240 70 Q200 84 160 70Z" fill="' + shade(c, -.62) + '"/>';
    g += '<path d="M60 350 L102 357 L100 376 L58 368Z M298 357 L340 350 L342 368 L300 376Z M128 378 L272 378 L272 400 L128 400Z" fill="' + dk2 + '"/>';
    g += '<path d="M160 70 L146 104 L160 112 L152 124 L196 170 L200 86 Q180 82 160 70Z M240 70 L254 104 L240 112 L248 124 L204 170 L200 86 Q220 82 240 70Z" fill="' + shade(c, .08) + '" stroke="' + dk + '" stroke-width="1.2" stroke-linejoin="round"/>';
    g += '<line x1="200" y1="170" x2="200" y2="400" stroke="#C7A46A" stroke-width="2.4" stroke-dasharray="2 1.6"/><path d="M146 302 L176 270 M254 302 L224 270" stroke="' + dk + '" stroke-width="4.5" stroke-linecap="round"/><path d="' + all + '" fill="url(#' + k + 'h)"/>';
    return svg(lg(k + "b", c) + sheen(k + "h"), g);
  }
  var GARMENTS = { "tweed": function () { return coat("#8A7C66"); }, "tweed-rose": function () { return coat("#6E5F58"); }, "leather": function () { return jacket("#5A3A26"); } };

  /* Pièces des pages Look (même cadre 400×500) : blazer, pantalon, jupe, corset, manteau en fourrure */
  function tweedPat(id, c) { return '<pattern id="' + id + '" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="' + c + '"/><path d="M0 0h4v4H0zM4 4h4v4H4z" fill="' + shade(c, -.18) + '"/><path d="M1 6h2M5 2h2" stroke="' + shade(c, .35) + '" stroke-width="1"/></pattern>'; }
  function furPat(id, c) { return '<pattern id="' + id + '" width="12" height="16" patternUnits="userSpaceOnUse"><path d="M2 0 q3 8 0 16 M8 -2 q-3 9 1 18" stroke="' + shade(c, .3) + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".75"/><path d="M5 2 q2 7 -1 14" stroke="' + shade(c, -.4) + '" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/></pattern>'; }
  function blazer(c, o) {
    o = o || {}; var k = "svfb" + (++uid), dk = shade(c, -.45), dk2 = shade(c, -.22);
    var S = "M122 92 C104 98 86 112 78 134 L62 392 L102 398 L118 196 L130 180 Q124 140 122 92 Z M278 92 C296 98 314 112 322 134 L338 392 L298 398 L282 196 L270 180 Q276 140 278 92 Z";
    var B = "M122 92 L160 70 Q200 84 240 70 L278 92 Q276 140 270 180 L276 430 Q200 440 124 430 L130 180 Q124 140 122 92 Z";
    var LAP = "M160 70 L140 110 L156 120 L146 132 L200 262 L186 84 Q172 80 160 70Z M240 70 L260 110 L244 120 L254 132 L200 262 L214 84 Q228 80 240 70Z";
    var defs = lg(k + "b", c) + sheen(k + "h") + (o.tweed ? tweedPat(k + "t", c) : "") + (o.fur ? furPat(k + "f", o.fur) : "");
    var g = '<path d="' + S + " " + B + '" fill="url(#' + k + 'b)"/>' + (o.tweed ? '<path d="' + S + " " + B + '" fill="url(#' + k + 't)" opacity=".7"/>' : "");
    g += '<path d="M186 84 Q200 92 214 84 L200 262Z" fill="' + (o.shirt || "#EDEBE6") + '"/><path d="M160 70 Q200 54 240 70 Q200 84 160 70Z" fill="' + shade(c, -.6) + '"/>';
    g += '<path d="' + LAP + '" fill="' + (o.fur || shade(c, .07)) + '" stroke="' + dk + '" stroke-width="1.2" stroke-linejoin="round"/>' + (o.fur ? '<path d="' + LAP + '" fill="url(#' + k + 'f)"/>' : "");
    g += '<path d="M200 262 L204 432" stroke="' + dk + '" stroke-width="1.3"/>';
    [292, 338].forEach(function (y) { g += '<circle cx="201" cy="' + y + '" r="5" fill="' + shade(c, -.6) + '"/>'; });
    g += '<path d="M138 332 L180 328 L180 340 L138 344Z M220 328 L262 332 L262 344 L220 340Z" fill="' + dk2 + '"/><path d="M148 202 L176 198" stroke="' + dk + '" stroke-width="3" stroke-linecap="round"/>';
    g += '<path d="' + S + " " + B + '" fill="url(#' + k + 'h)"/>';
    return svg(defs, g);
  }
  function trousers(c) {
    var k = "svft" + (++uid), dk = shade(c, -.42), P = "M134 40 L266 40 L274 140 L282 470 L214 472 L204 180 Q200 170 196 180 L186 472 L118 470 L126 140 Z";
    var g = '<path d="' + P + '" fill="url(#' + k + 'b)"/><path d="M134 40 L266 40 L267 58 L133 58Z" fill="' + shade(c, -.14) + '"/>';
    g += '<path d="M158 64 L152 466 M242 64 L248 466" stroke="' + dk + '" stroke-opacity=".35" stroke-width="1.4" fill="none"/><path d="M136 66 L152 112 M264 66 L248 112" stroke="' + dk + '" stroke-width="1.6"/><path d="' + P + '" fill="url(#' + k + 'h)"/>';
    return svg(lg(k + "b", c) + sheen(k + "h"), g);
  }
  function skirt(c, tw) {
    var k = "svfs" + (++uid), dk = shade(c, -.42), P = "M140 60 L260 60 L302 420 Q200 444 98 420 Z";
    var g = '<path d="' + P + '" fill="url(#' + k + 'b)"/>' + (tw ? '<path d="' + P + '" fill="url(#' + k + 't)" opacity=".7"/>' : "");
    g += '<path d="M140 60 L260 60 L262 82 L138 82Z" fill="' + shade(c, -.16) + '"/><path d="M170 90 Q160 260 140 424 M230 90 Q240 260 262 424 M200 92 L200 436" stroke="' + dk + '" stroke-opacity=".3" stroke-width="1.6" fill="none"/><path d="' + P + '" fill="url(#' + k + 'h)"/>';
    return svg(lg(k + "b", c) + sheen(k + "h") + (tw ? tweedPat(k + "t", c) : ""), g);
  }
  function corset(c) {
    var k = "svfo" + (++uid), P = "M128 130 Q200 104 272 130 L280 300 Q200 336 120 300 Z";
    var g = '<path d="' + P + '" fill="url(#' + k + 'b)"/><path d="' + P + '" fill="url(#' + k + 'f)"/><path d="M152 128 L148 310 M176 120 L174 318 M200 117 L200 322 M224 120 L226 318 M248 128 L252 310" stroke="#000" stroke-opacity=".22" stroke-width="2" fill="none"/><path d="' + P + '" fill="url(#' + k + 'h)"/>';
    return svg(lg(k + "b", c) + furPat(k + "f", c) + sheen(k + "h"), g);
  }
  function furcoat(c) {
    var k = "svff" + (++uid), A = "M126 84 C106 90 90 104 82 128 L66 330 L106 338 L120 186 L132 168 Q128 126 126 84 Z M274 84 C294 90 310 104 318 128 L334 330 L294 338 L280 186 L268 168 Q272 126 274 84 Z M126 84 L164 62 Q200 74 236 62 L274 84 Q272 126 268 168 L270 226 L302 452 Q200 466 98 452 L130 226 L132 168 Q128 126 126 84 Z";
    var g = '<path d="' + A + '" fill="url(#' + k + 'b)"/><path d="' + A + '" fill="url(#' + k + 'f)"/><path d="M150 66 Q200 40 250 66 L262 112 Q200 96 138 112Z" fill="' + shade(c, .1) + '"/><path d="M200 100 L204 458" stroke="#000" stroke-opacity=".3" stroke-width="2"/><path d="' + A + '" fill="url(#' + k + 'h)"/>';
    return svg(lg(k + "b", c) + furPat(k + "f", c) + sheen(k + "h"), g);
  }
  /* <div data-svf-garment="blazer" data-color="#1F1E1D" data-tweed data-fur="#3A2A22"> */
  function garmentOf(el) {
    var t = el.dataset.svfGarment, c = el.dataset.color || "#2A2826";
    if (t === "blazer") return blazer(c, { tweed: el.hasAttribute("data-tweed"), fur: el.dataset.fur || null, shirt: el.dataset.shirt || null });
    if (t === "trousers") return trousers(c);
    if (t === "skirt") return skirt(c, el.hasAttribute("data-tweed"));
    if (t === "corset") return corset(c);
    if (t === "furcoat") return furcoat(c);
    if (t === "jacket") return jacket(c);
    if (t === "coat") return coat(c);
    return "";
  }

  /* ---------- Smooth scrolling ---------- */
  /* Horizon fait défiler .page-wrapper (et non la fenêtre) à partir de 990 px : on suit le vrai conteneur. */
  var lenis = null, scroller = null;
  function findScroller() {
    var pw = document.querySelector(".page-wrapper"); if (!pw) return null;
    var oy = getComputedStyle(pw).overflowY;
    return (oy === "auto" || oy === "scroll") ? pw : null;
  }
  function headerOffset() { var v = parseFloat(getComputedStyle(document.body).getPropertyValue("--header-height")); return -((isNaN(v) ? 70 : v) + 10); }
  function scrollToEl(t, done) {
    if (lenis) { lenis.scrollTo(t, { offset: headerOffset(), duration: 1.6, onComplete: done }); return; }
    var top = scroller ? t.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop : t.getBoundingClientRect().top + window.scrollY;
    (scroller || window).scrollTo({ top: top + headerOffset(), behavior: reduce ? "auto" : "smooth" });
    if (done) setTimeout(done, reduce ? 0 : 900);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute("href"); if (id.length < 2) return;
    if (!a.closest(".svf") && id.indexOf("#svf") !== 0) return;
    var t = document.getElementById(id.slice(1)); if (!t) return;
    e.preventDefault();
    scrollToEl(t, function () { var input = t.querySelector('input[type="email"]'); if (input) input.focus({ preventScroll: true }); });
  });

  /* ---------- Components ---------- */
  var C = {};

  C.hero = function (root) {
    /* Hauteur occupée au-dessus du diptyque (bandeau + en-tête), mesurée depuis le haut du document */
    function set() { var top = root.getBoundingClientRect().top + (scroller ? scroller.scrollTop : window.scrollY); root.style.setProperty("--svf-header", Math.max(0, Math.round(top)) + "px"); }
    set(); window.addEventListener("resize", set);
    var ro = window.ResizeObserver && document.getElementById("header-group") ? new ResizeObserver(set) : null; if (ro) ro.observe(document.getElementById("header-group"));

    /* Titre découpé lettre à lettre pour l'apparition */
    var title = $(".svf-ed-title", root);
    if (title && !title.dataset.split) {
      var em = $("em", title), emTxt = em ? em.textContent : "", word = title.textContent.slice(0, title.textContent.length - emTxt.length);
      title.innerHTML = word.split("").map(function (c, i) { return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("") + (emTxt ? '<em class="ch" aria-hidden="true" style="--i:' + word.length + '">' + emTxt + "</em>" : "");
      title.dataset.split = "1";
    }

    /* Looks en rideau */
    var slides = $$(".svf-ed-slide", root), n = slides.length, cur = 0, elapsed = 0, last = performance.now(), hover = false, inView = true, clearT = 0, raf = 0;
    var DUR = (parseFloat(getComputedStyle(root).getPropertyValue("--svf-dur")) || 6) * 1000;
    var bar = $("[data-ed-bar]", root), numEl = $("[data-ed-num]", root), lookEl = $("[data-ed-look]", root), descEl = $("[data-ed-desc]", root), stage = $(".svf-ed-slides", root);
    function pad(v) { return String(v).padStart(2, "0"); }
    function swap(el, txt) { if (!el) return; el.textContent = txt; if (el.animate && !reduce) el.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" }); }
    function show(i) {
      if (n < 2) return; i = (i + n) % n; if (i === cur) return; var prev = cur;
      slides.forEach(function (s, j) { s.classList.toggle("is-prev", j === prev); s.classList.toggle("is-on", j === i); });
      clearTimeout(clearT); clearT = setTimeout(function () { slides[prev].classList.remove("is-prev"); }, 1300);
      cur = i; elapsed = 0;
      if (numEl) numEl.textContent = pad(i + 1) + " / " + pad(n);
      swap(lookEl, slides[i].dataset.look); swap(descEl, slides[i].dataset.desc);
    }
    var onKey = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(cur + 1); } if (e.key === "ArrowRight") show(cur + 1); if (e.key === "ArrowLeft") show(cur - 1); };
    if (stage) { stage.addEventListener("click", function () { show(cur + 1); }); stage.addEventListener("keydown", onKey); }
    var pv = $("[data-ed-prev]", root), nx = $("[data-ed-next]", root);
    if (pv) pv.addEventListener("click", function () { show(cur - 1); });
    if (nx) nx.addEventListener("click", function () { show(cur + 1); });
    var main = $(".svf-ed-main", root);
    if (main) { main.addEventListener("pointerenter", function () { hover = true; }); main.addEventListener("pointerleave", function () { hover = false; }); }
    var io = new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }); io.observe(root);
    window.addEventListener("load", function () { slides.forEach(function (s) { var im = $("img", s); if (im) im.loading = "eager"; }); });
    function tick(now) {
      var dt = now - last; last = now;
      if (!reduce && !designMode && !hover && inView && !document.hidden && n > 1) { elapsed += dt; if (elapsed >= DUR) show(cur + 1); }
      if (bar) bar.style.transform = "scaleX(" + Math.min(1, elapsed / DUR) + ")";
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    /* Gros plans au pointeur */
    var ed = $(".svf-ed", root);
    var onMove = function (e) { if (reduce || e.pointerType !== "mouse") return; var r = ed.getBoundingClientRect(); ed.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5).toFixed(3)); ed.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5).toFixed(3)); };
    if (ed) ed.addEventListener("pointermove", onMove);

    return function () { window.removeEventListener("resize", set); if (ro) ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); clearTimeout(clearT); if (ed) ed.removeEventListener("pointermove", onMove); };
  };

  C.intro = function (root) {
    var name = $("[data-svf-intro-name]", root), desc = $("[data-svf-intro-desc]", root);
    function set(btn) {
      var i = +btn.dataset.i;
      $$(".svf-stack .svf-hang", root).forEach(function (el, j) { el.classList.toggle("is-on", j === i); });
      $$(".svf-thumb", root).forEach(function (el) { el.setAttribute("aria-pressed", String(el === btn)); });
      if (name) name.textContent = btn.dataset.name; if (desc) desc.textContent = btn.dataset.desc;
    }
    var h = function (e) { var b = e.target.closest(".svf-thumb"); if (b) set(b); };
    root.addEventListener("click", h);
    return function () { root.removeEventListener("click", h); };
  };

  C.drop = function (root) {
    $$(".svf-card-media[data-base]", root).forEach(function (m) {
      var base = m.dataset.base, img = $("img", m), turn = $(".svf-card-turn", m), first = img.getAttribute("src");
      m.addEventListener("pointerenter", function () { load(base); });
      m.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var r = m.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
        var i = ((Math.floor((x - .5) * FRAMES * 1.2) % FRAMES) + FRAMES) % FRAMES, s = sets[base], im = s && (s.imgs[i] || nearest(s, i));
        if (im) img.src = im.src; if (turn) turn.style.opacity = 0;
      });
      m.addEventListener("pointerleave", function () { img.src = first; if (turn) turn.style.opacity = 1; });
    });
  };

  C.stage = function (root) {
    var box = $(".svf-tie", root), cv = $("canvas", box), ctx = cv.getContext("2d"), loadingEl = $(".svf-loading", root);
    var ghost = $(".svf-ghost", root), ghostWord = $(".svf-ghost-word", root), cta = $("[data-svf-cta]", root);
    var sws = $$(".svf-sw", root); if (!sws.length) return;
    var W = 0, H = 0, dpr = 1, current = null, previous = null, fade = 1;
    var AUTO = reduce ? 0 : .32, angle = 0, vel = 0, spinDir = 1, dragging = false, lastX = 0, lastT = 0, lastInteract = performance.now() - 1200;
    root.svfScrollAngle = 0;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = box.clientWidth; H = box.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    function progress(s) {
      if (!current || sets[current.dataset.base] !== s) return;
      if (s.loaded + s.failed >= FRAMES) { loadingEl.textContent = s.failed ? s.failed + " vues manquantes" : "Vues chargées"; if (!s.failed) loadingEl.classList.add("is-done"); }
      else { loadingEl.textContent = "Chargement des vues · " + s.loaded + " / " + FRAMES; loadingEl.classList.remove("is-done"); }
    }
    /* Les 72 vues d'un coloris ne se chargent qu'à l'approche de la scène ; les autres au survol de leur pastille. */
    var armed = false;
    function arm() { if (armed || !current) return; armed = true; progress(load(current.dataset.base, progress)); }
    sws.forEach(function (b) { b.addEventListener("pointerenter", function () { if (armed) load(b.dataset.base); }); });
    function setSig(btn, animate) {
      if (btn === current) return; previous = current; current = btn; fade = animate && !reduce ? 0 : 1;
      if (armed) progress(load(btn.dataset.base, progress));
      sws.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      $$("[data-svf-fur]", root).forEach(function (el) { el.textContent = btn.dataset.fur; });
      $$("[data-svf-back]", root).forEach(function (el) { el.textContent = btn.dataset.back; });
      if (cta && btn.dataset.url) cta.setAttribute("href", btn.dataset.url);
      if (animate && !reduce) { ghost.classList.add("is-out"); setTimeout(function () { ghostWord.textContent = btn.dataset.name; ghost.classList.remove("is-out"); }, 260); vel = 5.5 * spinDir; lastInteract = performance.now(); }
      else ghostWord.textContent = btn.dataset.name;
    }
    sws.forEach(function (b) { b.addEventListener("click", function () { setSig(b, true); }); });
    function drawSet(s, pos, alpha, bob) {
      if (!s || !s.loaded) return; var i0 = Math.floor(pos) % FRAMES, i1 = (i0 + 1) % FRAMES, f = pos - Math.floor(pos), a = s.imgs[i0], b = s.imgs[i1], y = bob * H;
      ctx.globalAlpha = alpha;
      if (a && b) { ctx.drawImage(a, 0, y, W, H); if (f > .02) { ctx.globalAlpha = alpha * f; ctx.drawImage(b, 0, y, W, H); } }
      else { var n = nearest(s, Math.round(pos) % FRAMES); if (n) ctx.drawImage(n, 0, y, W, H); }
      ctx.globalAlpha = 1;
    }
    function drawShadow(bob) { var rx = W * .2 * (1 - bob * 4), ry = H * .012; ctx.save(); ctx.translate(W / 2, H * .935); ctx.scale(1, ry / rx); var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, "rgba(0,0,0,.26)"); g.addColorStop(.5, "rgba(0,0,0,.1)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore(); }
    box.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.button !== 0) return; dragging = true; vel = 0; lastX = e.clientX; lastT = e.timeStamp; box.setPointerCapture(e.pointerId); box.classList.add("is-drag"); });
    box.addEventListener("pointermove", function (e) { if (!dragging) return; var dx = e.clientX - lastX, dt = Math.max((e.timeStamp - lastT) / 1000, .008), da = dx * .0095; angle += da; vel = vel * .6 + (da / dt) * .4; lastX = e.clientX; lastT = e.timeStamp; });
    function endDrag(e) { if (!dragging) return; dragging = false; box.classList.remove("is-drag"); if (e.timeStamp - lastT > 90) vel = 0; vel = Math.max(-9, Math.min(9, vel)); if (Math.abs(vel) > .05) spinDir = Math.sign(vel); lastInteract = performance.now(); }
    box.addEventListener("pointerup", endDrag); box.addEventListener("pointercancel", endDrag);
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { spinDir = e.key === "ArrowRight" ? 1 : -1; if (reduce) angle += spinDir * TAU / 16; else vel = spinDir * 2.6; lastInteract = performance.now(); e.preventDefault(); }
      else if (e.key === "Home") { angle = 0; vel = 0; e.preventDefault(); }
    });
    var ticks = $(".svf-ticks", root);
    if (ticks && !ticks.childNodes.length) for (var t = 0; t < 24; t++) { var a = t / 24 * TAU, r1 = t % 6 ? 25.5 : 24.5, r2 = 27.5; ticks.insertAdjacentHTML("beforeend", '<line class="tick" x1="' + (29 + Math.sin(a) * r1) + '" y1="' + (29 - Math.cos(a) * r1) + '" x2="' + (29 + Math.sin(a) * r2) + '" y2="' + (29 - Math.cos(a) * r2) + '"/>'); }
    var degEl = $(".svf-deg", root), faceEl = $(".svf-face", root), needle = $(".needle", root), shownDeg = -1;
    function updateDial(total) {
      var deg = Math.round(((total * 180 / Math.PI) % 360 + 360) % 360) % 360; if (deg === shownDeg) return; shownDeg = deg; var front = deg > 270 || deg < 90;
      degEl.textContent = deg + "°"; faceEl.textContent = front ? "Endroit · fourrure" : "Envers · jacquard"; needle.setAttribute("transform", "rotate(" + deg + " 29 29)");
      box.setAttribute("aria-valuenow", deg); box.setAttribute("aria-valuetext", deg + " degrés, " + (front ? "endroit en fourrure" : "envers en jacquard"));
    }
    var last = performance.now(), time = 0, raf = 0, inView = false;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      var dt = Math.min((now - last) / 1000, .05); last = now; time += dt;
      if (dragging) vel *= Math.exp(-dt * 8);
      else { var idle = performance.now() - lastInteract > 2600; vel += ((idle ? AUTO * spinDir : 0) - vel) * (1 - Math.exp(-dt * (idle ? .7 : 2))); angle += vel * dt; }
      fade = Math.min(1, fade + dt / .45);
      var total = angle + root.svfScrollAngle, pos = (((total / TAU) * FRAMES) % FRAMES + FRAMES) % FRAMES, bob = reduce ? 0 : Math.sin(time * .8) * .004;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      drawShadow(bob); drawSet(sets[current.dataset.base], pos, 1, bob); if (fade < 1 && previous) drawSet(sets[previous.dataset.base], pos, 1 - fade, bob);
      updateDial(total);
    }
    function setRunning() { cancelAnimationFrame(raf); if (inView && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    var io = new IntersectionObserver(function (en) { inView = en[0].isIntersecting; setRunning(); }); io.observe(root);
    var ioNear = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { arm(); ioNear.disconnect(); } }, { rootMargin: "900px 0px" }); ioNear.observe(root);
    document.addEventListener("visibilitychange", setRunning);
    var ro = new ResizeObserver(size); ro.observe(box);
    size(); setSig(sws.filter(function (b) { return b.dataset.default === "true"; })[0] || sws[0], false);
    return function () { cancelAnimationFrame(raf); io.disconnect(); ioNear.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", setRunning); };
  };

  C.looks = function (root) {
    var stage = $(".svf-v-stage", root), items = $$(".svf-v-item", root); if (!items.length) return;
    var cur = 0, sx = null, swiped = false;
    function layout() {
      var w = items[0].offsetWidth, n = items.length, gap = w * .07;
      items.forEach(function (el, i) {
        var d = i - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n; var a = Math.abs(d), s = a ? .58 : 1;
        var x = a ? Math.sign(d) * (w * .5 + gap + w * s * .5 + (a - 1) * (w * s + gap)) : 0;
        el.style.transform = "translateX(-50%) translateX(" + x + "px) scale(" + s + ")"; el.style.opacity = a > 3 ? 0 : a ? .42 : 1; el.style.zIndex = 10 - a; el.classList.toggle("is-active", !a); el.tabIndex = a > 3 ? -1 : 0;
      });
      var it = items[cur];
      $$("[data-v]", root).forEach(function (el) { el.textContent = it.dataset[el.dataset.v] || "—"; if (el.animate && !reduce) el.animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" }); });
      var c = $(".svf-v-count", root); if (c) c.textContent = String(cur + 1).padStart(2, "0") + "/" + String(n).padStart(2, "0");
    }
    function go(i) { cur = (i + items.length) % items.length; layout(); }
    stage.addEventListener("click", function (e) { var b = e.target.closest(".svf-v-item"); if (b && !swiped) go(+b.dataset.i); });
    stage.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
    stage.addEventListener("pointerdown", function (e) { sx = e.clientX; swiped = false; });
    stage.addEventListener("pointerup", function (e) { if (sx == null) return; var dx = e.clientX - sx; if (Math.abs(dx) > 40) { swiped = true; go(cur + (dx < 0 ? 1 : -1)); setTimeout(function () { swiped = false; }, 50); } sx = null; });
    var p = $("[data-svf-prev]", root), n = $("[data-svf-next]", root);
    if (p) p.addEventListener("click", function () { go(cur - 1); }); if (n) n.addEventListener("click", function () { go(cur + 1); });
    window.addEventListener("resize", layout); layout();
    return function () { window.removeEventListener("resize", layout); };
  };

  C.mesure = function (root) {
    var acc = $(".svf-acc", root); if (!acc) return;
    var h = function (e) {
      var b = e.target.closest(".svf-acc-btn"); if (!b) return; var i = +b.dataset.i, item = b.closest(".svf-acc-item"), open = !item.classList.contains("is-open");
      $$(".svf-acc-item", root).forEach(function (it) { it.classList.remove("is-open"); $(".svf-acc-btn", it).setAttribute("aria-expanded", "false"); });
      if (open) { item.classList.add("is-open"); b.setAttribute("aria-expanded", "true"); $$(".svf-m-slide", root).forEach(function (s, j) { s.classList.toggle("is-on", j === i); }); }
    };
    acc.addEventListener("click", h);
    return function () { acc.removeEventListener("click", h); };
  };

  C.ig = function (root) {
    var wall = $(".svf-ig-wall", root); if (!wall || reduce) return;
    var h = function (e) { var r = wall.getBoundingClientRect(); wall.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5).toFixed(3)); wall.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5).toFixed(3)); };
    wall.addEventListener("pointermove", h);
    return function () { wall.removeEventListener("pointermove", h); };
  };

  C.news = function (root) {
    var wm = $(".svf-wm", root); if (!wm) return;
    if (!wm.dataset.split) { wm.innerHTML = wm.textContent.trim().split("").map(function (ch) { return '<span aria-hidden="true">' + (ch === " " ? "&nbsp;" : ch) + "</span>"; }).join(""); wm.dataset.split = "1"; }
    function fit() { wm.style.fontSize = "100px"; var w = wm.getBoundingClientRect().width, t = wm.parentElement.clientWidth; if (w) wm.style.fontSize = (100 * t / w * .995) + "px"; }
    fit(); window.addEventListener("resize", fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return function () { window.removeEventListener("resize", fit); };
  };

  /* ---------- Page Collection : bande de looks, le look au point focal s'agrandit ---------- */
  C.collection = function (root) {
    var strip = $(".svf-cv-strip", root), items = $$(".svf-cv-item", root), cap = $(".svf-cv-cap", root), cnt = $("[data-cv-count]", root), hint = $(".svf-cv-hint", root), idx = $(".svf-cv-index", root);
    if (!items.length) return;
    if (lenis) lenis.stop();
    var n = items.length, p = 0, t = 0, vel = 0, raf = 0, shown = -1, snapT = 0, drag = null, moved = false;
    function clampI(v) { return Math.max(0, Math.min(n - 1, v)); }
    function pad(v) { return String(v).padStart(2, "0"); }
    function metrics() { var W = innerWidth, H = innerHeight, mob = W < 700; return { fx: mob ? W * .5 : W * .3, base: mob ? Math.max(52, W * .14) : Math.min(116, W * .065), big: mob ? Math.min(W * .58, H * .4 / 1.5 * 1.5) : Math.min(W * .2, H * .58 / 1.5), gap: mob ? 8 : 14 }; }
    function layout() {
      var m = metrics(), ws = [], xs = [], x = 0, i;
      for (i = 0; i < n; i++) { var k = Math.max(0, 1 - Math.abs(i - p)); k = k * k * (3 - 2 * k); ws[i] = m.base + (m.big - m.base) * k; }
      for (i = 0; i < n; i++) { xs[i] = x; x += ws[i] + m.gap; }
      var a = Math.max(0, Math.min(n - 1, Math.floor(p))), f = p - a, c0 = xs[a] + ws[a] / 2, c1 = a + 1 < n ? xs[a + 1] + ws[a + 1] / 2 : c0, shift = m.fx - (c0 + (c1 - c0) * f);
      var tilt = reduce ? 0 : Math.max(-10, Math.min(10, vel * -140));
      items.forEach(function (el, j) { el.style.width = ws[j] + "px"; el.style.transform = "translate3d(" + (xs[j] + shift) + "px,-50%,0) perspective(900px) rotateY(" + tilt + "deg)"; });
      var fi = Math.round(p);
      if (fi !== shown) { shown = fi; var it = items[fi]; cap.innerHTML = "<b>(" + pad(fi + 1) + ")</b>" + it.dataset.name + "<br>" + it.dataset.pieces; if (cnt) cnt.textContent = pad(fi + 1) + " / " + pad(n); }
      var capH = cap.offsetHeight || 60; cap.style.left = Math.max(16, xs[fi] + shift) + "px"; cap.style.top = Math.max(70, innerHeight / 2 - ws[fi] * 1.5 / 2 - capH - 18) + "px";
    }
    function tick() { var prev = p; p += (t - p) * (reduce ? 1 : .1); vel = p - prev; if (Math.abs(t - p) < .0005) { p = t; vel = 0; } layout(); raf = requestAnimationFrame(tick); }
    raf = requestAnimationFrame(tick);
    function hideHint() { if (hint) hint.style.opacity = 0; }
    var onWheel = function (e) { if (idx && !idx.hidden) return; e.preventDefault(); var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; t = clampI(t + d * .0035); clearTimeout(snapT); snapT = setTimeout(function () { t = Math.round(t); }, 160); hideHint(); };
    root.addEventListener("wheel", onWheel, { passive: false });
    strip.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, t: t }; moved = false; });
    var onMove = function (e) { if (!drag) return; var dx = e.clientX - drag.x, m = metrics(); if (Math.abs(dx) > 5) moved = true; t = clampI(drag.t - dx / (m.base + m.gap)); };
    var onUp = function () { if (!drag) return; drag = null; t = Math.round(t); if (moved) hideHint(); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
    strip.addEventListener("click", function (e) {
      var a = e.target.closest(".svf-cv-item"); if (!a) return; e.preventDefault(); if (moved) { moved = false; return; }
      var i = +a.dataset.i; if (i === Math.round(p) && a.href) window.location.href = a.href; else t = i;
    });
    var onKey = function (e) { if (idx && !idx.hidden) return; if (e.key === "ArrowRight") { t = clampI(Math.round(t) + 1); hideHint(); } else if (e.key === "ArrowLeft") { t = clampI(Math.round(t) - 1); hideHint(); } else if (e.key === "Enter" && items[Math.round(p)].href) window.location.href = items[Math.round(p)].href; };
    document.addEventListener("keydown", onKey);
    var bS = $("[data-cv-strip]", root), bI = $("[data-cv-index]", root);
    function mode(index) { if (!idx) return; idx.hidden = !index; if (bS) bS.setAttribute("aria-pressed", String(!index)); if (bI) bI.setAttribute("aria-pressed", String(!!index)); }
    if (bS) bS.addEventListener("click", function () { mode(false); });
    if (bI) bI.addEventListener("click", function () { mode(true); });
    return function () { cancelAnimationFrame(raf); root.removeEventListener("wheel", onWheel); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); document.removeEventListener("keydown", onKey); if (lenis) lenis.start(); };
  };

  /* ---------- Page Look : tenue complète ⇄ pièce par pièce, sélection, ajout au panier ---------- */
  C.look = function (root) {
    var stage = $(".svf-lk-stage", root), rows = $$(".svf-lk-row", root), cards = $$(".svf-lk-card", root), detail = $(".svf-lk-detail", root);
    var bFull = $("[data-lk-full]", root), bDec = $("[data-lk-dec]", root), addBtn = $("[data-lk-add]", root), msg = $("[data-lk-msg]", root);
    if (!rows.length) return;
    /* Pièce vendue (data-sold) : visible et consultable, jamais sélectionnée ni ajoutée au panier */
    var sold = rows.map(function (r) { return r.hasAttribute("data-sold"); });
    var sel = -1, inc = rows.map(function (r, i) { return !sold[i]; }), size = rows.map(function () { return 0; });
    var cur = (window.Shopify && Shopify.currency && Shopify.currency.active) || "EUR";
    var money = function (cents) { try { return new Intl.NumberFormat(document.documentElement.lang || "fr-FR", { style: "currency", currency: cur }).format(cents / 100); } catch (e) { return (cents / 100).toFixed(2) + " €"; } };
    function mode(dec) { stage.classList.toggle("is-dec", dec); bFull.setAttribute("aria-pressed", String(!dec)); bDec.setAttribute("aria-pressed", String(dec)); }
    function refresh() {
      rows.forEach(function (r, i) { r.classList.toggle("is-sel", i === sel); $("input", r).checked = inc[i]; });
      cards.forEach(function (c, i) { c.classList.toggle("is-dim", (sel >= 0 && i !== sel) || !inc[i]); });
      if (sel < 0) detail.innerHTML = "<p>" + detail.dataset.empty + "</p>";
      else {
        var r = rows[sel], sizes = (r.dataset.sizes || "").split("|").filter(Boolean), tpl = r.dataset.detail && document.getElementById(r.dataset.detail);
        var sizesHtml = sizes.length ? '<div class="svf-lk-sizes" role="group" aria-label="Taille">' + sizes.map(function (s, j) { return '<button type="button" data-size="' + j + '" aria-pressed="' + (j === size[sel]) + '">' + s + "</button>"; }).join("") + "</div>" : "";
        if (tpl) detail.innerHTML = tpl.innerHTML + sizesHtml;
        else detail.innerHTML = (r.dataset.og ? '<p class="svf-mono">' + r.dataset.og + "</p>" : "") + "<h2>" + r.dataset.name + "</h2>" + (r.dataset.mat ? "<p>" + r.dataset.mat + "</p>" : "") + sizesHtml +
          (r.dataset.variants ? "" : '<p class="svf-mono">Pas encore en vente en ligne.</p>');
      }
      var n = 0, tot = 0, buyable = 0;
      rows.forEach(function (r, i) { if (!inc[i]) return; n++; tot += +(r.dataset.price || 0); if (r.dataset.variants) buyable++; });
      $("[data-lk-count]", root).textContent = "Sélection · " + n + (n > 1 ? " pièces" : " pièce");
      $("[data-lk-total]", root).textContent = money(tot);
      addBtn.disabled = !buyable;
      if (msg) msg.textContent = buyable < n ? "Les pièces « sur demande » se réservent par message : elles ne sont pas ajoutées au panier." : "";
    }
    bFull.addEventListener("click", function () { mode(false); });
    bDec.addEventListener("click", function () { mode(true); });
    function pick(i) { sel = sel === i ? -1 : i; refresh(); }
    rows.forEach(function (r, i) {
      $("input", r).addEventListener("change", function (e) { if (sold[i]) { e.target.checked = false; return; } inc[i] = e.target.checked; refresh(); });
      r.addEventListener("click", function (e) { if (e.target.closest("input")) return; pick(i); });
    });
    cards.forEach(function (c, i) { c.addEventListener("click", function () { if (!stage.classList.contains("is-dec")) mode(true); pick(i); }); });
    detail.addEventListener("click", function (e) { var b = e.target.closest("[data-size]"); if (!b) return; size[sel] = +b.dataset.size; refresh(); });
    addBtn.addEventListener("click", function () {
      var list = [];
      rows.forEach(function (r, i) { if (!inc[i] || !r.dataset.variants) return; var v = r.dataset.variants.split("|"); list.push({ id: +(v[size[i]] || v[0]), quantity: 1 }); });
      if (!list.length) return;
      addBtn.disabled = true; if (msg) msg.textContent = "Ajout au panier…";
      var rootUrl = (window.Shopify && Shopify.routes && Shopify.routes.root) || "/";
      fetch(rootUrl + "cart/add.js", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ items: list }) })
        .then(function (r) { if (!r.ok) return r.json().then(function (j) { throw new Error(j.description || "Erreur"); }); window.location.href = rootUrl + "cart"; })
        .catch(function (err) { addBtn.disabled = false; if (msg) msg.textContent = "Ajout impossible : " + err.message; });
    });
    refresh();
  };

  /* ---------- Page Contact : service → questions adaptées → brief en direct → formulaire Shopify ---------- */
  C.contact = function (root) {
    var form = $("form", root); if (!form) return;
    var cards = $$("[data-svc]", root), grid = $(".svf-ct-formgrid", root), brief = $(".svf-ct-brief dl", root), prog = $(".svf-ct-prog span", root), titleEl = $(".svf-ct-brief h3", root), svc = null;
    function vis(el) { return !el.closest("[hidden]"); }
    function answers() {
      var out = [];
      $$("[data-key]", form).forEach(function (el) {
        if (!vis(el)) return; var v = "";
        if (el.classList.contains("svf-chips")) v = $$('button[aria-pressed="true"]', el).map(function (b) { return b.textContent; }).join(", ");
        else v = (el.value || "").trim();
        if (el.type === "range") v = v + (el.dataset.unit || "");
        out.push({ key: el.dataset.key, label: el.dataset.label, v: v, req: el.hasAttribute("data-req"), el: el });
      });
      return out;
    }
    function update() {
      var a = answers(), done = a.filter(function (x) { return x.v; });
      brief.innerHTML = done.length ? done.map(function (x) { return "<div><dt>" + x.label + "</dt><dd>" + x.v.replace(/</g, "&lt;") + "</dd></div>"; }).join("") : '<div><dt>Brief</dt><dd class="is-empty">Vos réponses s’affichent ici au fil du formulaire.</dd></div>';
      if (prog) prog.style.width = Math.round(100 * done.length / Math.max(1, a.length)) + "%";
    }
    cards.forEach(function (c) {
      c.addEventListener("click", function () {
        svc = c.dataset.svc;
        cards.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        root.classList.add("has-choice");
        $$("[data-svc-fields]", root).forEach(function (f) { f.hidden = f.dataset.svcFields !== svc; });
        grid.hidden = false; titleEl.innerHTML = c.dataset.title;
        $('input[name="contact[Service]"]', form).value = c.dataset.label;
        update(); scrollToEl(grid);
      });
    });
    form.addEventListener("click", function (e) {
      var b = e.target.closest(".svf-chips button"); if (!b) return;
      var box = b.parentElement;
      if (box.hasAttribute("data-single")) $$("button", box).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b && x.getAttribute("aria-pressed") !== "true")); });
      else b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      var err = $(".svf-ct-err", box.parentElement); if (err) err.textContent = "";
      update();
    });
    form.addEventListener("input", function (e) { if (e.target.type === "range") { var o = $("output", e.target.parentElement); if (o) o.textContent = e.target.value; } var err = $(".svf-ct-err", e.target.parentElement); if (err) err.textContent = ""; update(); });
    form.addEventListener("submit", function (e) {
      var a = answers(), ok = true, first = null;
      a.forEach(function (x) { if (x.req && !x.v) { ok = false; var err = $(".svf-ct-err", x.el.parentElement); if (err) err.textContent = x.el.dataset.err || "Champ requis."; first = first || x.el; } });
      var em = $('input[type="email"]', form); if (em && !em.checkValidity()) { ok = false; var er = $(".svf-ct-err", em.parentElement); if (er) er.textContent = "Indiquez une adresse e-mail valide, par exemple nom@domaine.fr."; first = first || em; }
      if (!ok) { e.preventDefault(); if (first) scrollToEl(first); return; }
      /* Le brief complet part dans le corps du message Shopify */
      $('textarea[name="contact[body]"]', form).value = ["Service : " + ($('input[name="contact[Service]"]', form).value || "—")].concat(a.filter(function (x) { return x.v; }).map(function (x) { return x.label + " : " + x.v; })).join("\n");
    });
    update();
  };

  /* ---------- Page 404 : la Signature tourne avec le pointeur, ou seule ---------- */
  C.nf = function (root) {
    var img = $("[data-nf-img]", root); if (!img) return;
    var bases = (img.dataset.bases || "").split("|").filter(Boolean), names = (img.dataset.names || "").split("|"), k = Math.floor(Math.random() * bases.length), base = bases[k], fr = 0, lastMove = 0, timer = 0;
    if (!base) return;
    img.src = base; var capEl = $("[data-nf-cap]", root); if (capEl && names[k]) capEl.textContent = "Signature " + names[k] + " · faites-la tourner";
    load(base);
    function showF(i) { var s = sets[base], im = s && (s.imgs[i] || nearest(s, i)); if (im) img.src = im.src; fr = i; }
    var mv = function (e) { lastMove = performance.now(); var x = e.clientX / innerWidth; showF(((Math.floor((x - .5) * FRAMES * 1.5) % FRAMES) + FRAMES) % FRAMES); };
    document.addEventListener("pointermove", mv);
    if (!reduce) timer = setInterval(function () { if (performance.now() - lastMove > 1800) showF((fr + 1) % FRAMES); }, 70);
    return function () { document.removeEventListener("pointermove", mv); clearInterval(timer); };
  };

  /* ---------- Fiche Signature : 360° glissable, vues photo, ajout au panier sans quitter la page ---------- */
  C.product = function (root) {
    var base = root.dataset.base, box = $(".svf-pd-tie", root), cv = box && $("canvas", box), poster = box && $(".svf-pd-poster", box);
    var fns = [];
    if (cv) {
      var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, angle = 0, vel = 0, dir = 1, dragging = false, lastX = 0, lastT = 0, lastInteract = 0, ready = false;
      var degEl = $("[data-pd-deg]", root), faceEl = $("[data-pd-face]", root), hint = $("[data-pd-hint]", root), shown = -1;
      var size = function () { dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = box.clientWidth; H = box.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
      /* L'image fixe reste affichée tant que le canvas n'a pas réellement peint une vue */
      var painted = false;
      load(base, function (s) { if (!ready && s.loaded > 8) ready = true; });
      box.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.button !== 0) return; dragging = true; vel = 0; lastX = e.clientX; lastT = e.timeStamp; box.setPointerCapture(e.pointerId); box.classList.add("is-drag"); if (hint) hint.style.opacity = 0; });
      box.addEventListener("pointermove", function (e) { if (!dragging) return; var dx = e.clientX - lastX, dt = Math.max((e.timeStamp - lastT) / 1000, .008), da = dx * .0095; angle += da; vel = vel * .6 + (da / dt) * .4; lastX = e.clientX; lastT = e.timeStamp; });
      var end = function (e) { if (!dragging) return; dragging = false; box.classList.remove("is-drag"); if (e.timeStamp - lastT > 90) vel = 0; vel = Math.max(-9, Math.min(9, vel)); if (Math.abs(vel) > .05) dir = Math.sign(vel); lastInteract = performance.now(); };
      box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
      box.addEventListener("keydown", function (e) { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; dir = e.key === "ArrowRight" ? 1 : -1; if (reduce) angle += dir * TAU / 16; else vel = dir * 2.6; lastInteract = performance.now(); e.preventDefault(); });
      var last = performance.now(), raf = 0, on = false;
      var loop = function (now) {
        raf = requestAnimationFrame(loop);
        var dt = Math.min((now - last) / 1000, .05); last = now;
        if (dragging) vel *= Math.exp(-dt * 8);
        else { var idle = performance.now() - lastInteract > 2600; vel += ((idle && !reduce ? .32 * dir : 0) - vel) * (1 - Math.exp(-dt * (idle ? .7 : 2))); angle += vel * dt; }
        var s = sets[base]; if (!ready || !s) return;
        var pos = (((angle / TAU) * FRAMES) % FRAMES + FRAMES) % FRAMES, i0 = Math.floor(pos) % FRAMES, f = pos - Math.floor(pos), a = s.imgs[i0], b = s.imgs[(i0 + 1) % FRAMES];
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        if (a && b) { ctx.drawImage(a, 0, 0, W, H); if (f > .02) { ctx.globalAlpha = f; ctx.drawImage(b, 0, 0, W, H); ctx.globalAlpha = 1; } }
        else { var n = nearest(s, Math.round(pos) % FRAMES); if (n) { ctx.drawImage(n, 0, 0, W, H); a = n; } }
        if (!painted && a && W) { painted = true; box.classList.add("is-ready"); }
        var deg = Math.round(pos / FRAMES * 360) % 360;
        if (deg !== shown) { shown = deg; var front = deg > 270 || deg < 90; if (degEl) degEl.textContent = deg + "°"; if (faceEl) faceEl.textContent = front ? "Endroit · fourrure" : "Envers · jacquard"; box.setAttribute("aria-valuenow", deg); box.setAttribute("aria-valuetext", deg + " degrés, " + (front ? "endroit en fourrure" : "envers en jacquard")); }
      };
      var run = function () { cancelAnimationFrame(raf); if (on && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
      var io = new IntersectionObserver(function (en) { on = en[0].isIntersecting; run(); }); io.observe(box);
      document.addEventListener("visibilitychange", run);
      var ro = new ResizeObserver(size); ro.observe(box); size();
      fns.push(function () { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", run); });
    }
    /* Vues : 360° ou photos */
    var views = $$(".svf-pd-view", root), tabs = $$(".svf-pd-thumbs [data-to]", root);
    tabs.forEach(function (t) { t.addEventListener("click", function () { var k = t.dataset.to; views.forEach(function (v) { v.classList.toggle("is-on", v.dataset.view === k); }); tabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); }); }); });
    /* Ajout au panier : reste sur la fiche, met à jour le compteur de l'en-tête */
    var form = $(".svf-pd-form", root), add = $("[data-pd-add]", root), msg = $("[data-pd-msg]", root);
    if (form && add && window.fetch) {
      var label = add.innerHTML, rootUrl = (window.Shopify && Shopify.routes && Shopify.routes.root) || "/";
      form.addEventListener("submit", function (e) {
        e.preventDefault(); if (add.disabled) return;
        add.disabled = true; add.textContent = "Ajout…"; if (msg) msg.textContent = "";
        fetch(rootUrl + "cart/add.js", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || "Ajout impossible"); return j; }); })
          .then(function () { return fetch(rootUrl + "cart.js", { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); }); })
          .then(function (cart) {
            document.dispatchEvent(new CustomEvent("svf:cart", { detail: { count: cart.item_count } }));
            add.textContent = "Ajoutée au panier ✓"; root.classList.add("is-added");
            if (msg) msg.innerHTML = '<a href="' + rootUrl + 'cart">Voir le panier (' + cart.item_count + ') →</a>';
            setTimeout(function () { add.innerHTML = label; add.disabled = false; }, 2600);
          })
          .catch(function (err) { add.innerHTML = label; add.disabled = false; if (msg) msg.textContent = err.message; });
      });
    }
    /* Autres Signatures : survol = rotation, comme sur l'accueil */
    C.drop(root);
    return function () { fns.forEach(function (f) { f(); }); };
  };

  /* Shared per-root helpers */
  function placeMacros(root) {
    $$("[data-svf-macro]", root).forEach(function (el) {
      var W = el.clientWidth, H = el.clientHeight, z = +el.dataset.z || 3, IW = W * z, IH = IW * 1.5;
      el.style.backgroundSize = IW + "px " + IH + "px";
      el.style.backgroundPosition = (W / 2 - (+el.dataset.x) * IW) + "px " + (H / 2 - (+el.dataset.y) * IH) + "px";
    });
  }
  function fillGarments(root) {
    $$("[data-svf-svg]", root).forEach(function (el) { if (!el.firstChild && GARMENTS[el.dataset.svfSvg]) el.innerHTML = GARMENTS[el.dataset.svfSvg](); });
    $$("[data-svf-garment]", root).forEach(function (el) { if (!el.firstChild) el.innerHTML = garmentOf(el); });
  }

  /* Scroll motion, scoped to one section so the theme editor can revert it */
  function motion(root, type) {
    if (!hasG() || reduce) return null;
    var mm = gsap.matchMedia();
    var ctx = gsap.context(function () {
      $$(".svf-rv", root).forEach(function (el) { gsap.from(el, { y: 56, duration: 1.5, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }); });
      $$(".svf-plx", root).forEach(function (el) { gsap.fromTo(el, { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }); });
      $$("[data-speed]", root).forEach(function (el) { var s = parseFloat(el.dataset.speed); gsap.fromTo(el, { y: function () { return s * -70; } }, { y: function () { return s * 70; }, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } }); });
      if (type === "hero") {
        /* Valeurs de départ explicites : sinon GSAP lit la position pendant l'animation d'apparition */
        mm.add("(min-width: 861px)", function () {
          var st = { trigger: root, start: "top top", end: "bottom top", scrub: true };
          gsap.to($(".svf-ed-title", root), { yPercent: -40, ease: "none", scrollTrigger: st });
          gsap.fromTo($(".svf-ed-l .svf-ed-img", root), { y: 0 }, { y: -90, ease: "none", scrollTrigger: st });
          gsap.fromTo($(".svf-ed-r .svf-ed-img", root), { y: 0 }, { y: -170, ease: "none", scrollTrigger: st });
          gsap.fromTo($(".svf-ed-slides", root), { scale: 1 }, { scale: .94, ease: "none", scrollTrigger: st });
        });
      }
      if (type === "drop") $$(".svf-card", root).forEach(function (el, i) { gsap.from(el, { y: 70, duration: 1.4, ease: "expo.out", delay: i * .08, scrollTrigger: { trigger: root, start: "top 80%" } }); });
      if (type === "news") gsap.from($$(".svf-wm span", root), { yPercent: 105, duration: 1.4, ease: "expo.out", stagger: .035, scrollTrigger: { trigger: $(".svf-wm-wrap", root), start: "top 96%" } });
    }, root);
    if (type === "stage") mm.add("(min-width: 1000px)", function () {
      var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, start: "top top", end: "+=240%", pin: $(".svf-pin", root), scrub: 1, onUpdate: function (st) { root.svfScrollAngle = st.progress * TAU; } } });
      tl.fromTo($(".svf-tie", root), { scale: .78, y: 50 }, { scale: 1, y: 0, ease: "power2.out", duration: 1 })
        .fromTo($(".svf-ghost-word", root), { scale: .9 }, { scale: 1.08, duration: 3 }, 0)
        .from($$(".svf-tie .svf-co", root), { opacity: 0, y: 16, stagger: .7, duration: .4 }, .9)
        .from($$(".svf-tie .svf-co-line", root), { scaleX: 0, stagger: .7, duration: .4 }, .9)
        .to({}, { duration: .4 });
      return function () { root.svfScrollAngle = 0; };
    });
    return function () { ctx.revert(); mm.revert(); };
  }

  /* ---------- Init / teardown ---------- */
  var cleanups = new WeakMap();
  function initRoot(root) {
    var type = root.dataset.svf, fns = [];
    fillGarments(root); placeMacros(root);
    if (C[type]) { var c = C[type](root); if (c) fns.push(c); }
    var m = motion(root, type); if (m) fns.push(m);
    cleanups.set(root, fns);
  }
  function destroyRoot(root) { (cleanups.get(root) || []).forEach(function (f) { try { f(); } catch (e) {} }); cleanups.delete(root); }
  function initAll(scope) { $$("[data-svf]", scope).forEach(initRoot); if (hasG()) ScrollTrigger.refresh(); }

  function boot() {
    scroller = findScroller();
    if (hasG() && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      if (scroller) ScrollTrigger.defaults({ scroller: scroller, pinType: "fixed" });
      if (window.Lenis && !designMode) {
        if (scroller) scroller.style.scrollBehavior = "auto";
        lenis = scroller ? new Lenis({ wrapper: scroller, content: scroller, lerp: .085, smoothWheel: true }) : new Lenis({ lerp: .085, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      }
    }
    initAll(document);
    window.addEventListener("resize", function () { $$("[data-svf]").forEach(placeMacros); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (hasG()) ScrollTrigger.refresh(); });
    document.addEventListener("shopify:section:load", function (e) { initAll(e.target); });
    document.addEventListener("shopify:section:unload", function (e) { $$("[data-svf]", e.target).forEach(destroyRoot); });
  }
  window.SVF = { init: initAll };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
