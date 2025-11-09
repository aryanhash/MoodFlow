const LINGO_API_BASE = "https://api.lingo.dev/v1";

type HttpMethod = "GET" | "POST";

interface LingoRequestOptions {
  endpoint: string;
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

interface TranslationPayload {
  text: string;
  from: string;
  to: string;
}

interface SpeechToTextPayload {
  language?: string;
  audio: Blob;
}

interface TextToSpeechPayload {
  text: string;
  language: string;
  voice?: string;
}

const defaultHeaders = () => {
  const apiKey = import.meta.env.VITE_LINGO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Lingo API key. Set VITE_LINGO_API_KEY in your environment."
    );
  }
  return {
    Authorization: `Bearer ${apiKey}`,
  };
};

async function request<T>(options: LingoRequestOptions): Promise<T> {
  const { endpoint, method = "POST", body, signal } = options;
  const headers: Record<string, string> = {
    ...defaultHeaders(),
  };

  let finalBody: BodyInit | undefined;

  if (body instanceof FormData) {
    finalBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${LINGO_API_BASE}${endpoint}`, {
    method,
    headers,
    body: finalBody,
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Lingo API error (${response.status} - ${response.statusText}): ${errorText}`
    );
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  // @ts-expect-error - caller will know how to handle non-json types.
  return response as T;
}

export const lingoClient = {
  detectLanguage: async (text: string, signal?: AbortSignal) =>
    request<{ language: string }>({
      endpoint: "/detect-language",
      body: { text },
      signal,
    }),

  translate: async (payload: TranslationPayload, signal?: AbortSignal) =>
    request<{ text: string; detectedLanguage?: string }>({
      endpoint: "/translate",
      body: payload,
      signal,
    }),

  speechToText: async (
    payload: SpeechToTextPayload,
    signal?: AbortSignal
  ) => {
    const formData = new FormData();
    formData.append("audio", payload.audio);
    if (payload.language) {
      formData.append("language", payload.language);
    }

    return request<{ text: string; detectedLanguage: string }>({
      endpoint: "/speech-to-text",
      body: formData,
      signal,
    });
  },

  textToSpeech: async (
    payload: TextToSpeechPayload,
    signal?: AbortSignal
  ) =>
    request<{ audioUrl: string }>({
      endpoint: "/text-to-speech",
      body: payload,
      signal,
    }),
};

export type LingoClient = typeof lingoClient;


