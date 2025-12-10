import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

type QRLog = {
  ts: string;
  zone: string;
  ua: string;
  device: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  ip?: string;
  ref?: string | null;
  conv?: boolean;
};

const LOGS_DIR = join(process.cwd(), '.qr-logs');
const LOGS_FILE = join(LOGS_DIR, 'logs.json');
let logsCache: QRLog[] | null = null;

function parseDevice(ua: string): QRLog['device'] {
  const u = ua.toLowerCase();
  if (/(iphone|android|mobile)/.test(u)) return 'mobile';
  if (/(ipad|tablet)/.test(u)) return 'tablet';
  if (!ua) return 'unknown';
  return 'desktop';
}

async function ensureLogsDir() {
  try {
    await mkdir(LOGS_DIR, { recursive: true });
  } catch {
    // dir already exists
  }
}

async function readLogs(): Promise<QRLog[]> {
  if (logsCache !== null) return logsCache;
  try {
    await ensureLogsDir();
    const content = await readFile(LOGS_FILE, 'utf-8');
    logsCache = JSON.parse(content) as QRLog[];
    return logsCache;
  } catch {
    logsCache = [];
    return [];
  }
}

async function writeLogs(newLogs: QRLog[]) {
  logsCache = newLogs;
  try {
    await ensureLogsDir();
    await writeFile(LOGS_FILE, JSON.stringify(newLogs, null, 2));
  } catch (err) {
    console.error('Failed to write QR logs:', err);
  }
}

export async function addQRLog(zone: string, headers: Headers, conv = false) {
  const ua = headers.get('user-agent') || '';
  const ip = headers.get('x-forwarded-for') || undefined;
  const ref = headers.get('referer');
  const newLog: QRLog = { ts: new Date().toISOString(), zone, ua, device: parseDevice(ua), ip, ref, conv };
  
  const logs = await readLogs();
  logs.push(newLog);
  const limited = logs.slice(-2000); // limitar a 2000 logs
  await writeLogs(limited);
}

export async function getQRLogs() {
  return await readLogs();
}

export async function getQRSummary() {
  const logs = await readLogs();
  const byZone: Record<string, { count: number; conv: number }> = {};
  for (const l of logs) {
    byZone[l.zone] = byZone[l.zone] || { count: 0, conv: 0 };
    byZone[l.zone].count += 1;
    byZone[l.zone].conv += l.conv ? 1 : 0;
  }
  return byZone;
}

export async function addQRConversion(zone: string) {
  const newLog: QRLog = { 
    ts: new Date().toISOString(), 
    zone, 
    ua: 'conversion', 
    device: 'unknown', 
    conv: true 
  };
  
  const logs = await readLogs();
  logs.push(newLog);
  const limited = logs.slice(-2000);
  await writeLogs(limited);
}
