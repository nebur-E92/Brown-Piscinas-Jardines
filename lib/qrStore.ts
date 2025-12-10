import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { kv } from '@vercel/kv';

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
const USE_KV = !!process.env.KV_REST_API_URL; // Vercel KV available when env exists
const KV_KEY_LOGS = 'qr:logs';
const KV_KEY_COUNT = 'qr:summary:count';
const KV_KEY_CONV = 'qr:summary:conv';
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

async function readLogsFs(): Promise<QRLog[]> {
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

async function writeLogsFs(newLogs: QRLog[]) {
  logsCache = newLogs;
  try {
    await ensureLogsDir();
    await writeFile(LOGS_FILE, JSON.stringify(newLogs, null, 2));
  } catch (err) {
    console.error('Failed to write QR logs (fs):', err);
  }
}

export async function addQRLog(zone: string, headers: Headers, conv = false) {
  const ua = headers.get('user-agent') || '';
  const ip = headers.get('x-forwarded-for') || undefined;
  const ref = headers.get('referer');
  const newLog: QRLog = { ts: new Date().toISOString(), zone, ua, device: parseDevice(ua), ip, ref, conv };

  if (USE_KV) {
    // Persist log list (max 2000) and counters in KV
    await kv.lpush(KV_KEY_LOGS, JSON.stringify(newLog));
    await kv.ltrim(KV_KEY_LOGS, 0, 1999);
    await kv.hincrby(KV_KEY_COUNT, zone, 1);
    if (conv) await kv.hincrby(KV_KEY_CONV, zone, 1);
    return;
  }

  const logs = await readLogsFs();
  logs.push(newLog);
  const limited = logs.slice(-2000); // limitar a 2000 logs
  await writeLogsFs(limited);
}

export async function getQRLogs() {
  if (USE_KV) {
    const raw = await kv.lrange<string>(KV_KEY_LOGS, 0, 1999);
    return raw
      .map((r) => {
        try {
          return typeof r === 'string' ? (JSON.parse(r) as QRLog) : null;
        } catch {
          return null;
        }
      })
      .filter((x): x is QRLog => !!x);
  }
  return await readLogsFs();
}

export async function getQRSummary() {
  if (USE_KV) {
    const counts = (await kv.hgetall<Record<string, string>>(KV_KEY_COUNT)) || {};
    const convs = (await kv.hgetall<Record<string, string>>(KV_KEY_CONV)) || {};
    const byZone: Record<string, { count: number; conv: number }> = {};
    const zones = new Set([...Object.keys(counts), ...Object.keys(convs)]);
    zones.forEach((z) => {
      byZone[z] = {
        count: counts[z] ? Number(counts[z]) : 0,
        conv: convs[z] ? Number(convs[z]) : 0,
      };
    });
    return byZone;
  }

  const logs = await readLogsFs();
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
    conv: true,
  };

  if (USE_KV) {
    await kv.lpush(KV_KEY_LOGS, JSON.stringify(newLog));
    await kv.ltrim(KV_KEY_LOGS, 0, 1999);
    await kv.hincrby(KV_KEY_CONV, zone, 1);
    return;
  }

  const logs = await readLogsFs();
  logs.push(newLog);
  const limited = logs.slice(-2000);
  await writeLogsFs(limited);
}
