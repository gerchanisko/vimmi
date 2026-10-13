import { useEffect, useState } from "react";
import type { Effort, ModelId, Settings as S } from "../../shared/types";
import { switchVault } from "../lib/actions";
import { COMMANDS } from "../lib/commands";
import { errorText, setState, toast, useApp } from "../lib/store";
import { Icon, Logo } from "./Icon";

const TABS = [
  { id: "general", label: "Obecné", icon: "settings" },
  { id: "editor", label: "Editor", icon: "pen" },
  { id: "ai", label: "AI", icon: "sparkle" },
  { id: "keys", label: "Zkratky", icon: "command" },
  { id: "about", label: "O aplikaci", icon: "info" },
];

const MODELS: { id: ModelId; name: string; note: string }[] = [
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", note: "Doporučeno · rychlý a chytrý · $2 / $10 za milion tokenů" },
  { id: "claude-opus-5-5", name: "Claude Opus 5.5", note: "Nejschopnější na složité úkoly · $4 / $20" },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", note: "Nejrychlejší a nejlevnější · $0.10 / $0.50" },
];

const EFFORTS: { id: Effort; label: string }[] = [
  { id: "low", label: "Nízké – rychlé odpovědi" },
  { id: "medium", label: "Střední – doporučeno" },
  { id: "high", label: "Vysoké – důkladnější" },
  { id: "xhigh", label: "Velmi vysoké" },
  { id: "max", label: "Maximální – nejpomalejší" },
];

export default function Settings({ initialTab }: { initialTab?: string }) {
  const settings = useApp((s) => s.settings)!;
  const snapshot = useApp((s) => s.snapshot);
  const [tab, setTab] = useState(initialTab ?? "general");
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [version, setVersion] = useState("");
  const close = () => setState({ overlay: null });

  useEffect(() => {
    void window.vimmi.app.version().then(setVersion);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = async (patch: Partial<S>) => {
    try {
      const next = await window.vimmi.settings.set(patch);
      setState({ settings: { ...settings, ...next } });
    } catch (err) {
      toast(errorText(err), "error");
    }
  };

  const saveKey = async () => {
    const k = key.trim();
    if (!k) return;
    if (!k.startsWith("sk-ant-")) {
      setTestResult({ ok: false, message: "Klíč by měl začínat „sk-ant-“. Zkontroluj, že jsi zkopíroval celý." });
      return;
    }
    const next = await window.vimmi.settings.setKey(k);
    setState({ settings: { ...settings, ...next } });
    setKey("");
    await test();
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    const r = await window.vimmi.settings.testKey(settings.model);
    setTestResult(r);
    setTesting(false);
  };

  const removeKey = async () => {
    const next = await window.vimmi.settings.setKey(null);
    setState({ settings: { ...settings, ...next } });
    setTestResult(null);
  };

  return (
    <div className="overlay center" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="settings" role="dialog" aria-label="Nastavení">
        <nav className="settings-nav">
          <h2>Nastavení</h2>
          {TABS.map((t) => (
            <button key={t.id} className={`nav-item${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="settings-body">
          <button className="icon-btn settings-close" onClick={close} aria-label="Zavřít">
            <Icon name="close" />
          </button>

          {tab === "general" && (
            <>
              <h3>Obecné</h3>
              <Row label="Vzhled">
                <div className="segmented">
                  {(
                    [
                      ["system", "Podle systému", "monitor"],
                      ["light", "Světlý", "sun"],
                      ["dark", "Tmavý", "moon"],
                    ] as const
                  ).map(([v, l, i]) => (
                    <button key={v} className={settings.theme === v ? "on" : ""} onClick={() => void update({ theme: v })}>
                      <Icon name={i} size={14} /> {l}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Trezor" hint={snapshot?.root}>
                <button className="btn" onClick={() => void switchVault().then(close)}>
                  <Icon name="folder-open" /> Otevřít jiný…
                </button>
              </Row>
              <Row label="Složka deníku" hint="Kam se ukládají denní poznámky (Ctrl+D).">
                <TextSetting value={settings.dailyFolder} onSave={(v) => void update({ dailyFolder: v })} />
              </Row>
              <Row label="Složka šablon" hint="Šablony mohou obsahovat {{date}}, {{time}}, {{title}} a {{weekday}}.">
                <TextSetting value={settings.templatesFolder} onSave={(v) => void update({ templatesFolder: v })} />
              </Row>
              <Row label="Složka příloh" hint="Kam se ukládají vložené obrázky.">
                <TextSetting value={settings.attachmentsFolder} onSave={(v) => void update({ attachmentsFolder: v })} />
              </Row>
            </>
          )}

          {tab === "editor" && (
            <>
              <h3>Editor</h3>
              <Row label="Velikost písma">
                <input type="range" min={13} max={22} value={settings.fontSize} onChange={(e) => void update({ fontSize: Number(e.target.value) })} />
                <span className="muted">{settings.fontSize} px</span>
              </Row>
              <Toggle
                label="Živý náhled"
                hint="Skryje značky Markdownu (**, ##, [[ ]]) všude kromě řádku, na kterém píšeš."
                checked={settings.livePreview}
                onChange={(v) => void update({ livePreview: v })}
              />
              <Toggle label="Čitelná šířka řádku" hint="Omezí šířku textu, aby se lépe četl." checked={settings.readableWidth} onChange={(v) => void update({ readableWidth: v })} />
              <Toggle label="Kontrola pravopisu" checked={settings.spellcheck} onChange={(v) => void update({ spellcheck: v })} hint="Projeví se po znovuotevření poznámky." />
              <Toggle label="Vim režim" hint="Ovládání editoru klávesami jako ve Vimu." checked={settings.vimMode} onChange={(v) => void update({ vimMode: v })} />
              <div className="help-box">
                <strong>Syntaxe</strong>
                <ul>
                  <li>
                    <code>[[Poznámka]]</code> odkaz, <code>[[Poznámka|text]]</code> s vlastním textem, <code>![[obrázek.png]]</code> vložený obrázek
                  </li>
                  <li>
                    <code>#tag</code>, <code>#projekt/web</code> vnořený tag
                  </li>
                  <li>
                    <code>- [ ] úkol @2026-12-24 !1</code> úkol s termínem a prioritou (1–3)
                  </li>
                  <li>
                    Frontmatter <code>type: project</code> udělá z poznámky projekt, <code>project: Název</code> k němu poznámku připojí
                  </li>
                </ul>
              </div>
            </>
          )}

          {tab === "ai" && (
            <>
              <h3>AI asistent</h3>
              <p className="muted">
                Vimmi používá Claude od Anthropicu přes tvůj vlastní API klíč. Platíš jen to, co spotřebuješ, přímo Anthropicu. Poznámky se posílají jen
                tehdy, když AI použiješ.
              </p>
              <Row label="API klíč" hint={settings.hasApiKey ? (settings.keyEncrypted ? "Uložen zašifrovaně v systémové klíčence." : "Uložen v souboru čitelném jen pro tebe.") : "Klíč získáš na platform.claude.com → API Keys."}>
                {settings.hasApiKey ? (
                  <div className="row-actions">
                    <span className="pill ok">
                      <Icon name="ok" size={13} /> Klíč je uložen
                    </span>
                    <button className="btn" onClick={() => void test()} disabled={testing}>
                      {testing ? "Ověřuji…" : "Otestovat"}
                    </button>
                    <button className="btn ghost" onClick={() => void removeKey()}>
                      Odebrat
                    </button>
                  </div>
                ) : (
                  <form
                    className="row-actions"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveKey();
                    }}
                  >
                    <input type="password" className="key-input" placeholder="sk-ant-…" value={key} onChange={(e) => setKey(e.target.value)} autoFocus={initialTab === "ai"} />
                    <button className="btn primary" type="submit" disabled={!key.trim()}>
                      Uložit
                    </button>
                    <button type="button" className="btn ghost" onClick={() => void window.vimmi.app.openExternal("https://platform.claude.com/settings/keys")}>
                      Získat klíč <Icon name="external" size={13} />
                    </button>
                  </form>
                )}
              </Row>
              {testResult && <p className={testResult.ok ? "ok-text" : "error-text"}>{testResult.message}</p>}

              <Row label="Model">
                <div className="model-list">
                  {MODELS.map((m) => (
                    <label key={m.id} className={`model-option${settings.model === m.id ? " on" : ""}`}>
                      <input type="radio" name="model" checked={settings.model === m.id} onChange={() => void update({ model: m.id })} />
                      <span>
                        <strong>{m.name}</strong>
                        <span className="muted small">{m.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Row>
              <Row label="Úsilí v chatu" hint="Kolik Claude přemýšlí, než odpoví. Vyšší = kvalitnější, ale pomalejší a dražší.">
                <select value={settings.effort} onChange={(e) => void update({ effort: e.target.value as Effort })}>
                  {EFFORTS.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Úsilí u rychlých akcí" hint="Shrnutí, vylepšení textu, překlad…">
                <select value={settings.quickEffort} onChange={(e) => void update({ quickEffort: e.target.value as Effort })}>
                  {EFFORTS.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Změny v poznámkách" hint="Čtení a hledání probíhá vždy bez ptaní.">
                <div className="segmented">
                  <button className={settings.approvalMode === "ask" ? "on" : ""} onClick={() => void update({ approvalMode: "ask" })}>
                    Vždy se zeptat
                  </button>
                  <button className={settings.approvalMode === "auto" ? "on" : ""} onClick={() => void update({ approvalMode: "auto" })}>
                    Povolit bez ptaní
                  </button>
                </div>
              </Row>
              <Toggle
                label="Hledání na webu"
                hint="Claude může vyhledávat a číst webové stránky (účtuje se zvlášť, ~$10 za 1000 hledání). Platí pro nové chaty."
                checked={settings.webSearch}
                onChange={(v) => void update({ webSearch: v })}
              />
              <Toggle label="Zobrazovat přemýšlení" hint="Ukáže shrnutí toho, jak Claude o odpovědi uvažoval." checked={settings.showThinking} onChange={(v) => void update({ showThinking: v })} />
              <Row label="Vlastní pokyny" hint="Co by měl Claude o tobě vědět nebo jak má odpovídat.">
                <TextArea value={settings.customInstructions} onSave={(v) => void update({ customInstructions: v })} />
              </Row>
            </>
          )}

          {tab === "keys" && (
            <>
              <h3>Klávesové zkratky</h3>
              <table className="keys-table">
                <tbody>
                  {COMMANDS.filter((c) => c.shortcut).map((c) => (
                    <tr key={c.id}>
                      <td>{c.label}</td>
                      <td>
                        <kbd>{window.vimmi.app.platform === "darwin" ? c.shortcut!.replace("Ctrl", "⌘") : c.shortcut}</kbd>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>Otevřít odkaz pod kurzorem / splnit úkol</td>
                    <td>
                      <kbd>Ctrl+Enter</kbd>
                    </td>
                  </tr>
                  <tr>
                    <td>Udělat z řádku úkol</td>
                    <td>
                      <kbd>Ctrl+L</kbd>
                    </td>
                  </tr>
                  <tr>
                    <td>Tučně / kurzíva</td>
                    <td>
                      <kbd>Ctrl+B</kbd> <kbd>Ctrl+I</kbd>
                    </td>
                  </tr>
                  <tr>
                    <td>Hledat v poznámce</td>
                    <td>
                      <kbd>Ctrl+F</kbd>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {tab === "about" && (
            <div className="about">
              <Logo size={48} />
              <h3>Vimmi {version}</h3>
              <p>Méně chaosu. Více prostoru pro to důležité.</p>
              <p className="muted">Poznámky jsou obyčejné soubory Markdown ve tvém trezoru. Patří tobě.</p>
              <div className="row-actions">
                <button className="btn" onClick={() => void window.vimmi.app.openExternal("https://gerchanisko.github.io/vimmi/")}>
                  Web <Icon name="external" size={13} />
                </button>
                <button className="btn" onClick={() => void window.vimmi.app.openExternal("https://github.com/gerchanisko/vimmi")}>
                  GitHub <Icon name="external" size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="setting-row">
      <div className="setting-label">
        <span>{label}</span>
        {hint && <span className="muted small">{hint}</span>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label} hint={hint}>
      <button role="switch" aria-checked={checked} aria-label={label} className={`switch${checked ? " on" : ""}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </Row>
  );
}

function TextSetting({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return <input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v.trim() && v !== value && onSave(v.trim())} />;
}

function TextArea({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <textarea
      rows={4}
      value={v}
      placeholder="Např.: Jsem student informatiky. Odpovídej stručně a česky."
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onSave(v)}
    />
  );
}
