# Der Philosopher – Website

Statische Website ohne Datenbank und ohne Server-Programmierung. Sie besteht nur aus HTML-, CSS- und JavaScript-Dateien und läuft deshalb auf jedem Webspace.

## Aufbau des Ordners

| Datei | Zweck |
|---|---|
| `index.html` | Titelseite mit Ressortleiste, Aufmacher, Reihe, Ressortblöcken, Ressortseiten (`index.html#geschichte` …) und Archiv mit Suche (`index.html#archiv`) |
| `register.js` | **Beitragsregister** – die einzige Datei, die beim Hinzufügen eines Dossiers geändert wird |
| `philosopher.css` | Gestaltung der Titelseite und der Nebenseiten |
| `impressum.html`, `datenschutz.html` | Vorlagen, vor der Veröffentlichung ausfüllen |
| `anbinden.py` | Fügt in die Dossiers die Kopfleiste „Der Philosopher“ und Fußzeilen-Links ein |
| `vorrendern.js` | Schreibt die aus `register.js` aufgebaute Titelseite fest in `index.html` (für Suchmaschinen und Besucher ohne JavaScript) |
| `sitemap.xml` | Liste aller Seiten für Google und Bing |
| `robots.txt` | Hinweis für Suchmaschinen |
| `geschichte-….html`, `wirtschaft-….html`, `zeitgeschichte-….html` | die Dossiers (in denselben Ordner legen) |

Alle Dateien liegen in **einem** Ordner. Die Links sind relativ, die Seite funktioniert deshalb lokal genauso wie im Netz.

## Ein neues Dossier hinzufügen

1. Die HTML-Datei des Dossiers in diesen Ordner legen. Dateiname nach dem Muster `ressort-thema-JJJJ-JJJJ.html`, klein, ohne Umlaute und Leerzeichen.
2. In `register.js` unter `artikel` einen Eintrag ergänzen (vorhandenen kopieren und anpassen). Die Kommentare oben in der Datei erklären jedes Feld.
3. Einmal `python3 anbinden.py` ausführen – oder das Dossier gleich mit der Leiste erstellen lassen (siehe Konzept im Projekt).
4. Einmal `node vorrendern.js` ausführen. Das schreibt die Titelseite fest in `index.html`, damit Suchmaschinen, Linkvorschauen und Besucher ohne JavaScript sie lesen können. Ohne diesen Schritt fehlt das neue Dossier in dieser festen Fassung, im Browser erscheint es trotzdem.
5. `index.html` im Browser öffnen und prüfen. Danach den Ordner neu hochladen.

Ein neues Ressort entsteht, indem man es unter `ressorts` einträgt. Ressorts ohne Dossier erscheinen in der Leiste und zeigen „In Vorbereitung“; auf der Titelseite tauchen sie erst auf, wenn ein Dossier vorhanden ist.

## Lokal ansehen

`index.html` doppelt anklicken. Es wird keine Software benötigt.

## Veröffentlichen

Drei bewährte Wege, vom einfachsten zum unabhängigsten:

- **Netlify Drop** (kostenlos): Ordner auf app.netlify.com/drop ziehen, fertig. Eine eigene Domain lässt sich später verbinden.
- **GitHub Pages** (kostenlos): Ordner in ein öffentliches Repository hochladen und unter *Settings → Pages* veröffentlichen. Gut, wenn Änderungen nachvollziehbar bleiben sollen.
- **Eigener Webspace** bei einem deutschen Anbieter (z. B. All-Inkl, Strato, IONOS, Hetzner): Ordner per FTP hochladen. Vorteil: Server in Deutschland, einfacher Vertrag zur Auftragsverarbeitung, eigene Domain inklusive.

Wichtig für den Dauerbetrieb:

- **Dateinamen nicht mehr ändern**, sobald die Seite öffentlich ist – sie sind die Adressen der Dossiers, und Links von außen würden ins Leere laufen.
- Die Seite immer über **HTTPS** ausliefern (bei allen genannten Anbietern Standard).
- Nach dem Hochladen die Domain in `robots.txt` (Zeile `Sitemap`) eintragen, wenn eine Sitemap angelegt wird.

## Vor der Veröffentlichung prüfen

- **Impressum** (`impressum.html`) ausfüllen. Eine regelmäßig erscheinende, journalistisch-redaktionell gestaltete Seite braucht nach § 18 Abs. 2 Medienstaatsvertrag zusätzlich eine verantwortliche Person mit Anschrift. Die Vorlage enthält beide Abschnitte.
- **Datenschutzerklärung** (`datenschutz.html`) an den gewählten Hosting-Anbieter anpassen.
- **KI-Hinweis:** Die Dossiers entstehen mit einem KI-Sprachmodell. Die Seite sagt das unter „Über den Philosopher“ und im Impressum. Die Transparenzpflichten der EU-KI-Verordnung (Art. 50) für KI-erzeugte Texte zu Themen von öffentlichem Interesse sollten vor der Veröffentlichung geprüft werden.
- **Datenschutzfreundlich gebaut:** keine Cookies, keine Tracker, keine Schriften oder Skripte von fremden Servern. Ein Cookie-Banner ist deshalb nicht nötig, solange nichts davon nachträglich eingebaut wird.

Diese Hinweise sind keine Rechtsberatung.
