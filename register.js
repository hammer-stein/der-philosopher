/* =====================================================================
   DER PHILOSOPHER – Beitragsregister
   ---------------------------------------------------------------------
   Diese Datei ist die einzige Stelle, die beim Hinzufügen eines neuen
   Dossiers geändert werden muss. Die Titelseite, die Ressortseiten
   und das Archiv werden daraus automatisch aufgebaut.

   Neues Dossier hinzufügen:
   1. HTML-Datei in denselben Ordner wie index.html legen.
   2. Unten im Abschnitt "artikel" einen Eintrag ergänzen
      (am einfachsten einen vorhandenen kopieren und anpassen).
   3. Soll es der neue Aufmacher sein: bei ihm  aufmacher: true  setzen
      und beim bisherigen Aufmacher entfernen. Ohne Angabe wird das
      zuletzt veröffentlichte Dossier zum Aufmacher.

   Felder eines Eintrags:
     datei          Dateiname der HTML-Datei (ohne Ordner)
     ressort        id aus der Liste "ressorts"
     reihe          (optional) id aus der Liste "reihen"
     teil           (optional) Nummer innerhalb der Reihe
     dachzeile      Kicker über dem Titel, wie im Dossier
     titel          Überschrift, wie im Dossier
     teaser         ein bis zwei Sätze (der Untertitel des Dossiers)
     von, bis       behandelter Zeitraum (Jahreszahlen)
     kapitel        Anzahl der Kapitel
     veroeffentlicht  Datum JJJJ-MM-TT (bestimmt die Reihenfolge)
     stand          Stand der Informationen, z. B. "Oktober 2026"
     inhalt         Hauptkapitel als [Nummer, Anker-id, Titel];
                    die Anker-id führt direkt zum Kapitel im Dossier
   ===================================================================== */
window.PHILOSOPHER = {

  ressorts: [
    { id: "geschichte",   name: "Geschichte",
      beschreibung: "Die großen Epochen der deutschen und europäischen Geschichte seit 1453 – mit ihren Ursachen, Wendepunkten und Folgen." },
    { id: "politik",      name: "Politik",
      beschreibung: "Zeitgeschichte und politische Entwicklungen der Gegenwart, aus Quellen erarbeitet und in ihren Zusammenhang gestellt." },
    { id: "wirtschaft",   name: "Wirtschaft",
      beschreibung: "Wie Geld, Zinsen, Märkte und Staatsfinanzen funktionieren – erklärt an Grundlagen, historischen Lehrstücken und der aktuellen Lage." },
    { id: "philosophie",  name: "Philosophie",
      beschreibung: "Denker, Schulen und Grundfragen der Philosophie und ihr Einfluss auf Politik und Gesellschaft." },
    { id: "wissenschaft", name: "Wissenschaft",
      beschreibung: "Entdeckungen, Methoden und Wendepunkte der Naturwissenschaften und Technik." },
    { id: "kultur",       name: "Kultur",
      beschreibung: "Literatur, Kunst, Musik und Sprache als Spiegel ihrer Zeit." }
  ],

  reihen: [
    { id: "deutsche-geschichte",
      name: "Deutsche und europäische Geschichte",
      ressort: "geschichte",
      beginn: 1453,
      ende: 2026,
      beschreibung: "Eine fortlaufende Reihe durch die deutsche Geschichte seit dem Ende des Mittelalters. Jeder Teil behandelt eine Epoche und knüpft an den vorigen an.",
      offen: "In Vorbereitung" }
  ],

  artikel: [
    {
      datei: "geschichte-1756-1813.html",
      ressort: "geschichte",
      reihe: "deutsche-geschichte", teil: 3,
      dachzeile: "Deutsche und europäische Geschichte",
      titel: "Vom Siebenjährigen Krieg zur Völkerschlacht bei Leipzig",
      teaser: "Wie das Alte Reich unterging: der Kampf zwischen Preußen und Österreich, Reformen von oben und die Aufklärung, die Französische Revolution, Napoleons Herrschaft über Deutschland – und der Aufbruch von 1813.",
      von: 1756, bis: 1813, kapitel: 15,
      veroeffentlicht: "2026-10-07", stand: "Oktober 2026",
      inhalt: [
        ["2",  "um1756",        "Die Welt um 1756"],
        ["3",  "siebenjaehrig", "Der Siebenjährige Krieg"],
        ["4",  "aufgeklaert",   "Der aufgeklärte Absolutismus"],
        ["5",  "europa",        "Europa im Wandel"],
        ["6",  "aufklaerung",   "Aufklärung, Gesellschaft und Kultur"],
        ["7",  "revolution",    "Die Französische Revolution und Deutschland"],
        ["8",  "napoleon",      "Napoleon und das Ende des Reiches"],
        ["9",  "preussen",      "Zusammenbruch und Reformen"],
        ["10", "befreiung",     "Widerstand und Befreiungskriege"]
      ]
    },
    {
      datei: "wirtschaft-zinsen-2008-2026.html",
      ressort: "wirtschaft",
      dachzeile: "Deutsche und europäische Wirtschaftsgeschichte",
      titel: "Zinsen als Lenker der Wirtschaft",
      teaser: "Wie Zinsen Preise, Wachstum, Vermögen und Staatsfinanzen prägen – erklärt an historischen Lehrstücken und verfolgt von den Null- und Negativzinsjahren in Deutschland bis zur neuen Zinswende im Herbst 2026.",
      von: 2008, bis: 2026, kapitel: 18,
      veroeffentlicht: "2026-10-06", stand: "Oktober 2026",
      aufmacher: true,
      inhalt: [
        ["2",  "grundlagen",       "Der Zins: Preis des Geldes"],
        ["3",  "werkzeug",         "Das Werkzeug der Zentralbanken"],
        ["4",  "inflation",        "Zinsen und Inflation"],
        ["5",  "lehrstuecke",      "Lehrstücke aus der Geschichte"],
        ["6",  "zweizinsen",       "Zwei Währungsräume, zwei Zinsen"],
        ["7",  "nullzins",         "Der Weg in den Nullzins"],
        ["8",  "nullzinsfolgen",   "Die Nullzinsjahre in Deutschland"],
        ["9",  "inflationsschock", "Die Rückkehr der Inflation"],
        ["10", "zinsschock",       "Der Zinsschock 2022/23"],
        ["11", "lockerung",        "Lockerung und trügerische Ruhe"],
        ["12", "gegenwart",        "Die neue Zinswende 2026"],
        ["13", "szenarien",        "Ausblick: Vier Szenarien"]
      ]
    },
    {
      datei: "zeitgeschichte-afd-strategie-2013-2026.html",
      ressort: "politik",
      dachzeile: "Deutsche Zeitgeschichte und Politik",
      titel: "Die Strategie der AfD und wie ihre Rechnung aufging",
      teaser: "Wie die AfD seit ihrer Gründung ihren Weg plante, mehrfach neu ausrichtete und ihre Strategie schließlich gezielt gegen die Union wandte – erzählt anhand ihrer internen Strategiepapiere und der Ereignisse, die sie prägten.",
      von: 2013, bis: 2026, kapitel: 18,
      veroeffentlicht: "2026-10-06", stand: "Oktober 2026",
      inhalt: [
        ["2",  "ausgangslage",     "Das Parteiensystem um 2013"],
        ["3",  "gruendung",        "Von der Professorenpartei zur Protestpartei"],
        ["4",  "strategie2017",    "Papier I: Provokation als Methode"],
        ["5",  "strategie2019",    "Papier II: Der Weg zur Volkspartei"],
        ["6",  "aufstieg",         "Aufstieg im Osten und in Europa"],
        ["7",  "btw2025",          "Bundestagswahl 2025: Kampffeld Migration"],
        ["8",  "brandmauerpapier", "Papier III: Das Ende der Brandmauer"],
        ["9",  "wirtschaft",       "Angriff auf den Markenkern Wirtschaft"],
        ["10", "kulturkampf",      "Kulturkampf: Die Mitte unter Druck"],
        ["11", "flaeche",          "Verankerung in der Fläche"],
        ["12", "wahljahr2026",     "Superwahljahr 2026 und Machtfrage"],
        ["13", "union",            "Die Antwort der Union"]
      ]
    },
    {
      datei: "geschichte-1649-1755.html",
      ressort: "geschichte",
      reihe: "deutsche-geschichte", teil: 2,
      dachzeile: "Deutsche und europäische Geschichte",
      titel: "Vom Westfälischen Frieden zum Vorabend des Siebenjährigen Krieges",
      teaser: "Wie sich das Reich nach dem Dreißigjährigen Krieg neu ordnete: Wiederaufbau, Absolutismus und Barock, die Kriege gegen Ludwig XIV. und die Osmanen, der Aufstieg Österreichs und Preußens zu Großmächten – und der Beginn der Aufklärung.",
      von: 1649, bis: 1755, kapitel: 15,
      veroeffentlicht: "2026-10-06", stand: "Oktober 2026",
      inhalt: [
        ["2",  "um1649",       "Die Welt um 1649"],
        ["3",  "wiederaufbau", "Wiederaufbau und Neuordnung"],
        ["4",  "absolutismus", "Das Zeitalter des Absolutismus"],
        ["5",  "westen",       "Ludwig XIV. und die Kriege im Westen"],
        ["6",  "tuerken",      "Türkenkriege und Aufstieg Österreichs"],
        ["7",  "norden",       "Der Norden im Umbruch"],
        ["8",  "preussen",     "Der Aufstieg Brandenburg-Preußens"],
        ["9",  "schlesien",    "Maria Theresia, Friedrich II. und Schlesien"],
        ["10", "gesellschaft", "Gesellschaft, Glaube und Kultur"]
      ]
    },
    {
      datei: "geschichte-1453-1648.html",
      ressort: "geschichte",
      reihe: "deutsche-geschichte", teil: 1,
      dachzeile: "Deutsche und europäische Geschichte",
      titel: "Vom Fall Konstantinopels zum Westfälischen Frieden",
      teaser: "Wie aus dem Mittelalter die Neuzeit wurde: Buchdruck und Entdeckungen, Reformation und Glaubensspaltung, Bauernkrieg, Religionskriege und schließlich der Dreißigjährige Krieg – und was am Ende daraus entstand.",
      von: 1453, bis: 1648, kapitel: 14,
      veroeffentlicht: "2026-10-05", stand: "Oktober 2026",
      inhalt: [
        ["2", "um1450",       "Die Welt um 1450"],
        ["3", "aufbruch",     "Aufbruch in eine neue Zeit"],
        ["4", "reichsreform", "Maximilian und die Reichsreform"],
        ["5", "reformation",  "Die Reformation"],
        ["6", "konfession",   "Das konfessionelle Zeitalter"],
        ["7", "europa",       "Europa der Glaubenskriege"],
        ["8", "krieg",        "Der Dreißigjährige Krieg"],
        ["9", "frieden",      "Der Westfälische Frieden"]
      ]
    }
  ]
};
