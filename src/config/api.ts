import { Platform } from 'react-native';

/**
 * BALLIVE Network & API Configuration
 * Supports Android Emulator, iOS Simulator, Physical Devices, and Cloud Hosting.
 */

// Host candidates: localhost (web/iOS), 10.0.2.2 (Android emulator), and Mac LAN IP (physical phone on WiFi)
const CANDIDATE_URLS = [
  'http://localhost:8080',
  'http://10.0.2.2:8080',
  'http://192.168.100.118:8080',
];

export const API_CONFIG = {
  // Primary Universal Sports Streaming Backend Default
  BACKEND_BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080',

  // Fallback direct upstream sports CDN (if local backend is unreachable)
  UPSTREAM_CDN_URL: 'https://dag.s-u.in',

  // Official Football-Data.org API Token
  FOOTBALL_DATA_API_KEY: 'db6d452d5dce48c88a43efdd50756687',
  FOOTBALL_DATA_BASE_URL: 'https://api.football-data.org/v4',

  // Timeout thresholds
  REQUEST_TIMEOUT_MS: 7000,
};

let cachedActiveUrl: string | null = null;

export async function getActiveBackendUrl(): Promise<string> {
  if (cachedActiveUrl) {
    return cachedActiveUrl;
  }

  // Probe candidates with a fast 1500ms timeout
  const checkUrl = async (url: string): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    try {
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        return url;
      }
    } catch {
      // not available
    } finally {
      clearTimeout(timer);
    }
    throw new Error('Unreachable');
  };

  try {
    const fastest = await Promise.any(CANDIDATE_URLS.map(u => checkUrl(u)));
    cachedActiveUrl = fastest;
    return fastest;
  } catch {
    // If all local candidates fail, use upstream cloud CDN
    cachedActiveUrl = API_CONFIG.UPSTREAM_CDN_URL;
    return API_CONFIG.UPSTREAM_CDN_URL;
  }
}
