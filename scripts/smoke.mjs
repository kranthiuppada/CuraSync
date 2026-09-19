// End-to-end backend smoke test. Requires backend (:4000) + ollama running.
const BASE = process.env.API_BASE ?? 'http://localhost:4000';
const ok = (c, m) => console.log(`${c ? '✅' : '❌'} ${m}`);

const health = await (await fetch(`${BASE}/api/health`)).json();
ok(health.ok, `health: ollama=${health.ollama} model=${health.model}`);

const vitals = await (await fetch(`${BASE}/api/vitals`)).json();
ok(vitals.healthScore?.value === 94, `vitals: score ${vitals.healthScore?.value}, ${vitals.cards?.length} cards`);

const init = await (await fetch(`${BASE}/api/conversations/init`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient: { name: 'Elena', age: 34 } }),
})).json();
ok(!!init.conversationId, `init: ${init.conversationId}`);
ok(init.greeting?.text?.length > 0, `  greeting: "${init.greeting?.text?.slice(0, 70)}..."`);
ok(init.suggestions?.length >= 2, `  suggestions: ${init.suggestions?.map((s) => s.label).join(' | ')}`);

const turn = await (await fetch(`${BASE}/api/conversations/${init.conversationId}/chat`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'I woke up with a mild tension headache' }),
})).json();
ok(turn.intent?.name === 'symptom_report', `chat: intent=${turn.intent?.name} (${turn.intent?.confidence})`);
ok(turn.reply?.text?.length > 0, `  reply: "${turn.reply?.text?.slice(0, 70)}..."`);
ok(!!turn.analysis, `  analysis: ${turn.analysis?.title ?? 'none'}`);
ok(!!turn.visualization, `  visualization: ${turn.visualization?.type ?? 'none'} — ${turn.visualization?.title ?? ''}`);
ok(turn.suggestions?.length >= 2, `  suggestions: ${turn.suggestions?.map((s) => s.label).join(' | ')}`);

console.log('\nSmoke test complete.');
