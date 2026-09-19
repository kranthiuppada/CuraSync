export type Suggestion = { id: string; label: string; icon?: string };

export type Telemetry = { label: string; value: string; baseline?: string };

export type Attachment = {
  url: string;        // openable image uri (blob:/data:/file:)
  name: string;       // display filename
  total?: number;     // parsed lab count
  flagged?: number;   // flagged lab count
};

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time?: string;
  telemetry?: Telemetry | null;
  analysis?: Analysis | null;
  visualization?: Visualization | null;
  attachment?: Attachment | null;
};

export type ProtocolItem = { icon: string; text: string };

export type Analysis = {
  title: string;
  conditionProbability: { label: string; match: number };
  biometricCrossCheck: string;
  recommendedProtocol: ProtocolItem[];
  synthesizedBy?: string;
};

export type VizPoint = { x: string | number; y: number };
export type VizSeries = { name: string; color?: string; points: VizPoint[] };
export type VizBand = { label: string; low: number; high: number };
export type Visualization = {
  type: 'line' | 'bar' | 'gauge' | 'range';
  title: string;
  caption?: string;
  unit?: string;
  series: VizSeries[];
  target?: number | null;
  bands?: VizBand[] | null;
};

export type Intent = {
  name: string;
  confidence: number;
  slots?: Record<string, string>;
};

export type ChatResponse = {
  intent: Intent;
  reply: { role: 'assistant'; text: string };
  analysis: Analysis | null;
  visualization: Visualization | null;
  suggestions: Suggestion[];
};

export type LabValue = {
  name: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  flag: 'low' | 'normal' | 'high';
};

export type OcrResult = {
  rawText: string;
  values: LabValue[];
  summary: { total: number; flagged: number };
};

export type VitalCard = {
  key: string;
  label: string;
  value: number | string;
  unit: string;
  sub: string;
  status: string;
  series?: number[];
};

export type Vitals = {
  healthScore: { value: number; delta: number; status: string };
  cards: VitalCard[];
  sleep: { duration: string; efficiency: number; deep: string; rem: string; core: string };
  weeklyBP: { days: string[]; systolic: number[]; diastolic: number[] };
  labs: LabValue[];
};

export type InitResult = {
  conversationId: string;
  greeting: { role: 'assistant'; text: string; telemetry?: Telemetry | null };
  suggestions: Suggestion[];
  vitals: Vitals;
};
