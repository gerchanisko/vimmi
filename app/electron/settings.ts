// App settings (JSON in the user data folder) and the encrypted Claude API key.
import fs from "node:fs";
import path from "node:path";
import { app, safeStorage } from "electron";
import { DEFAULT_SETTINGS, type Settings } from "../shared/types";

const settingsFile = () => path.join(app.getPath("userData"), "settings.json");
const keyFile = () => path.join(app.getPath("userData"), "api-key.bin");

let cache: Settings | undefined;

export function loadSettings(): Settings {
  if (cache) return cache;
  let stored: Partial<Settings> = {};
  try {
    stored = JSON.parse(fs.readFileSync(settingsFile(), "utf8"));
  } catch {
    stored = {};
  }
  cache = { ...DEFAULT_SETTINGS, ...stored, hasApiKey: Boolean(getApiKey()) };
  return cache;
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...loadSettings(), ...patch, hasApiKey: Boolean(getApiKey()) };
  cache = next;
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  const { hasApiKey: _ignored, ...persist } = next;
  fs.writeFileSync(settingsFile(), JSON.stringify(persist, null, 2));
  return next;
}

/** The key from the environment wins, so developers can use ANTHROPIC_API_KEY. */
export function getApiKey(): string | undefined {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const raw = fs.readFileSync(keyFile());
    if (raw.subarray(0, 6).toString() === "plain:") return raw.subarray(6).toString("utf8");
    return safeStorage.decryptString(raw);
  } catch {
    return undefined;
  }
}

export function keyStorageIsEncrypted(): boolean {
  return safeStorage.isEncryptionAvailable() && safeStorage.getSelectedStorageBackend?.() !== "basic_text";
}

export function setApiKey(key: string | null): Settings {
  fs.mkdirSync(path.dirname(keyFile()), { recursive: true });
  if (!key) {
    fs.rmSync(keyFile(), { force: true });
  } else if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(keyFile(), safeStorage.encryptString(key.trim()), { mode: 0o600 });
  } else {
    // No OS keyring available: fall back to a file only the current user can read.
    fs.writeFileSync(keyFile(), Buffer.concat([Buffer.from("plain:"), Buffer.from(key.trim())]), { mode: 0o600 });
  }
  return saveSettings({});
}
