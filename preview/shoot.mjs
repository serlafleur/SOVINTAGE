// Captures et contrôles mobiles de l'aperçu.
//   node shoot.mjs <page.html> <dossier> [largeur=390]
import { chromium } from "playwright-core";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const [, , file = "mobile.html", outDir = "shots", widthArg = "390"] = process.argv;
const width = +widthArg;
const root = path.resolve("dist");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".jpg": "image/jpeg" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "fr-FR" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
await page.goto(`http://localhost:${port}/${file}`, { waitUntil: "load" });
await page.waitForTimeout(2500);
fs.mkdirSync(outDir, { recursive: true });

const report = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const overflow = [...document.querySelectorAll("body *")].filter((el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 0 && (r.right > vw + 1 || r.left < -1) && cs.position !== "fixed" && !el.closest("[class*='rail'],.svf-ed-slides,.svf-v-stage,.svf-hd-menu,.svf-ghost,.svf-wm-wrap,.svf-ed-title");
  }).slice(0, 12).map((el) => el.tagName.toLowerCase() + "." + [...el.classList].join(".") + " → " + Math.round(el.getBoundingClientRect().right));
  const small = [...document.querySelectorAll("a[href],button,input,[role=slider],[tabindex='0']")].filter((el) => {
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && (r.width < 44 || r.height < 44) && !el.closest(".svf-hd-menu:not(.is-open)");
  }).map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24)}" ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`);
  const tiny = [...document.querySelectorAll("main *, header *")].filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 12 && el.getBoundingClientRect().width > 0).length;
  return { scrollWidth: document.documentElement.scrollWidth, vw, height: document.documentElement.scrollHeight, overflow, small: [...new Set(small)], tinyTextNodes: tiny };
});
console.log(JSON.stringify(report, null, 1));

// Une capture par section, à la hauteur de l'écran
const ids = await page.$$eval("main > .shopify-section, #header-group", (els) => els.map((e) => e.id));
await page.screenshot({ path: path.join(outDir, `00-top.png`) });
let i = 1;
for (const id of ids.filter((x) => x !== "header-group")) {
  await page.evaluate((id) => { const el = document.getElementById(id); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 0); }, id);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, `${String(i++).padStart(2, "0")}-${id.split("__").pop()}.png`) });
}
await page.screenshot({ path: path.join(outDir, "full.png"), fullPage: true });
if (errors.length) console.log("ERREURS:\n" + errors.join("\n"));
await browser.close(); server.close();
