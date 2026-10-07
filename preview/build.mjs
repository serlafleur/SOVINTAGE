// Aperçu local de l'accueil SOVINTAGEFRIP : rend les vraies sections Liquid du thème (../theme)
// avec les réglages de templates/index.json et sections/header-group.json, sans Shopify.
// Les filtres et objets Shopify utilisés par les sections svf-* sont simulés ci-dessous.
//
//   node build.mjs            → dist/mobile.html (avec la couche mobile) et dist/avant.html (thème actuel)
import { Liquid, Tag } from "liquidjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.join(here, "..", "theme");
const DIST = path.join(here, "dist");

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""));

/* ---------- Médias : photos disponibles localement, rendus 360° renommés comme dans Contenu > Fichiers ---------- */
const PHOTOS = Object.fromEntries(
  fs.readdirSync(path.join(here, "media/photos")).map((f) => [f, { src: `media/photos/${f}`, width: 1200, height: 1800 }])
);
const DIR = { ombre: "noir", brume: "gris", sable: "blond", neige: "blanc" };
// Les sections pointent vers shopify://shop_images/<fichier>. Absent de l'aperçu → null : la section retombe sur son visuel de cravate.
function shopImage(ref) {
  if (typeof ref !== "string" || !ref.startsWith("shopify://shop_images/")) return ref;
  const name = ref.split("/").pop();
  const p = PHOTOS[name];
  return p ? { ...p, alt: ALT[name] || "", toString: () => p.src } : null;
}
const ALT = {
  "IMG_2401.jpg": "Gros plan : Cravate Signature Ombre sur chemise blanche, gants en cuir noir",
  "IMG_2407.jpg": "Gros plan : Cravate Signature Sable sur veste en tweed, bagues dorées",
  "IMG_2421.jpg": "Look Florian : blazer bordeaux, manteau en fausse fourrure, Cravate Signature Ombre",
  "IMG_2430.jpg": "Look Oscar : manteau en fausse fourrure marron, croisé gris, Cravate Signature Brume",
  "IMG_2415.jpg": "Veste brodée aux manches en fourrure blanche, Cravate Signature Neige",
  "IMG_2394.jpg": "Look Aori : veste et jupe en tweed, collants rouges",
  "IMG_2467.jpg": "Look Zeina : veste d’hiver brune aspect cuir, jupe à ourlet en fourrure",
  "IMG_2400.jpg": "Look Jules : blazer à revers en fourrure, Cravate Signature Ombre, pantalon blanc",
};

/* ---------- Produits : données lues dans la boutique (4 Cravates Signatures, 40,00 €) ---------- */
const PRODUCTS = Object.fromEntries(
  ["ombre", "brume", "sable", "neige"].map((k) => [
    `cravate-signature-${k}`,
    { handle: `cravate-signature-${k}`, url: `#produit-${k}`, price: 4000, available: true, title: `Cravate Signature ${k[0].toUpperCase() + k.slice(1)}` },
  ])
);

function hydrateSettings(settings = {}) {
  const out = {};
  for (const [k, v] of Object.entries(settings)) {
    if (typeof v === "string" && v.startsWith("shopify://shop_images/")) out[k] = shopImage(v);
    else if (k === "product") out[k] = PRODUCTS[v] || null;
    else out[k] = v;
  }
  return out;
}
function sectionObject(id, data) {
  const blocks = (data.block_order || []).map((bid) => ({
    id: bid,
    type: data.blocks[bid].type,
    settings: hydrateSettings(data.blocks[bid].settings),
    shopify_attributes: "",
  }));
  return { id: `template--index__${id}`, settings: hydrateSettings(data.settings), blocks };
}

/* ---------- Moteur Liquid ---------- */
const engine = new Liquid({ root: [path.join(THEME, "snippets")], extname: ".liquid", strictFilters: true, jsTruthy: false });

class SchemaTag extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    while (remain.length) { const t = remain.shift(); if (t.name === "endschema") return; }
  }
  *render() {}
}
engine.registerTag("schema", SchemaTag);

class FormTag extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    this.args = token.args;
    this.tpls = [];
    const stream = liquid.parser.parseStream(remain).on("tag:endform", () => stream.stop()).on("template", (t) => this.tpls.push(t)).on("end", () => { throw new Error("form non fermé"); });
    stream.start();
  }
  *render(ctx, emitter) {
    const id = (this.args.match(/id:\s*'([^']+)'/) || [])[1] || "";
    emitter.write(`<form method="post" action="#" id="${id}" accept-charset="UTF-8" class="shopify-form"><input type="hidden" name="form_type" value="customer">`);
    ctx.push({ form: { posted_successfully: false, errors: null } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
    emitter.write("</form>");
  }
}
engine.registerTag("form", FormTag);

// {% stylesheet %} des sections : Shopify le regroupe dans une feuille ; ici, une balise <style> à la place
class StylesheetTag extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    this.tpls = [];
    const stream = liquid.parser.parseStream(remain).on("tag:endstylesheet", () => stream.stop()).on("template", (t) => this.tpls.push(t)).on("end", () => { throw new Error("stylesheet non fermé"); });
    stream.start();
  }
  *render(ctx, emitter) { emitter.write("<style>"); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); emitter.write("</style>"); }
}
engine.registerTag("stylesheet", StylesheetTag);

const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
engine.registerFilter("image_url", (img) => (img && img.src) || "");
engine.registerFilter("image_tag", (url, ...args) => {
  const o = kw(args);
  const attrs = { src: url, alt: o.alt ?? "", width: 1200, height: 1800, loading: o.loading, fetchpriority: o.fetchpriority, sizes: o.sizes, class: o.class };
  return "<img " + Object.entries(attrs).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}="${esc(v)}"`).join(" ") + ">";
});
engine.registerFilter("file_url", (name) => {
  const m = String(name).match(/^svf-(\w+)-(\d{4})\.webp$/);
  return m ? `media/renders/${DIR[m[1]]}/f_${m[2]}.webp` : `media/${name}`;
});
engine.registerFilter("asset_url", (name) => `assets/${name}`);
engine.registerFilter("stylesheet_tag", (url) => `<link rel="stylesheet" href="${url}">`);
engine.registerFilter("money", (cents) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100));
engine.registerFilter("placeholder_svg_tag", (_, cls) => `<svg class="${cls || ""}" viewBox="0 0 400 600" aria-hidden="true"><rect width="400" height="600" fill="#cfcdd0"/></svg>`);

const globals = {
  template: { name: "index", suffix: null },
  routes: { root_url: "/", cart_url: "#panier" },
  request: { path: "/", design_mode: false },
  shop: { name: "SOVINTAGE" },
  cart: { item_count: 0, currency: { symbol: "€" } },
  localization: { language: { iso_code: "fr" } },
};

async function renderSection(type, id, data, g = globals, tag = "div") {
  const src = fs.readFileSync(path.join(THEME, "sections", `${type}.liquid`), "utf8");
  const schema = JSON.parse((src.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/) || [, "{}"])[1]);
  const html = await engine.parseAndRender(src, { ...g, section: sectionObject(id, data) });
  return `<${schema.tag || tag} id="shopify-section-template--index__${id}" class="shopify-section ${schema.class || ""}">${html}</${schema.tag || tag}>`;
}

/* ---------- Pages ---------- */
const index = readJson(path.join(THEME, "templates/index.json"));
const mission = readJson(path.join(THEME, "templates/page.mission.json"));
const headerGroup = readJson(path.join(THEME, "sections/header-group.json"));

// Menu essentiel (à reproduire dans l'éditeur de thème, voir README) : Le drop · La collection · Notre mission · Contact.
// La Signature, Matières et Sur mesure restent accessibles depuis l'accueil ; le panier reste en icône dans la barre.
function essentialMenu() {
  const h = structuredClone(headerGroup.sections.svf_header);
  h.blocks.l_mission = { type: "link", settings: { label: "Notre mission", label_menu: "Notre <em>mission</em>", link: "/pages/notre-mission", in_bar: true } };
  h.block_order = ["l_drop", "l_coll", "l_mission", "l_contact"];
  return h;
}
// Les liens Shopify pointent vers les fichiers de l'aperçu
const relink = (html) => html
  .replace(/href="\/pages\/notre-mission"/g, 'href="mission.html"')
  .replace(/href="\/#/g, 'href="mobile.html#')
  .replace(/href="\/"/g, 'href="mobile.html"');

async function page({ mobile, template = index, tpl = { name: "index", suffix: null }, label }) {
  const g = { ...globals, template: tpl, request: { path: tpl.name === "index" ? "/" : "/pages/notre-mission", design_mode: false } };
  const head = tpl.name === "index" ? await engine.parseAndRender(fs.readFileSync(path.join(THEME, "snippets/svf-head.liquid"), "utf8"), g) : "";
  let header = await renderSection("svf-header", "svf_header", mobile ? essentialMenu() : headerGroup.sections.svf_header, g);
  // « Avant » : le thème tel qu'il est en ligne, sans les deux lignes qui chargent la couche mobile
  if (!mobile) header = header.replace(/<link[^>]*svf-mobile\.css[^>]*>|<script[^>]*svf-mobile\.js[^>]*><\/script>/g, "");
  const sections = [];
  for (const id of template.order) {
    const s = template.sections[id];
    if (s.disabled) continue;
    sections.push(await renderSection(s.type, id, s, g));
  }
  return relink(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0B1A10">
<title>SOVINTAGEFRIP — ${label}</title>
<style>
  /* Socle minimal à la place d'Horizon (le thème réel fournit ces styles) */
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  body{margin:0;background:#0B1A10;color:#DCE8DF;font-family:"Archivo","Helvetica Neue",Helvetica,Arial,sans-serif}
  .shopify-section{display:block}
  .pv-foot{padding:28px 20px calc(env(safe-area-inset-bottom,0px) + 28px);background:#0B1A10;color:#8AA593;font:12px/1.5 "IBM Plex Mono",ui-monospace,monospace;border-top:1px solid #1E3527}
</style>
${head}
</head>
<body>
<div id="header-group">${header}</div>
<main id="MainContent" class="content-for-layout" role="main">
${sections.join("\n")}
</main>
<footer class="pv-foot"><p>Pied de page Horizon (non simulé dans l’aperçu) · © 2026 Sovintagefrip</p></footer>
</body>
</html>`);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });
for (const f of fs.readdirSync(path.join(THEME, "assets"))) fs.copyFileSync(path.join(THEME, "assets", f), path.join(DIST, "assets", f));
fs.cpSync(path.join(here, "media"), path.join(DIST, "media"), { recursive: true });
if (fs.existsSync(path.join(here, "showcase.html"))) fs.copyFileSync(path.join(here, "showcase.html"), path.join(DIST, "index.html"));
fs.writeFileSync(path.join(DIST, "mobile.html"), await page({ mobile: true, label: "maquette mobile" }));
fs.writeFileSync(path.join(DIST, "avant.html"), await page({ mobile: false, label: "thème actuel" }));
fs.writeFileSync(path.join(DIST, "mission.html"), await page({ mobile: true, template: mission, tpl: { name: "page", suffix: "mission" }, label: "Notre mission" }));
console.log("dist/ prêt :", fs.readdirSync(DIST).join(", "));
