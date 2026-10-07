#!/usr/bin/env node
/*
  Der Philosopher – Titelseite vorrendern

  Die Titelseite wird im Browser per JavaScript aus register.js aufgebaut.
  Suchmaschinen wie Bing, Linkvorschauen in Messengern und Besucher ohne
  JavaScript sehen davon nichts. Dieses Skript führt dasselbe Skript aus
  index.html einmal ohne Browser aus und schreibt das Ergebnis fest in
  index.html. Im Browser läuft das Skript danach wie gewohnt und ersetzt
  den Inhalt durch denselben Inhalt; sichtbar ändert sich nichts.

  Nach jeder Änderung an register.js oder am Skript in index.html
  im Ordner der Website ausführen:

      node vorrendern.js

  Das Skript ist beliebig oft ausführbar und ändert nur die Stellen
  zwischen den Markierungen <!-- vorgerendert --> … <!-- /vorgerendert -->.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ORDNER = __dirname;
const INDEX = path.join(ORDNER, "index.html");
const AUF = "<!-- vorgerendert -->", ZU = "<!-- /vorgerendert -->";

let html = fs.readFileSync(INDEX, "utf8");
const register = fs.readFileSync(path.join(ORDNER, "register.js"), "utf8");

// Das Seitenskript ist der letzte <script>-Block ohne src.
const skripte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (!skripte.length) throw new Error("Kein Seitenskript in index.html gefunden.");
const seitenskript = skripte[skripte.length - 1][1];

// ---------- Minimaler Browser-Ersatz ----------
const elemente = {};
function element(id) {
  if (!elemente[id]) elemente[id] = {
    id, innerHTML: "", textContent: "", style: {},
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelectorAll() { return []; }, scrollIntoView() {},
  };
  return elemente[id];
}
const fenster = {
  location: { hash: "" },
  addEventListener() {},
  scrollTo() {},
  matchMedia() { return { matches: false }; },
};
const kontext = {
  window: fenster,
  document: {
    getElementById: element,
    documentElement: element("__root"),
    title: "",
  },
  location: fenster.location,
  Date, Math, String, Number, Array, Object, isNaN, JSON,
};
fenster.document = kontext.document;
vm.createContext(kontext);
vm.runInContext(register, kontext, { filename: "register.js" });
kontext.PHILOSOPHER = fenster.PHILOSOPHER = kontext.window.PHILOSOPHER;
vm.runInContext(seitenskript, kontext, { filename: "index.html (Seitenskript)" });

// ---------- Ergebnis in index.html schreiben ----------
function einsetzen(id, inhalt) {
  const block = AUF + inhalt + ZU;
  // Schon vorgerendert: nur den markierten Teil ersetzen.
  const mitMarke = new RegExp('(id="' + id + '"[^>]*>)' + AUF.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
    "[\\s\\S]*?" + ZU.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (mitMarke.test(html)) { html = html.replace(mitMarke, (m, start) => start + block); return; }
  // Erstes Mal: leeres Element füllen.
  const leer = new RegExp('(id="' + id + '"[^>]*>)(</(?:div|ul)>)');
  if (!leer.test(html)) throw new Error('Element #' + id + ' nicht gefunden oder nicht leer.');
  html = html.replace(leer, (m, start, ende) => start + block + ende);
}

const ziele = ["earLeft", "earRight", "ressortNav", "ansicht", "footRessorts"];
for (const id of ziele) {
  const inhalt = elemente[id] && elemente[id].innerHTML;
  if (!inhalt) throw new Error("Für #" + id + " wurde kein Inhalt erzeugt.");
  einsetzen(id, inhalt);
}
// Die Fußzeile mit Jahr wird über textContent gesetzt.
if (elemente.copy && elemente.copy.textContent) {
  html = html.replace(/(<div class="copy" id="copy">)[\s\S]*?(<\/div>)/, (m, a, b) => a + elemente.copy.textContent + b);
}

fs.writeFileSync(INDEX, html);
const anzahl = (kontext.window.PHILOSOPHER.artikel || []).length;
console.log("index.html vorgerendert: " + anzahl + " Dossiers auf der Titelseite.");
