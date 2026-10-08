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
  4. sitemap.xml wird neu geschrieben.

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
const STARTTITEL = "Der Philosopher";
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

function aufbauen(ansicht) {
  const el = {};
  const element = (id) => el[id] || (el[id] = { id, innerHTML: "", textContent: "", style: {},
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelectorAll() { return []; }, scrollIntoView() {} });
  const fenster = { location: { hash: "", replace() {} }, addEventListener() {}, scrollTo() {},
    matchMedia() { return { matches: false }; }, PH_ANSICHT: ansicht || undefined };
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

function fuellen(html, el, aktiv) {
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
const krumen = (url, stufen) => ({ "@type": "BreadcrumbList", "@id": url + "#brotkrumen",
  itemListElement: stufen.map((s, i) => Object.assign({ "@type": "ListItem", position: i + 1, name: s[0] }, s[1] ? { item: s[1] } : {})) });

// ---------- 1. Titelseite ----------
const startBeschreibung = entschl((index.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
index = fuellen(index, aufbauen(""), "start");
index = seoSetzen(index, seoBlock({
  titel: STARTTITEL, beschreibung: startBeschreibung, url: BASIS,
  ogTitel: NAME, ogText: "Lern- und Überblicksdossiers zu Geschichte, Politik und Wirtschaft: gründlich recherchiert, verständlich erklärt.",
  bild: BASIS + "bilder/der-philosopher.png", bildAlt: "Der Philosopher – Hintergrund und Zusammenhang",
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
    image: [bildVon(a.datei)], datePublished: a.veroeffentlicht, dateModified: a.geaendert || a.veroeffentlicht,
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
  // Leiste im Dossier: Ressort-Link auf die eigene Ressortseite
  html = html.replace(/href="index\.html#([a-z]+)"/g, (m, id) => R.ressorts.some((x) => x.id === id) ? 'href="' + id + '.html"' : m);
  schreib(a.datei, html);
}

// ---------- 4. Sitemap ----------
const neuestes = R.artikel.map((a) => a.geaendert || a.veroeffentlicht).sort().pop();
const eintraege = [[BASIS, neuestes]]
  .concat(ressortSeiten.map((r) => [BASIS + r.id + ".html", mitInhalt(r.id).map((a) => a.geaendert || a.veroeffentlicht).sort().pop()]))
  .concat(R.artikel.slice().sort((x, y) => x.datei < y.datei ? -1 : 1).map((a) => [BASIS + a.datei, a.geaendert || a.veroeffentlicht]));
schreib("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  eintraege.map(([u, d]) => "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + d + "</lastmod>\n  </url>\n").join("") + "</urlset>\n");

console.log("Fertig: Titelseite, " + R.ressorts.length + " Ressortseiten (" + ressortSeiten.length +
  " mit Dossiers), " + R.artikel.length + " Dossiers, sitemap.xml mit " + eintraege.length + " Adressen.");
