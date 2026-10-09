#!/usr/bin/env python3
"""
Der Philosopher – Dossiers an die Website anbinden

Fügt in jedes Dossier dieses Ordners, das in register.js eingetragen ist,
  1. oben die schmale Kopfleiste "Der Philosopher" mit Links zur Titelseite
     und zum Ressort ein und
  2. in der Fußzeile Links zu Titelseite, Impressum und Datenschutz ein.

Das Skript ändert nur Dateien, die die Leiste noch nicht haben; es kann also
beliebig oft ausgeführt werden. Aufruf im Ordner der Website:

    python3 anbinden.py
"""
import pathlib
import re
import sys

ORDNER = pathlib.Path(__file__).resolve().parent
MARKE = "<!-- Der Philosopher: Leiste -->"

LEISTE = """<!-- Der Philosopher: Leiste -->
<style>
.ph-bar{background:var(--paper);border-bottom:1px solid var(--line);font-family:var(--sans)}
.ph-bar .ph-in{max-width:1240px;margin:0 auto;padding:10px 20px;display:flex;justify-content:space-between;align-items:baseline;gap:6px 18px;flex-wrap:wrap}
.ph-brand{font-family:var(--serif);font-size:1.35rem;font-weight:600;line-height:1.2;color:var(--ink);text-decoration:none;letter-spacing:-.01em}
.ph-brand i{font-weight:400;font-size:.72em;color:var(--muted);margin-right:.18em}
.ph-links{display:flex;gap:18px;font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600}
.ph-links a{color:var(--muted);text-decoration:none}
.ph-links a:hover{color:var(--accent);text-decoration:underline}
footer .ph-foot a{color:var(--muted)}
@media (max-width:700px){.ph-bar .ph-in{padding:8px 16px}}
@media print{.ph-bar{display:none}}
</style>
<nav class="ph-bar" aria-label="Der Philosopher"><div class="ph-in">
  <a class="ph-brand" href="index.html"><i>Der</i>Philosopher</a>
  <div class="ph-links"><a href="{ressort_id}.html">{ressort_name}</a><a href="index.html">Titelseite</a></div>
</div></nav>
"""

FUSS = ('<span class="ph-foot"> · <a href="index.html">Der Philosopher</a>'
        ' · <a href="impressum.html">Impressum</a>'
        ' · <a href="datenschutz.html">Datenschutz</a></span>')


ICONS = ('<link rel="icon" href="/favicon.ico" sizes="48x48">\n'
         '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
         '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
         '<link rel="manifest" href="/site.webmanifest">\n'
         '<meta name="theme-color" content="#14213a">\n')


def register_lesen():
    text = (ORDNER / "register.js").read_text(encoding="utf-8")
    namen = dict(re.findall(r'id:\s*"([^"]+)",\s*name:\s*"([^"]+)"', text))
    zuordnung = dict(re.findall(r'datei:\s*"([^"]+)",\s*ressort:\s*"([^"]+)"', text))
    return namen, zuordnung


def main():
    namen, zuordnung = register_lesen()
    geaendert = 0
    for datei, ressort_id in zuordnung.items():
        pfad = ORDNER / datei
        if not pfad.exists():
            print(f"fehlt:      {datei} (im Register eingetragen, aber nicht im Ordner)")
            continue
        html = pfad.read_text(encoding="utf-8")
        if MARKE in html:
            print(f"unverändert: {datei} (Leiste schon vorhanden)")
            continue
        leiste = (LEISTE.replace("{ressort_id}", ressort_id)
                        .replace("{ressort_name}", namen.get(ressort_id, ressort_id.capitalize())))
        if '<div id="progress"></div>' in html:
            html = html.replace('<div id="progress"></div>', '<div id="progress"></div>\n' + leiste, 1)
        else:
            html = re.sub(r"(<body[^>]*>)", r"\1\n" + leiste.replace("\\", "\\\\"), html, count=1)
        if "</footer>" in html:
            html = html.replace("</footer>", FUSS + "</footer>", 1)
        if "/favicon.svg" not in html:
            html = re.sub(r'<link rel="icon"[^>]*>\n?', "", html)
            html = re.sub(r"(<meta name=\"viewport\"[^>]*>\n)", lambda m: m.group(1) + ICONS, html, count=1)
        pfad.write_text(html, encoding="utf-8")
        geaendert += 1
        print(f"angebunden:  {datei}")
    print(f"\n{geaendert} Datei(en) angebunden.")


if __name__ == "__main__":
    sys.exit(main())
