import { env } from "../config/env";

/**
 * Lightweight Gemini REST wrapper (no SDK). Supports JSON-mode and plain text.
 * Falls back to a deterministic offline response if GEMINI_API_KEY is not set,
 * so the platform stays demo-able without keys.
 */
export interface GeminiOptions {
  system?: string;
  json?: boolean;
  temperature?: number;
}

function offlineFallback(prompt: string, opts: GeminiOptions): string {
  if (opts.json) {
    return JSON.stringify({
      offline: true,
      summary: "GEMINI_API_KEY non configurée — réponse simulée",
      recommendations: [
        { title: "Configurer GEMINI_API_KEY dans backend/.env", confidence: 0.99 },
      ],
    });
  }
  return `🤖 (Mode offline — clé Gemini absente)\n\nVotre requête : "${prompt.slice(0, 160)}"...\n\nConfigurez GEMINI_API_KEY dans backend/.env pour activer l'IA réelle.`;
}

export async function geminiGenerate(prompt: string, opts: GeminiOptions = {}): Promise<string> {
  if (!env.gemini.apiKey) return offlineFallback(prompt, opts);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.gemini.model}:generateContent?key=${env.gemini.apiKey}`;
  const body: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Gemini ${res.status}: ${txt.slice(0, 300)}`);
    }
    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n") ?? "";
    return text || offlineFallback(prompt, opts);
  } catch (e) {
    console.error("[gemini]", e);
    return offlineFallback(prompt, opts);
  }
}

export async function geminiJson<T = any>(prompt: string, opts: GeminiOptions = {}): Promise<T> {
  const raw = await geminiGenerate(prompt, { ...opts, json: true });
  try {
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return { offline: true, raw } as any;
  }
}
