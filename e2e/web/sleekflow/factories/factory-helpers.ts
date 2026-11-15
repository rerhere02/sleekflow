import fs from 'fs';
import path from 'path';

const CLEANUP_MANIFEST = path.resolve(__dirname, '../../reports/cleanup-manifest.json');

export interface CleanupEntry {
  email: string;
  createdAt: string;
  scenario?: string;
}

function readManifest(): CleanupEntry[] {
  if (!fs.existsSync(CLEANUP_MANIFEST)) return [];
  try {
    return JSON.parse(fs.readFileSync(CLEANUP_MANIFEST, 'utf8'));
  } catch {
    return [];
  }
}

function writeManifest(entries: CleanupEntry[]): void {
  fs.mkdirSync(path.dirname(CLEANUP_MANIFEST), { recursive: true });
  fs.writeFileSync(CLEANUP_MANIFEST, JSON.stringify(entries, null, 2));
}

export function appendCleanupLog(email: string, scenario?: string): void {
  const entries = readManifest();
  entries.push({ email, createdAt: new Date().toISOString(), scenario });
  writeManifest(entries);
}

export function getCleanupEntries(): CleanupEntry[] {
  return readManifest();
}

export function clearCleanupManifest(): void {
  if (fs.existsSync(CLEANUP_MANIFEST)) fs.unlinkSync(CLEANUP_MANIFEST);
}
