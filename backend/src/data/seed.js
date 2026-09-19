// Seeded vitals for the dashboard/reports. Mutated at runtime by OCR ingestion (labs).
export function makeSeedVitals() {
  return {
    healthScore: { value: 94, delta: 3, status: 'Optimal' },
    cards: [
      { key: 'hr', label: 'Heart Rate', value: 71, unit: 'BPM', sub: 'Resting 64 bpm', status: 'Sinus Rhythm', tone: 'nominal', series: [64, 66, 71, 68, 70, 72, 71] },
      { key: 'bp', label: 'Blood Pressure', value: '118/78', unit: 'mmHg', sub: 'MAP: 91 mmHg', status: 'Optimal Level', tone: 'nominal', series: [] },
      { key: 'glucose', label: 'Glucose', value: 96, unit: 'mg/dL', sub: 'Fasting · Dexcom', status: 'In Range (98%)', tone: 'nominal', series: [92, 95, 96, 94, 96, 97, 96] },
      { key: 'spo2', label: 'Oxygen SpO2', value: 98, unit: '%', sub: 'Nocturnal avg 97%', status: 'Normal Saturation', tone: 'nominal', series: [96, 97, 97, 98, 97, 98, 98] },
    ],
    sleep: { duration: '8h 12m', efficiency: 88, deep: '1h 45m', rem: '2h 10m', core: '3h 52m' },
    weeklyBP: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      systolic: [116, 118, 120, 119, 117, 121, 119],
      diastolic: [74, 76, 78, 77, 75, 79, 77],
    },
    indicators: [
      { label: 'Glucose In-Range', sub: 'Clinical Target > 70%', value: '94', unit: '%', status: 'Optimal', tone: 'nominal' },
      { label: 'Sleep Consistency', sub: 'Avg 7h 42m duration', value: '89', unit: '/100', status: 'Restorative', tone: 'nominal' },
      { label: 'Daily Activity', sub: 'Cadence: Moderate', value: '8,420', unit: 'steps', status: 'Target Met', tone: 'nominal' },
    ],
    regimen: { name: 'Omega-3 & Metformin', dose: '500mg · With lunch (post-prandial)', when: 'Today, 12:30 PM' },
    sensors: [
      { name: 'Apple Watch S9', status: 'Paired & Streaming', battery: 84, tone: 'nominal' },
      { name: 'Dexcom G7', status: 'Expires in 6 days', tone: 'warning' },
    ],
    labs: [], // filled from OCR
  };
}
