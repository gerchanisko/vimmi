# Vimmi

**Méně chaosu. Více prostoru pro to důležité.**

Vimmi je minimalistický osobní prostor pro organizaci každodenního života. Spojuje úkoly, poznámky, projekty a informace do jednoho jednoduchého a přehledného prostředí.

## O projektu

Tento repozitář obsahuje prezentační web produktu Vimmi. Web je čistě statický — používá pouze HTML, CSS a JavaScript bez jakéhokoliv backendu, databáze nebo API.

## Technologie

- **HTML5** — sémantická struktura
- **CSS3** — custom properties, flexbox, grid, responzivní design
- **JavaScript (vanilla)** — dark mode, mobilní menu, scroll animace
- **Inter** — typografie (Google Fonts)

## Struktura projektu

```
Vimmi/
├── index.html          # Hlavní HTML soubor
├── css/
│   └── style.css       # Všechny styly (light/dark mode, responzivita)
├── js/
│   └── main.js         # JavaScript (dark menu, navigace, animace)
├── assets/
│   └── logo.svg        # Logo Vimmi (favicon + navigace + patička)
└── README.md           # Tento soubor
```

## Spuštění lokálně

### Možnost 1: Otevření souboru

Stačí otevřít `index.html` v prohlížeči.

### Možnost 2: Lokální server

Pokud chcete použít lokální server (například pro testování):

```bash
# Python 3
python3 -m http.server 8000

# nebo Node.js
npx serve .
```

Poté navštivte `http://localhost:8000`.

## GitHub Pages

### Nahrání na GitHub

1. Vytvořte nový repozitář na GitHubu
2. Nahrajte všechny soubory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VAS-REPOZITAR/Vimmi.git
   git push -u origin main
   ```

### Zapnutí GitHub Pages

1. Jděte do **Settings** repozitáře
2. V levém menu klikněte na **Pages**
3. V sekci **Source** vyberte **Deploy from a branch**
4. Vyberte branch **main** a složku **/ (root)**
5. Klikněte na **Save**

Stránka bude dostupná na adrese:
```
https://VAS-UZIVATEL.github.io/Vimmi/
```

## Funkce webu

- **Světlý a tmavý režim** — přepínač v navigaci, preference se ukládá do localStorage
- **Responzivní design** — optimalizováno pro desktop, tablet i mobil
- **Scroll animace** — jemné objevení sekcí při scrollování
- **Mobilní menu** — hamburger menu pro zařízení s malým displejem
- **Smooth scroll** — plynulé scrollování k sekcím

## Licence

© 2026 Vimmi
