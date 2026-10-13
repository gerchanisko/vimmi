# Vimmi – aplikace

Desktopová aplikace Vimmi: poznámky, úkoly a projekty na jednom klidném místě, s AI asistentem Claude.
Poznámky jsou obyčejné soubory Markdown ve složce (trezoru), takže jsou vždycky tvoje a funguje to i s trezorem z Obsidianu.

## Funkce

**Poznámky**
- Editor Markdownu s živým náhledem (značky se schovají mimo řádek, na kterém píšeš), zvýrazněním kódu, hledáním v poznámce a volitelným Vim režimem
- Odkazy `[[Poznámka]]`, `[[Poznámka|text]]`, `[[Poznámka#Nadpis]]` s doplňováním; klik na neexistující odkaz poznámku vytvoří
- Tagy `#tag` i vnořené `#projekt/web`, tagy ve frontmatter
- Zpětné odkazy, nepropojené zmínky, související poznámky, osnova, vlastnosti
- Režim čtení s klikacími úkoly, export do PDF
- Vkládání obrázků ze schránky nebo přetažením (ukládají se do složky příloh), `![[obrázek.png]]`
- Přejmenování a přesun (i přetažením ve stromu) automaticky opraví odkazy ve všech poznámkách
- Koš (`.trash` v trezoru), záložky, karty, šablony (`{{date}}`, `{{time}}`, `{{title}}`, `{{weekday}}`), denní poznámky
- Změny souborů z jiných programů se projeví okamžitě

**Úkoly a projekty**
- Úkol je řádek `- [ ] text` v jakékoliv poznámce, termín `@2026-10-14`, priorita `!1`–`!3` (kompatibilní i s emoji formátem Obsidian Tasks)
- Přehled **Dnes**: po termínu, dnes, důležité, příštích 7 dní, naposledy upravené
- Přehled **Úkoly** s filtry a seskupením podle poznámky, termínu nebo priority; rychlé přidání úkolu („zítra !1“)
- **Projekty**: poznámka s `type: project`, poznámky k projektu přes `project: Název`; postup, další úkoly, propojené poznámky

**Hledání a navigace**
- Ctrl+K: hledání v názvech i obsahu bez ohledu na diakritiku, filtry Vše / Poznámky / Úkoly / Projekty, vytvoření poznámky
- Ctrl+P: paleta všech příkazů (fuzzy hledání)
- Fulltextové hledání s filtry `#tag` a `path:složka`
- Graf souvislostí (celý trezor nebo okolí poznámky, tagy, neexistující odkazy, přiblížení a tažení)

**AI asistent (Claude)**
- Chat, který vidí otevřenou poznámku a výběr a pomocí nástrojů umí v trezoru hledat, číst poznámky, procházet úkoly, projekty, tagy, souvislosti a deník
- Umí vytvářet a upravovat poznámky, přidávat a odškrtávat úkoly, přejmenovávat a mazat. **Každou změnu nejdřív ukáže jako rozdíl a čeká na schválení** (dá se vypnout)
- Rychlé akce nad výběrem nebo celou poznámkou: shrnout, vylepšit, opravit pravopis, zkrátit, rozvést, pokračovat v psaní, vytáhnout úkoly, osnova, vysvětlit, přeložit, navrhnout název a tagy, vlastní pokyn
- Volitelné hledání na webu, zobrazení přemýšlení, vlastní pokyny, historie chatů (ukládá se v `.vimmi/chats` v trezoru), odhad ceny
- Modely Claude Sonnet 5.5 (výchozí), Opus 5.5 a Haiku 5.5; volitelná úroveň úsilí

## AI: jak to funguje

- API klíč vložíš v **Nastavení → AI** (získáš ho na [platform.claude.com](https://platform.claude.com)). Uloží se zašifrovaně přes systémovou klíčenku (Electron `safeStorage`) a nikdy se nedostane do okna aplikace. Volání API probíhá jen v hlavním procesu.
- Pro vývoj stačí nastavit proměnnou `ANTHROPIC_API_KEY`.
- Používá se oficiální SDK `@anthropic-ai/sdk`, streamování, adaptivní přemýšlení, prompt caching a serverový fallback při odmítnutí (`fallbacks: "default"`).
- Nástroje AI jsou v [`electron/ai/tools.ts`](electron/ai/tools.ts). Nový nástroj přidáš jedním záznamem `def({...})` se schématem v Zodu. U zapisujících nástrojů nastavíš `write: true` a `preview`, aby šly schválit.
- Poznámky se posílají Anthropicu jen tehdy, když AI použiješ.

## Vývoj

Potřebuješ Node.js 22+.

```bash
cd app
npm install
npm run dev        # vývojový režim s automatickým načítáním
npm start          # sestaví a spustí aplikaci
npm test           # unit testy (parser, trezor, AI nástroje)
npm run smoke      # end-to-end test: spustí aplikaci, proklikne funkce, AI proti mock serveru
npm run dist       # AppImage pro Linux do release/
```

### Struktura

```
electron/main.ts        hlavní proces: okno, IPC, otevírání trezoru, deník, šablony, PDF
electron/preload.ts     bezpečné API pro okno (window.vimmi)
electron/vault.ts       trezor v paměti + sledování disku, hledání, přejmenování s opravou odkazů
electron/settings.ts    nastavení a zašifrovaný API klíč
electron/ai/agent.ts    Claude: chat s nástroji, schvalování změn, rychlé akce, historie
electron/ai/tools.ts    nástroje pro práci s trezorem
shared/                 parser Markdownu (odkazy, tagy, úkoly) a sdílené typy
src/                    rozhraní v Reactu (CodeMirror 6, markdown-it, d3-force)
test/                   unit testy (Vitest) a smoke test (Playwright + Electron)
```

## Licence

Písmo Inter je pod licencí SIL Open Font License 1.1 (`src/assets`, viz `../assets/fonts/LICENSE.txt`).
