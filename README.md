<p align="center">
  <img src="assets/logo.svg" width="64" height="64" alt="Vimmi">
</p>

<h1 align="center">Vimmi – web</h1>

<p align="center"><strong>Všechno důležité. Na jednom místě.</strong></p>

Tento repozitář obsahuje **prezentační web** aplikace Vimmi: <https://gerchanisko.github.io/vimmi/>.
Samotná aplikace (Electron, AI asistent, instalační skript) je v repozitáři **[gerchanisko/vimmi-app](https://github.com/gerchanisko/vimmi-app)**.

## Obsah webu

| Sekce | Kotva |
| --- | --- |
| Úvod se snímkem aplikace a poskytovateli AI | `#top` |
| Prohlídka obrazovek (Dnes, Projekty, Graf, Hledání, Tmavý vzhled) | – |
| Funkce | `#funkce` |
| AI asistent a poskytovatelé | `#ai` |
| Soukromí | `#soukromi` |
| Stažení (Linux jedním příkazem, macOS a Windows brzy) | `#stahnout` |
| Časté otázky | `#otazky` |

## Struktura

```
index.html              celý web (sémantické HTML, SVG sprite s ikonami)
css/style.css           styly, světlý a tmavý vzhled, responzivita
js/main.js              přepínání vzhledu, záložky, kopírování příkazu, animace při posouvání
assets/screenshots/     snímky skutečné aplikace (vytváří je scripts/screenshots.mjs ve vimmi-app)
assets/og-image.png     náhled pro sociální sítě (1200 × 630)
assets/fonts/           písmo Inter a jeho licence
```

Bez frameworků, bez build procesu, bez externích závislostí.

## Lokálně

```bash
python3 -m http.server 8080
```

a otevřít <http://localhost:8080>.

## Snímky obrazovky

Ve vimmi-app: `npm run screenshots` a pak zkopírovat `docs/screenshots/*.png` do `assets/screenshots/`.

## Licence písma

Písmo [Inter](https://rsms.me/inter/) je šířeno pod licencí SIL Open Font License 1.1, viz `assets/fonts/LICENSE.txt`.
