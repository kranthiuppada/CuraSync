// Central config. All tunables via env with sane defaults so the demo runs zero-config.
export const CONFIG = {
  port: Number(process.env.PORT ?? 4000),
  ollama: {
    host: process.env.OLLAMA_HOST ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'qwen2.5:3b',
    // Per-role model overrides (all default to the base model — one small model, three prompts).
    routerModel: process.env.OLLAMA_ROUTER_MODEL ?? process.env.OLLAMA_MODEL ?? 'qwen2.5:3b',
    answerModel: process.env.OLLAMA_ANSWER_MODEL ?? process.env.OLLAMA_MODEL ?? 'qwen2.5:3b',
    suggestModel: process.env.OLLAMA_SUGGEST_MODEL ?? process.env.OLLAMA_MODEL ?? 'qwen2.5:3b',
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 45000),
    // Bound generation length so responses come back fast enough for a live demo.
    numPredict: Number(process.env.OLLAMA_NUM_PREDICT ?? 380),
    warm: process.env.OLLAMA_WARM !== '0', // preload model into memory on startup
  },
};
