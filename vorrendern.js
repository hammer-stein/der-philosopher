#!/usr/bin/env node
/*
  Der Philosopher – Seiten aus dem Register aufbauen

  Ein Aufruf erledigt alles, was aus register.js folgt:

  1. Titelseite: Das Skript in index.html wird einmal ohne Browser
     ausgeführt und sein Ergebnis fest in index.html geschrieben. So sehen
     Suchmaschinen, Linkvorschauen und Besucher ohne JavaScript dieselbe
     Titelseite wie alle anderen.
  2. Ressortseiten: Für jedes Ressort entsteht eine eigene Seite mit eigener
     Adresse (geschichte.html, politik.html, …), aufgebaut aus index.html.
     Ressorts ohne Dossier bekommen "noindex" und stehen nicht in der Sitemap.
  3. Kopfdaten: In Titelseite, Ressortseiten und Dossiers wird der Block
     zwischen <!-- seo --> und <!-- /seo --> neu geschrieben: canonical-Link,
     Vorschau für Messenger und soziale Netzwerke (Open Graph, Twitter) und
     strukturierte Daten für Google (JSON-LD). Seitentitel und Beschreibung
     der Dossiers bleiben unberührt und werden von dort übernommen.
  4. Dossiers: Zeile "Veröffentlicht am …" im Kopf (mit "Zuletzt
     aktualisiert am …", sobald im Register "aktualisiert" gesetzt ist) und
     am Ende die Kästen "Weiter in der Reihe", "So entstehen die Dossiers"
     und "Rückmeldung" (Block <!-- dossier-ende --> … <!-- /dossier-ende -->).
  5. ueber.html aus vorlagen/ueber.html, mit Rückmeldefeld am Ende.
  6. Die Regeln aus vorlagen/kaesten.css werden in philosopher.css und in
     die Dossiers übernommen.
  7. sitemap.xml wird neu geschrieben.

  Nach jeder Änderung an register.js, an einem Dossier-Titel oder am Skript
  in index.html im Ordner der Website ausführen:

      node vorrendern.js

  Beliebig oft ausführbar. Vorschaubilder erzeugt vorschaubilder.py.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ORDNER = __dirname;
const BASIS = "https://der-philosopher.de/";
const NAME = "Der Philosopher";
const MOTTO = "Geschichte, Politik und Wirtschaft verständlich erklärt";
const STARTTITEL = NAME + " – " + MOTTO;
const STARTBESCHREIBUNG = "Lern- und Überblicksdossiers zu Geschichte, Politik und Wirtschaft: gründlich recherchiert, verständlich erklärt, mit Zeitleisten, Glossar und Quellen.";
const MAIL = "der-philosopher@outlook.de";
const MONATE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const datumLang = (iso) => { const [j, m, t] = iso.split("-").map(Number); return t + ". " + MONATE[m - 1] + " " + j; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const AUF = "<!-- vorgerendert -->", ZU = "<!-- /vorgerendert -->";
const SEO_AUF = "<!-- seo -->", SEO_ZU = "<!-- /seo -->";

const lies = (d) => fs.readFileSync(path.join(ORDNER, d), "utf8");
const schreib = (d, s) => fs.writeFileSync(path.join(ORDNER, d), s);
const gibt = (d) => fs.existsSync(path.join(ORDNER, d));
const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const entschl = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// ---------- Register laden ----------
const registerQuelle = lies("register.js");
const R = (() => { const k = { window: {} }; vm.createContext(k); vm.runInContext(registerQuelle, k); return k.window.PHILOSOPHER; })();
const ressortVon = (id) => R.ressorts.find((r) => r.id === id) || { id, name: id, beschreibung: "" };
const reiheVon = (id) => R.reihen.find((r) => r.id === id);
const mitInhalt = (id) => R.artikel.filter((a) => a.ressort === id);

// ---------- Seitenskript ohne Browser ausführen ----------
let index = lies("index.html");
const skripte = [...index.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const seitenskript = skripte[skripte.length - 1][1];

function aufbauen(ansicht, statisch) {
  const el = {};
  const element = (id) => el[id] || (el[id] = { id, innerHTML: "", textContent: "", style: {},
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelectorAll() { return []; }, scrollIntoView() {} });
  const fenster = { location: { hash: "", replace() {} }, addEventListener() {}, scrollTo() {},
    matchMedia() { return { matches: false }; }, PH_ANSICHT: ansicht || undefined, PH_STATISCH: statisch || undefined };
  const k = { window: fenster, location: fenster.location,
    document: { getElementById: element, documentElement: element("__root"), title: "" },
    Date, Math, String, Number, Array, Object, isNaN, JSON };
  vm.createContext(k);
  vm.runInContext(registerQuelle, k, { filename: "register.js" });
  vm.runInContext(seitenskript, k, { filename: "index.html (Seitenskript)" });
  return el;
}

function einsetzen(html, id, inhalt) {
  const block = AUF + inhalt + ZU;
  const mitMarke = new RegExp('(id="' + id + '"[^>]*>)' + rx(AUF) + "[\\s\\S]*?" + rx(ZU));
  if (mitMarke.test(html)) return html.replace(mitMarke, (m, a) => a + block);
  const leer = new RegExp('(id="' + id + '"[^>]*>)(</(?:div|ul)>)');
  if (!leer.test(html)) throw new Error("Element #" + id + " nicht gefunden.");
  return html.replace(leer, (m, a, z) => a + block + z);
}

function fuellen(html, el, aktiv, eigenerInhalt) {
  if (eigenerInhalt !== undefined) el.ansicht = { innerHTML: eigenerInhalt };
  for (const id of ["earLeft", "earRight", "ressortNav", "ansicht", "footRessorts"]) {
    if (!el[id] || !el[id].innerHTML) throw new Error("Für #" + id + " wurde kein Inhalt erzeugt.");
    let inhalt = el[id].innerHTML;
    if (id === "ressortNav") inhalt = inhalt.replace('data-ziel="' + aktiv + '"', 'data-ziel="' + aktiv + '" aria-current="page"');
    html = einsetzen(html, id, inhalt);
  }
  if (el.copy && el.copy.textContent)
    html = html.replace(/(<div class="copy" id="copy">)[\s\S]*?(<\/div>)/, (m, a, b) => a + el.copy.textContent + b);
  return html;
}

// ---------- Kopfdaten ----------
const ORGANISATION = { "@type": "Organization", "@id": BASIS + "#organisation", name: NAME, url: BASIS,
  logo: { "@type": "ImageObject", url: BASIS + "bilder/logo.png", width: 512, height: 512 } };
const WEBSITE = { "@type": "WebSite", "@id": BASIS + "#website", url: BASIS, name: NAME, inLanguage: "de",
  description: "Lern- und Überblicksdossiers zu Geschichte, Politik und Wirtschaft.", publisher: { "@id": BASIS + "#organisation" } };

function jsonld(graph) {
  return '<script type="application/ld+json">' +
    JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 1).replace(/</g, "\\u003c") + "</script>";
}
function bildVon(datei) {
  const eigenes = "bilder/" + path.basename(datei, ".html") + ".png";
  return BASIS + (gibt(eigenes) ? eigenes : "bilder/der-philosopher.png");
}
function seoBlock(o) {
  const z = [SEO_AUF];
  if (o.titel) z.push("<title>" + attr(o.titel) + "</title>");
  if (o.beschreibung) z.push('<meta name="description" content="' + attr(o.beschreibung) + '">');
  if (o.noindex) z.push('<meta name="robots" content="noindex">');
  z.push('<link rel="canonical" href="' + o.url + '">');
  z.push('<meta property="og:site_name" content="' + NAME + '">');
  z.push('<meta property="og:locale" content="de_DE">');
  z.push('<meta property="og:type" content="' + (o.artikel ? "article" : "website") + '">');
  z.push('<meta property="og:title" content="' + attr(o.ogTitel) + '">');
  z.push('<meta property="og:description" content="' + attr(o.ogText) + '">');
  z.push('<meta property="og:url" content="' + o.url + '">');
  z.push('<meta property="og:image" content="' + o.bild + '">');
  z.push('<meta property="og:image:width" content="1200">');
  z.push('<meta property="og:image:height" content="630">');
  z.push('<meta property="og:image:alt" content="' + attr(o.bildAlt) + '">');
  if (o.artikel) {
    z.push('<meta property="article:published_time" content="' + o.artikel.veroeffentlicht + '">');
    z.push('<meta property="article:section" content="' + attr(ressortVon(o.artikel.ressort).name) + '">');
  }
  z.push('<meta name="twitter:card" content="summary_large_image">');
  if (o.ansicht) z.push("<script>window.PH_ANSICHT = " + JSON.stringify(o.ansicht) + ";</script>");
  if (o.statisch) z.push("<script>window.PH_STATISCH = true;</script>");
  z.push(jsonld(o.graph));
  z.push(SEO_ZU);
  return z.join("\n");
}
function seoSetzen(html, block, ersetzeVon) {
  const alt = new RegExp(rx(SEO_AUF) + "[\\s\\S]*?" + rx(SEO_ZU));
  if (alt.test(html)) return html.replace(alt, () => block);
  if (!ersetzeVon.test(html)) throw new Error("Stelle für den Kopfdaten-Block nicht gefunden.");
  return html.replace(ersetzeVon, () => block + "\n");
}
// ---------- Bausteine: Kästen am Ende, Rückmeldefeld ----------
const KAESTEN_CSS = lies("vorlagen/kaesten.css").trim();
const RUECKMELDE_SKRIPT = "<script>(function(){document.querySelectorAll('form.ph-feedback').forEach(function(f){" +
  "f.addEventListener('submit',function(e){e.preventDefault();var t=f.querySelector('textarea');var text=t.value.trim();" +
  "if(!text){t.focus();return;}location.href='mailto:" + MAIL + "?subject='+encodeURIComponent(f.getAttribute('data-betreff'))" +
  "+'&body='+encodeURIComponent(text);});});})();</script>";
function rueckmeldung(o) {
  return '<form class="ph-kasten ph-feedback" action="mailto:' + MAIL + '" method="post" enctype="text/plain" data-betreff="' + attr(o.betreff) + '">' +
    '<span class="ph-etikett">' + esc(o.etikett) + "</span><h2>" + esc(o.titel) + "</h2><p>" + esc(o.text) + "</p>" +
    '<label for="' + o.id + '">Ihre Nachricht</label><textarea id="' + o.id + '" name="Nachricht" required></textarea>' +
    '<button type="submit">Per E-Mail senden</button>' +
    '<p class="ph-hinweis">Der Klick öffnet Ihr E-Mail-Programm mit der fertigen Nachricht an <a href="mailto:' + MAIL + '">' + MAIL +
    "</a>. Über diese Seite selbst wird nichts gespeichert oder übertragen.</p></form>";
}
function weiterKasten(a) {
  const re = a.reihe && reiheVon(a.reihe);
  if (!re || !a.teil) return "";
  const n = R.artikel.find((x) => x.reihe === a.reihe && x.teil === a.teil + 1);
  if (n) return '<a class="ph-kasten ph-weiter" href="' + attr(n.datei) + '"><span class="ph-etikett">Weiter in der Reihe · Teil ' + n.teil +
    "</span><h2>" + esc(n.titel) + "</h2><p>" + esc(n.teaser) + '</p><span class="ph-mehr">Teil ' + n.teil + " lesen · " + n.von + "–" + n.bis + "</span></a>";
  if (a.bis < (re.ende || new Date().getFullYear())) return '<div class="ph-kasten ph-weiter ph-offen"><span class="ph-etikett">Weiter in der Reihe · Teil ' +
    (a.teil + 1) + "</span><h2>Die Fortsetzung ab " + (a.bis + 1) + " ist in Vorbereitung</h2><p>" + esc(re.name) + "</p></div>";
  return "";
}
function dossierEnde(a) {
  return "<!-- dossier-ende -->\n<style>\n" + KAESTEN_CSS + "\n</style>\n" +
    '<div class="ph-ende" role="complementary" aria-label="Zum Schluss">' + weiterKasten(a) +
    '<a class="ph-kasten" href="ueber.html#redaktion"><span class="ph-etikett">Redaktionelle Hintergründe</span>' +
    "<h2>So entstehen die Dossiers</h2><p>Wie die Dossiers recherchiert, geschrieben und geprüft werden – und wer dafür die Verantwortung trägt.</p>" +
    '<span class="ph-mehr">Mehr erfahren</span></a>' +
    rueckmeldung({ id: "ph-nachricht", etikett: "Rückmeldung", titel: "Fehler entdeckt oder eine Anregung?",
      text: "Schreiben Sie uns direkt zu diesem Dossier.", betreff: "Rückmeldung zu: " + a.titel }) +
    "</div>\n" + RUECKMELDE_SKRIPT + "\n<!-- /dossier-ende -->";
}
function pubZeile(a) {
  let z = 'Veröffentlicht am <time datetime="' + a.veroeffentlicht + '">' + datumLang(a.veroeffentlicht) + "</time>";
  if (a.aktualisiert && a.aktualisiert !== a.veroeffentlicht)
    z += ' · Zuletzt aktualisiert am <time datetime="' + a.aktualisiert + '">' + datumLang(a.aktualisiert) + "</time>";
  return '<p class="pub">' + z + "</p>";
}

const krumen = (url, stufen) => ({ "@type": "BreadcrumbList", "@id": url + "#brotkrumen",
  itemListElement: stufen.map((s, i) => Object.assign({ "@type": "ListItem", position: i + 1, name: s[0] }, s[1] ? { item: s[1] } : {})) });

// ---------- 1. Titelseite ----------
index = fuellen(index, aufbauen(""), "start");
index = seoSetzen(index, seoBlock({
  titel: STARTTITEL, beschreibung: STARTBESCHREIBUNG, url: BASIS,
  ogTitel: NAME, ogText: "Lern- und Überblicksdossiers zu Geschichte, Politik und Wirtschaft: gründlich recherchiert, verständlich erklärt.",
  bild: BASIS + "bilder/der-philosopher.png", bildAlt: NAME + " – " + MOTTO,
  graph: [WEBSITE, ORGANISATION],
}), /<title>[\s\S]*?<meta property="og:locale"[^>]*>\n/);
schreib("index.html", index);

// ---------- 2. Ressortseiten ----------
const ressortSeiten = [];
for (const r of R.ressorts) {
  const datei = r.id + ".html", url = BASIS + datei, liste = mitInhalt(r.id);
  let html = fuellen(index, aufbauen(r.id), r.id);
  html = seoSetzen(html, seoBlock({
    titel: r.name + " – " + NAME, beschreibung: r.beschreibung, url, noindex: !liste.length,
    ogTitel: r.name + " – " + NAME, ogText: r.beschreibung,
    bild: BASIS + "bilder/der-philosopher.png", bildAlt: "Der Philosopher – Ressort " + r.name, ansicht: r.id,
    graph: [
      { "@type": "CollectionPage", "@id": url, url, name: r.name + " – " + NAME, description: r.beschreibung, inLanguage: "de",
        isPartOf: { "@id": BASIS + "#website" }, breadcrumb: { "@id": url + "#brotkrumen" },
        mainEntity: { "@type": "ItemList", itemListElement: liste.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: BASIS + a.datei })) } },
      krumen(url, [[NAME, BASIS], [r.name]]),
      WEBSITE, ORGANISATION,
    ],
  }), /^$/);
  schreib(datei, html);
  if (liste.length) ressortSeiten.push(r);
}

// ---------- 3. Dossiers ----------
for (const a of R.artikel) {
  if (!gibt(a.datei)) { console.warn("Fehlt: " + a.datei); continue; }
  let html = lies(a.datei);
  const url = BASIS + a.datei, r = ressortVon(a.ressort), re = a.reihe && reiheVon(a.reihe);
  const titel = entschl((html.match(/<title>([^<]*)<\/title>/) || [])[1] || a.titel);
  const beschreibung = entschl((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || a.teaser);
  const artikel = {
    "@type": "Article", "@id": url + "#artikel", url, mainEntityOfPage: url,
    headline: titel, alternativeHeadline: a.titel, description: beschreibung,
    image: [bildVon(a.datei)], datePublished: a.veroeffentlicht, dateModified: a.aktualisiert || a.veroeffentlicht,
    inLanguage: "de", articleSection: r.name, isAccessibleForFree: true,
    temporalCoverage: a.von + "/" + a.bis,
    author: { "@type": "Organization", name: NAME, url: BASIS },
    publisher: ORGANISATION, breadcrumb: { "@id": url + "#brotkrumen" },
  };
  if (re) { artikel.isPartOf = { "@type": "CreativeWorkSeries", name: re.name }; artikel.position = a.teil; }
  html = seoSetzen(html, seoBlock({
    url, artikel: a, ogTitel: titel, ogText: a.teaser,
    bild: bildVon(a.datei), bildAlt: NAME + ": " + a.titel + " (" + a.von + "–" + a.bis + ")",
    graph: [artikel, krumen(url, [[NAME, BASIS], [r.name, BASIS + r.id + ".html"], [a.titel]])],
  }), /<link rel="canonical"[^>]*>\n/);
  // Datumszeile im Kopf
  if (!/<p class="pub">[\s\S]*?<\/p>/.test(html)) throw new Error("Datumszeile fehlt in " + a.datei);
  html = html.replace(/<p class="pub">[\s\S]*?<\/p>/, () => pubZeile(a));
  // Kästen am Ende
  const ende = new RegExp(rx("<!-- dossier-ende -->") + "[\\s\\S]*?" + rx("<!-- /dossier-ende -->"));
  if (ende.test(html)) html = html.replace(ende, () => dossierEnde(a));
  else {
    const pos = html.lastIndexOf("</main>");
    if (pos < 0) throw new Error("</main> fehlt in " + a.datei);
    html = html.slice(0, pos) + dossierEnde(a) + "\n" + html.slice(pos);
  }
  // Leiste im Dossier: Ressort-Link auf die eigene Ressortseite
  html = html.replace(/href="index\.html#([a-z]+)"/g, (m, id) => R.ressorts.some((x) => x.id === id) ? 'href="' + id + '.html"' : m);
  schreib(a.datei, html);
}

// ---------- 5. Über-Seite ----------
const ueberVorlage = lies("vorlagen/ueber.html");
const ueberStand = (ueberVorlage.match(/stand:\s*(\d{4}-\d\d-\d\d)/) || [])[1];
const ueberInhalt = ueberVorlage.replace(/^<!--[\s\S]*?-->\s*/, "").trim().replace("<!-- rueckmeldung -->",
  '<section class="ph-ende ph-ende-voll" id="rueckmeldung" aria-label="Rückmeldung">' +
  rueckmeldung({ id: "ph-nachricht", etikett: "Rückmeldung", titel: "Rückmeldung und Themenvorschläge",
    text: "Welches Thema sollte der Philosopher als Nächstes erklären? Haben Sie einen Fehler entdeckt, eine Frage oder eine Anregung? Schreiben Sie uns.",
    betreff: "Rückmeldung oder Themenvorschlag" }) + "</section>" + RUECKMELDE_SKRIPT);
{
  const url = BASIS + "ueber.html";
  const beschr = "Was der Philosopher ist, wie die Dossiers entstehen und geprüft werden und wer dahinter steht – mit Rückmeldung und Themenvorschlägen.";
  let html = fuellen(index, aufbauen("ueber", true), "", ueberInhalt);
  html = seoSetzen(html, seoBlock({
    titel: "Über den Philosopher – Redaktion und Herausgeber", beschreibung: beschr, url, statisch: true,
    ogTitel: "Über den Philosopher", ogText: beschr,
    bild: BASIS + "bilder/der-philosopher.png", bildAlt: NAME + " – " + MOTTO,
    graph: [
      { "@type": "AboutPage", "@id": url, url, name: "Über den Philosopher", description: beschr, inLanguage: "de",
        isPartOf: { "@id": BASIS + "#website" }, about: { "@id": BASIS + "#organisation" }, breadcrumb: { "@id": url + "#brotkrumen" } },
      krumen(url, [[NAME, BASIS], ["Über den Philosopher"]]), WEBSITE, ORGANISATION,
    ],
  }), /^$/);
  schreib("ueber.html", html);
}

// ---------- 6. Gemeinsame Regeln in philosopher.css ----------
{
  let css = lies("philosopher.css");
  const block = "/* kaesten */\n" + KAESTEN_CSS + "\n/* /kaesten */";
  if (css.includes("@@PHENDECSS@@")) css = css.replace("@@PHENDECSS@@", () => block);
  else css = css.replace(/\/\* kaesten \*\/[\s\S]*?\/\* \/kaesten \*\//, () => block);
  schreib("philosopher.css", css);
}

// ---------- 7. Sitemap ----------
const neuestes = R.artikel.map((a) => a.aktualisiert || a.veroeffentlicht).sort().pop();
const eintraege = [[BASIS, neuestes]]
  .concat(ueberStand ? [[BASIS + "ueber.html", ueberStand]] : [])
  .concat(ressortSeiten.map((r) => [BASIS + r.id + ".html", mitInhalt(r.id).map((a) => a.aktualisiert || a.veroeffentlicht).sort().pop()]))
  .concat(R.artikel.slice().sort((x, y) => x.datei < y.datei ? -1 : 1).map((a) => [BASIS + a.datei, a.aktualisiert || a.veroeffentlicht]));
schreib("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  eintraege.map(([u, d]) => "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + d + "</lastmod>\n  </url>\n").join("") + "</urlset>\n");

console.log("Fertig: Titelseite, " + R.ressorts.length + " Ressortseiten (" + ressortSeiten.length +
  " mit Dossiers), " + R.artikel.length + " Dossiers, ueber.html, sitemap.xml mit " + eintraege.length + " Adressen.");
