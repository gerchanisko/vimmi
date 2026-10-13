<p align="center">
  <img src="assets/logo.svg" width="64" height="64" alt="Vimmi">
</p>

<h1 align="center">Vimmi</h1>

<p align="center"><strong>Méně chaosu. Více prostoru pro to důležité.</strong></p>

Vimmi je minimalistický osobní pracovní prostor, který propojuje poznámky, úkoly a projekty na jednom klidném místě. Tento repozitář obsahuje jeho **prezentační web**.

> Vimmi je zatím ve vývoji. Rozhraní zobrazená na webu jsou ukázky návrhu, ne hotová aplikace. Web nepředstírá registraci, přihlášení ani funkční AI.

## Obsah webu

| Sekce | Kotva |
| --- | --- |
| Úvod s ukázkou rozhraní | `#top` |
| Přehled: Méně hledání. Více soustředění. | `#funkce` |
| Poznámky | `#poznamky` |
| Úkoly a projekty | `#ukoly` |
| Hledání a připravovaný asistent | `#hledani` |
| Propojený prostor (interaktivní ukázka souvislostí) | `#propojeni` |
| Filozofie | `#filozofie` |
| Časté otázky | `#otazky` |
| Výzva k akci | `#zacit` |

## Struktura

```
index.html              Celý web (sémantické HTML, SVG sprite s ikonami a logem)
css/style.css           Styly: proměnné, komponenty, sekce, ukázky rozhraní, responzivita
js/main.js              Přepínání vzhledu, mobilní menu, zvýraznění navigace, animace, ukázka souvislostí
assets/logo.svg         Značka Vimmi (přizpůsobí se světlému i tmavému systému)
assets/favicon.svg      Ikona pro záložku prohlížeče
assets/apple-touch-icon.png
assets/og-image.png     Náhled pro sdílení na sociálních sítích (1200 × 630)
assets/fonts/           Písmo Inter (variabilní, podmnožina pro češtinu) a jeho licence
.nojekyll               GitHub Pages servíruje soubory bez zpracování Jekyllem
```

Bez frameworků, bez build procesu, bez externích závislostí. Vše potřebné je v repozitáři.

## Spuštění lokálně

Stačí otevřít `index.html` v prohlížeči. Pro věrnější chování (písmo, kotvy) je lepší jednoduchý lokální server:

```bash
python3 -m http.server 8080
# nebo
npx serve .
```

A pak otevřít <http://localhost:8080>.

## Nasazení na GitHub Pages

1. V repozitáři otevři **Settings → Pages**.
2. V části **Build and deployment** zvol **Deploy from a branch**.
3. Vyber větev `main` a složku `/ (root)` a ulož.
4. Web bude dostupný na `https://gerchanisko.github.io/vimmi/`.

Všechny cesty jsou relativní, takže web funguje i ve vlastní podsložce. Pokud web poběží na jiné adrese (například na vlastní doméně), uprav v `index.html` absolutní URL v metadatech `og:url` a `og:image`.

## Design

**Barvy** (CSS proměnné v `:root`, tmavý vzhled přes `light-dark()`):

| Token | Světlý | Tmavý |
| --- | --- | --- |
| Pozadí | `#F7F7F5` | `#111111` |
| Povrch | `#FFFFFF` | `#181818` |
| Okraje | `#E5E5E1` | `#292929` |
| Text | `#171717` | `#F5F5F3` |
| Sekundární text | `#70706B` | `#999995` |
| Akcent | `#6D63FF` | `#6D63FF` |

Akcent se používá střídmě: hlavní tlačítka, aktivní a vybrané stavy, tečka ve značce. Pozadí tlačítek používá o odstín tmavší `#6158F5`, aby bílý text splnil kontrast WCAG AA.

**Typografie:** Inter (variabilní, osy `wght` 400–700 a `opsz`), s `system-ui` jako záložním písmem. Soubor je zmenšený na latinku s českou diakritikou a potřebnou interpunkcí (≈ 49 kB). Texty respektují českou typografii: jednopísmenné předložky a spojky nezůstávají na konci řádku.

**Značka:** geometrické V, jehož pravé rameno je zkrácené a pokračuje tečkou v akcentní barvě. Tečka představuje to jedno důležité, prostor mezi ní a ramenem představuje klid. Značka je čitelná i v 16 px.

## Chování a přístupnost

- Přepínač světlého a tmavého vzhledu; bez volby se řídí nastavením systému a volba se pamatuje.
- Mobilní menu postavené na nativním `popover`, takže se otevírá i bez JavaScriptu.
- Časté otázky jsou nativní `<details>`, fungují bez JavaScriptu.
- Plynulé posouvání ke kotvám, zvýraznění aktuální sekce v navigaci.
- Jemné animace se vypínají při `prefers-reduced-motion`.
- Odkaz pro přeskočení na obsah, sémantické oblasti, popisky ovládacích prvků, viditelné zaměření.
- Ukázky rozhraní mají `role="img"` a srozumitelný popis, čtečky obrazovky tak nečtou desítky ukázkových řádků.
- Bez JavaScriptu zůstává celý obsah dostupný; skryjí se jen prvky, které by bez něj nic nedělaly.

## Licence písma

Písmo [Inter](https://rsms.me/inter/) je šířeno pod licencí SIL Open Font License 1.1, viz `assets/fonts/LICENSE.txt`.
