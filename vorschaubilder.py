#!/usr/bin/env python3
"""
Der Philosopher – Vorschaubilder erzeugen

Erzeugt im Ordner bilder/ die Bilder, die Messenger, soziale Netzwerke und
Suchmaschinen beim Teilen eines Links anzeigen (1200 x 630 Pixel):

  bilder/<dossier>.png        je Dossier aus register.js
  bilder/der-philosopher.png  für Titelseite und Ressortseiten
  bilder/logo.png             Logo (512 x 512) für die strukturierten Daten

Vorhandene Bilder werden nicht überschrieben; mit --neu werden alle neu
erzeugt. Braucht Python mit Playwright (pip install playwright) und Node.

    python3 vorschaubilder.py [--neu]
"""
import html, json, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

ORDNER = pathlib.Path(__file__).resolve().parent
ZIEL = ORDNER / "bilder"
NEU = "--neu" in sys.argv

# Ressortfarben aus der dunklen Palette von philosopher.css
FARBE = {"geschichte": "#7fb6c6", "politik": "#e08a97", "wirtschaft": "#b8c37f",
         "philosophie": "#b0a5d6", "wissenschaft": "#8fc4a0", "kultur": "#8fb3d9"}

register = json.loads(subprocess.check_output(
    ["node", "-e", "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.PHILOSOPHER))",
     str(ORDNER / "register.js")]))
ressorts = {r["id"]: r for r in register["ressorts"]}

BASIS = """<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#14213a;color:#eef1f5;font-family:"Bitstream Charter","Charter",Georgia,serif;
  padding:56px 72px 52px;display:flex;flex-direction:column;overflow:hidden}
.kopf{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:18px;border-bottom:4px double #8a97ab}
.marke{font-size:46px;font-weight:700;letter-spacing:-.01em;color:#fff}
.marke i{font-weight:400;font-size:.66em;color:#b9c2d0;margin-right:.16em}
.ressort{font-family:Inter,sans-serif;font-size:19px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--f)}
.ressort:before{content:"";display:inline-block;width:34px;height:4px;background:var(--f);margin-right:14px;vertical-align:middle}
.mitte{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}
.dach{font-family:Inter,sans-serif;font-size:19px;letter-spacing:.2em;text-transform:uppercase;color:#c3cad6;margin-bottom:18px}
h1{font-weight:700;line-height:1.1;color:#fff;max-height:290px;overflow:hidden}
.fuss{display:flex;justify-content:space-between;align-items:flex-end}
.jahre{font-size:34px;letter-spacing:.12em;padding-top:12px;border-top:1px solid rgba(238,241,245,.4)}
.domain{font-family:Inter,sans-serif;font-size:20px;color:#b9c2d0;letter-spacing:.04em}
.motto{font-family:Inter,sans-serif;font-size:21px;letter-spacing:.3em;text-transform:uppercase;color:#c3cad6;margin-top:22px}
</style></head><body style="--f:{farbe}">{inhalt}</body></html>"""

def seite(inhalt, farbe="#8fb3d9"):
    return BASIS.replace("{farbe}", farbe).replace("{inhalt}", inhalt)

def dossier_html(a):
    e = html.escape
    r = ressorts.get(a["ressort"], {"name": a["ressort"]})
    jahre = str(a["von"]) if a["von"] == a["bis"] else f'{a["von"]} – {a["bis"]}'
    return seite(f'''
<div class="kopf"><div class="marke"><i>Der</i>Philosopher</div><div class="ressort">{e(r["name"])}</div></div>
<div class="mitte"><div class="dach">{e(a.get("dachzeile",""))}</div><h1 id="t">{e(a["titel"])}</h1></div>
<div class="fuss"><div class="jahre">{jahre}</div><div class="domain">der-philosopher.de</div></div>''',
        FARBE.get(a["ressort"], "#8fb3d9"))

TITELSEITE = seite('''
<div class="mitte" style="align-items:center;text-align:center">
  <div class="marke" style="font-size:118px;line-height:1"><i>Der</i>Philosopher</div>
  <div class="motto">Hintergrund und Zusammenhang</div>
  <div style="width:520px;border-top:4px double #8a97ab;margin:40px 0 30px"></div>
  <div style="font-size:34px;color:#eef1f5">Lern- und Überblicksdossiers zu Geschichte, Politik und Wirtschaft</div>
</div>
<div class="fuss" style="justify-content:center"><div class="domain">der-philosopher.de</div></div>''')

LOGO = """<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0}body{width:512px;height:512px;background:#14213a;display:flex;align-items:center;justify-content:center;
font-family:"Bitstream Charter",Georgia,serif;color:#fff;font-size:360px;font-weight:700;line-height:1}
</style></head><body><span style="margin-top:20px">P</span></body></html>"""

def aufnehmen(seite_, html_, pfad, w, h, titel_anpassen=False):
    if pfad.exists() and not NEU:
        print("vorhanden:", pfad.name); return
    seite_.set_viewport_size({"width": w, "height": h})
    seite_.set_content(html_)
    if titel_anpassen:   # Schrift verkleinern, bis der Titel höchstens drei Zeilen hat
        seite_.evaluate("""() => { const t = document.getElementById('t'); let g = 76;
          t.style.fontSize = g + 'px';
          while (g > 44 && (t.scrollHeight > 290 || t.getClientRects().length && t.scrollHeight / (g*1.1) > 3.05)) { g -= 2; t.style.fontSize = g + 'px'; } }""")
    seite_.screenshot(path=str(pfad))
    print("erzeugt:", pfad.name)

ZIEL.mkdir(exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    s = b.new_page()
    for a in register["artikel"]:
        aufnehmen(s, dossier_html(a), ZIEL / (pathlib.Path(a["datei"]).stem + ".png"), 1200, 630, True)
    aufnehmen(s, TITELSEITE, ZIEL / "der-philosopher.png", 1200, 630)
    aufnehmen(s, LOGO, ZIEL / "logo.png", 512, 512)
    b.close()
