import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../api';
import type { ChatMessage, Suggestion, Vitals, OcrResult, Attachment } from '../types';
import { useAuth } from './AuthContext';

export type TabKey = 'vitals' | 'assistant' | 'checkin' | 'reports';

type Ctx = {
  ready: boolean;
  online: boolean;
  tab: TabKey;
  setTab: (t: TabKey) => void;
  showProfile: boolean;
  setShowProfile: (v: boolean) => void;
  conversationId: string | null;
  messages: ChatMessage[];
  suggestions: Suggestion[];
  vitals: Vitals | null;
  sending: boolean;
  lastOcr: OcrResult | null;
  sendMessage: (text: string, ocr?: OcrResult | null, attachment?: Attachment | null) => Promise<void>;
  uploadReport: (uri: string, webFile?: any) => Promise<OcrResult | null>;
  refreshVitals: () => Promise<void>;
  newConversation: () => Promise<void>;
  starting: boolean;
};

const AppCtx = createContext<Ctx | null>(null);

const SEED_VITALS: Vitals = {
  healthScore: { value: 94, delta: 3, status: 'Optimal' },
  cards: [
    { key: 'hr', label: 'Heart Rate', value: 71, unit: 'BPM', sub: 'Resting 64 bpm', status: 'Sinus Rhythm', series: [64, 66, 71, 68, 70, 72, 71] },
    { key: 'bp', label: 'Blood Pressure', value: '118/78', unit: 'mmHg', sub: 'MAP: 91 mmHg', status: 'Optimal Level' },
    { key: 'glucose', label: 'Glucose', value: 96, unit: 'mg/dL', sub: 'Fasting · Dexcom', status: 'In Range (98%)', series: [92, 95, 96, 94, 96, 97, 96] },
    { key: 'spo2', label: 'Oxygen SpO2', value: 98, unit: '%', sub: 'Nocturnal avg 97%', status: 'Normal Saturation', series: [96, 97, 97, 98, 97, 98, 98] },
  ],
  sleep: { duration: '8h 12m', efficiency: 88, deep: '1h 45m', rem: '2h 10m', core: '3h 52m' },
  weeklyBP: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    systolic: [116, 118, 120, 119, 117, 121, 119],
    diastolic: [74, 76, 78, 77, 75, 79, 77],
  },
  labs: [],
};

const SEED_SUGGESTIONS: Suggestion[] = [
  { id: 's1', label: 'Analyze 7-day sleep trend', icon: 'chart' },
  { id: 's2', label: 'Log water (+250ml)', icon: 'water' },
  { id: 's3', label: 'Explain my glucose trend', icon: 'chart' },
];

const now = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

let idc = 0;
const nid = (p: string) => `${p}_${Date.now()}_${idc++}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [tab, setTab] = useState<TabKey>('assistant');
  const [showProfile, setShowProfile] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SEED_SUGGESTIONS);
  const [vitals, setVitals] = useState<Vitals | null>(SEED_VITALS);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [lastOcr, setLastOcr] = useState<OcrResult | null>(null);
  const started = useRef(false);

  const start = useCallback(async () => {
    setStarting(true);
    setLastOcr(null);
    try {
      const patient = user ? { name: user.name, age: user.age } : undefined;
      const res = await api.initConversation(patient);
      setConversationId(res.conversationId);
      setMessages([
        { id: nid('m'), role: 'assistant', text: res.greeting.text, time: now(), telemetry: res.greeting.telemetry ?? null },
      ]);
      setSuggestions(res.suggestions?.length ? res.suggestions : SEED_SUGGESTIONS);
      setVitals(res.vitals ?? SEED_VITALS);
      setOnline(true);
    } catch (e) {
      // Backend down — keep seeded data so the UI still renders.
      setMessages([
        {
          id: nid('m'), role: 'assistant', time: now(),
          text: 'Good morning Elena. I noticed your resting heart rate dipped to 58 BPM during early REM sleep, which correlates positively with your evening walk. How are you feeling this morning?',
          telemetry: { label: 'Telemetry sync', value: '58 BPM', baseline: 'Resting baseline: 62 BPM' },
        },
      ]);
      setOnline(false);
    } finally {
      setReady(true);
      setStarting(false);
    }
  }, [user]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  const newConversation = useCallback(async () => {
    setConversationId(null);
    setMessages([]);
    await start();
  }, [start]);

  const sendMessage = useCallback(
    async (text: string, ocr?: OcrResult | null, attachment?: Attachment | null) => {
      if (!text.trim() && !ocr) return;
      const userMsg: ChatMessage = { id: nid('u'), role: 'user', text, time: now(), attachment: attachment ?? null };
      setMessages((m) => [...m, userMsg]);
      setSending(true);
      try {
        if (!conversationId) throw new Error('no conversation');
        const res = await api.sendChat(conversationId, text, ocr);
        setMessages((m) => [
          ...m,
          {
            id: nid('a'),
            role: 'assistant',
            text: res.reply.text,
            time: now(),
            analysis: res.analysis ?? null,
            visualization: res.visualization ?? null,
          },
        ]);
        if (res.suggestions?.length) setSuggestions(res.suggestions);
        // OCR turns may update vitals/labs — refresh.
        if (ocr) refreshVitals();
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            id: nid('a'),
            role: 'assistant',
            text: 'I could not reach the clinical engine just now. Please ensure the CuraSync backend is running on port 4000.',
            time: now(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [conversationId],
  );

  const uploadReport = useCallback(async (uri: string, webFile?: any) => {
    try {
      const res = await api.runOcr(uri, webFile);
      setLastOcr(res);
      return res;
    } catch (e) {
      return null;
    }
  }, []);

  const refreshVitals = useCallback(async () => {
    try {
      const v = await api.getVitals();
      setVitals(v);
    } catch {
      /* keep current */
    }
  }, []);

  return (
    <AppCtx.Provider
      value={{
        ready, online, tab, setTab, showProfile, setShowProfile, conversationId, messages, suggestions,
        vitals, sending, lastOcr, sendMessage, uploadReport, refreshVitals, newConversation, starting,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
}
