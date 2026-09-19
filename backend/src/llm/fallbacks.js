// Deterministic fallbacks used when Ollama is unavailable or returns malformed JSON.
// These keep the demo alive and coherent even offline.

export function routerFallback(message = '') {
  const m = message.toLowerCase();
  const has = (...w) => w.some((x) => m.includes(x));
  if (has('chest pain', 'can\'t breathe', 'cant breathe', 'bleeding', 'numb', 'faint', 'suicid'))
    return { name: 'emergency', confidence: 0.95, slots: {} };
  if (has('report', 'lab', 'blood test', 'result', 'hemoglobin', 'glucose', 'cholesterol', 'analyze my'))
    return { name: 'report_analysis', confidence: 0.8, slots: {} };
  if (has('headache', 'pain', 'tired', 'dizzy', 'nausea', 'fever', 'ache', 'sore', 'feel'))
    return { name: 'symptom_report', confidence: 0.78, slots: { symptom: 'reported symptom', severity: 'mild' } };
  if (has('heart rate', 'bp', 'blood pressure', 'glucose', 'sleep', 'trend', 'score', 'spo2', 'vitals'))
    return { name: 'vitals_query', confidence: 0.75, slots: {} };
  if (has('drank', 'water', 'medication', 'took', 'walk', 'reminder', 'log'))
    return { name: 'lifestyle_action', confidence: 0.7, slots: {} };
  return { name: 'general', confidence: 0.6, slots: {} };
}

export function answerFallback(intent, vitals, ocr) {
  const bp = vitals?.cards?.find((c) => c.key === 'bp')?.value ?? '118/78';
  const hr = vitals?.cards?.find((c) => c.key === 'hr')?.value ?? 71;

  if (intent === 'emergency') {
    return {
      text: 'This may be urgent. If you have chest pain, trouble breathing, sudden weakness or severe symptoms, please call your local emergency number or tap Emergency Call now. I can notify your care team, but do not wait on me for urgent care.',
      telemetry: null, analysis: null, visualization: null,
    };
  }

  if (intent === 'report_analysis' && ocr?.values?.length) {
    const flagged = ocr.values.filter((v) => v.flag && v.flag !== 'normal');
    return {
      text: `I reviewed your report — ${ocr.values.length} values parsed, ${flagged.length} outside range. ${flagged.length ? 'The chart below plots each flagged value against its clinical reference band.' : 'Everything looks within normal limits.'} This is guidance, not a diagnosis — share it with your physician.`,
      telemetry: null,
      analysis: flagged.length ? {
        title: 'Lab Review: Values Outside Reference Range',
        conditionProbability: { label: 'Mild', match: 62 },
        biometricCrossCheck: `Current BP ${bp} mmHg is within optimal range.`,
        recommendedProtocol: flagged.slice(0, 3).map((v) => ({ icon: 'food', text: `Discuss ${v.name} (${v.value} ${v.unit}) with your care team.` })),
        synthesizedBy: 'MD Synthesized',
      } : null,
      visualization: {
        type: 'range', title: 'Flagged Labs vs Reference Range', caption: 'Each value plotted against its clinical band', unit: '',
        series: [{ name: 'Labs', color: '#38BDF8', points: (flagged.length ? flagged : ocr.values).slice(0, 5).map((v) => ({ x: v.name, y: v.value })) }],
        target: null,
        bands: (flagged.length ? flagged : ocr.values).slice(0, 5).map((v) => ({ label: v.name, low: v.refLow, high: v.refHigh })),
      },
    };
  }

  if (intent === 'symptom_report') {
    return {
      text: `Thanks for flagging that. Your resting heart rate is ${hr} BPM and BP ${bp} mmHg — both stable, so this looks non-vascular. Mild tension-type symptoms after sleep are commonly linked to overnight dehydration or posture. Let's start with hydration and re-check shortly.`,
      telemetry: { label: 'Telemetry sync', value: `${hr} BPM`, baseline: 'Resting baseline: 62 BPM' },
      analysis: {
        title: 'Tension Headache: Dehydration or Sleep Posture',
        conditionProbability: { label: 'Mild', match: 78 },
        biometricCrossCheck: `Current BP ${bp} mmHg is within optimal range — vascular etiology unlikely.`,
        recommendedProtocol: [
          { icon: 'water', text: 'Drink 400ml room-temp water immediately to replenish overnight deficits.' },
          { icon: 'stretch', text: 'Perform a gentle 2-minute suboccipital & cervical stretch.' },
          { icon: 'clock', text: 'Re-evaluate in 45 minutes. If pain persists beyond mild severity, notify your care team.' },
        ],
        synthesizedBy: 'MD Synthesized',
      },
      visualization: {
        type: 'line', title: 'Projected Symptom Recovery', caption: 'Simulated pain trend if hydration protocol is followed', unit: '/10',
        series: [{ name: 'Pain', color: '#2DD4BF', points: [{ x: 'now', y: 3 }, { x: '+15m', y: 2.6 }, { x: '+30m', y: 1.8 }, { x: '+45m', y: 1.0 }, { x: '+60m', y: 0.5 }] }],
        target: null, bands: null,
      },
    };
  }

  if (intent === 'vitals_query') {
    return {
      text: `Here's your snapshot: heart rate ${hr} BPM (sinus rhythm), BP ${bp} mmHg (optimal), glucose in range 98% of the time, and SpO2 at 98%. Your 7-day trend is stable within the normative corridor.`,
      telemetry: { label: 'Telemetry sync', value: `${hr} BPM`, baseline: 'Resting baseline: 62 BPM' },
      analysis: null,
      visualization: {
        type: 'line', title: 'Heart Rate — 7 Day Trend', caption: 'Resting HR, last 7 days', unit: 'bpm',
        series: [{ name: 'HR', color: '#2DD4BF', points: (vitals?.cards?.find((c) => c.key === 'hr')?.series ?? [64, 66, 71, 68, 70, 72, 71]).map((y, i) => ({ x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] ?? String(i), y })) }],
        target: null, bands: null,
      },
    };
  }

  if (intent === 'lifestyle_action') {
    return { text: 'Logged. Nice work staying on protocol — I\'ve updated your telemetry. Want me to set a re-check reminder?', telemetry: null, analysis: null, visualization: null };
  }

  return {
    text: `Good morning, Elena. Your resting heart rate dipped to 58 BPM during early REM sleep, which correlates positively with your evening walk yesterday. Your BP is ${bp} mmHg and everything reads within baseline. How are you feeling this morning?`,
    telemetry: { label: 'Telemetry sync', value: '58 BPM', baseline: 'Resting baseline: 62 BPM' },
    analysis: null, visualization: null,
  };
}

export function suggestFallback(intent) {
  const base = {
    report_analysis: [
      { label: 'Explain flagged labs', icon: 'report' },
      { label: 'Compare to last report', icon: 'chart' },
      { label: 'Share with Doctor', icon: 'heart' },
    ],
    symptom_report: [
      { label: 'Log water (+250ml)', icon: 'water' },
      { label: 'Set 45-min re-check', icon: 'clock' },
      { label: 'Analyze 7-day sleep trend', icon: 'sleep' },
    ],
    vitals_query: [
      { label: 'Explain my BP corridor', icon: 'heart' },
      { label: 'Analyze 7-day sleep trend', icon: 'sleep' },
      { label: 'Forecast today\'s load', icon: 'chart' },
    ],
    default: [
      { label: 'Analyze 7-day sleep trend', icon: 'sleep' },
      { label: 'Log water (+250ml)', icon: 'water' },
      { label: 'Review latest report', icon: 'report' },
    ],
  };
  return base[intent] ?? base.default;
}
