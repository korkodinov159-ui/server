import bridge from '@vkontakte/vk-bridge';

export const API_URL = import.meta.env.VITE_API_URL || 'https://korkodinov159-ui-server-80e9.twc1.net/api';

let launchParams: Record<string, string> | null = null;

/**
 * Кэшируем launch params. VK Bridge возвращает их один раз при запуске.
 */
async function getLaunchParams(): Promise<Record<string, string>> {
  if (launchParams) return launchParams;
  try {
    const params = await bridge.send('VKWebAppGetLaunchParams');
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(params || {})) {
      if (v != null) result[k] = String(v);
    }
    launchParams = result;
    return result;
  } catch {
    launchParams = {};
    return {};
  }
}

/**
 * Формирует query string с vk_* параметрами и sign.
 * Для GET — добавляет к URL, для POST — кладёт в body.
 */
async function withAuth<T extends Record<string, any>>(
  payload: T,
): Promise<T & { vk_user_id?: string; sign?: string }> {
  const params = await getLaunchParams();
  if (!params.vk_user_id) throw new Error('VK user is not authenticated');

  const auth: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k.startsWith('vk_') || k === 'sign') auth[k] = v;
  }

  return { ...payload, ...auth } as T & { vk_user_id?: string; sign?: string };
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const params = await withAuth({});
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const url = qs ? `${API_URL}${path}?${qs}` : `${API_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, body: Record<string, any> = {}): Promise<T> {
  const payload = await withAuth(body);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function resetLaunchParamsCache() {
  launchParams = null;
}