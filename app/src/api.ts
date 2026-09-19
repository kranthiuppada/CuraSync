import axios from 'axios';
import { API_BASE } from './config';
import type { InitResult, ChatResponse, OcrResult, Vitals } from './types';

const client = axios.create({ baseURL: API_BASE, timeout: 120000 });

// --- auth token plumbing -------------------------------------------------
let authToken: string | null = null;
export function setAuthToken(t: string | null) {
  authToken = t;
}
client.interceptors.request.use((cfg) => {
  if (authToken) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Authorization = `Bearer ${authToken}`;
  }
  return cfg;
});

export type Profile = {
  id?: string;
  name: string;
  email: string;
  age: number;
  plan?: string;
  sex?: string;
};

export async function login(email: string, password: string): Promise<{ token: string; profile: Profile }> {
  const { data } = await client.post('/api/auth/login', { email, password });
  return { token: data.token, profile: data.user ?? data.profile };
}

export async function logout(): Promise<void> {
  try {
    await client.post('/api/auth/logout', {});
  } catch {
    /* best effort */
  }
}

export async function getProfile(): Promise<Profile> {
  const { data } = await client.get('/api/profile');
  return data.user ?? data.profile ?? data;
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const { data } = await client.patch('/api/profile', patch);
  return data.user ?? data.profile ?? data;
}

// --- conversation / clinical --------------------------------------------
export async function initConversation(patient?: { name: string; age: number }): Promise<InitResult> {
  const { data } = await client.post('/api/conversations/init', { patient });
  return data;
}

export async function sendChat(
  conversationId: string,
  message: string,
  ocr?: OcrResult | null,
): Promise<ChatResponse> {
  const { data } = await client.post(`/api/conversations/${conversationId}/chat`, {
    message,
    ocr: ocr ?? undefined,
  });
  return data;
}

export async function getVitals(): Promise<Vitals> {
  const { data } = await client.get('/api/vitals');
  return data;
}

/** Uploads an image (uri from expo-image-picker) to the OCR endpoint. */
export async function runOcr(uri: string, fileFromWeb?: any): Promise<OcrResult> {
  const form = new FormData();
  if (fileFromWeb) {
    form.append('image', fileFromWeb, 'report.jpg');
  } else if (uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('http')) {
    const res = await fetch(uri);
    const blob = await res.blob();
    form.append('image', blob, 'report.jpg');
  } else {
    form.append('image', { uri, name: 'report.jpg', type: 'image/jpeg' } as any);
  }
  const { data } = await client.post('/api/ocr', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function health(): Promise<{ ok: boolean; ollama: boolean; model: string }> {
  const { data } = await client.get('/api/health');
  return data;
}
