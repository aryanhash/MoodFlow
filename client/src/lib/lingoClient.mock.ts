import { LingoClient } from "./lingoClient";

export const createMockLingoClient = (): LingoClient => ({
  detectLanguage: async (text: string) => ({
    language: text.startsWith("¿") ? "es" : "en",
  }),
  translate: async ({ text }) => ({
    text,
    detectedLanguage: "en",
  }),
  speechToText: async () => ({
    text: "mock transcription",
    detectedLanguage: "en",
  }),
  textToSpeech: async () => ({
    audioUrl: "data:audio/wav;base64,",
  }),
});

