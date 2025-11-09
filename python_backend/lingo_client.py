import logging
import os
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)

LINGO_API_BASE = "https://api.lingo.dev/v1"


class LingoClient:
    """Thin wrapper around Lingo.dev API calls used by the backend."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = LINGO_API_BASE):
        self.api_key = api_key or os.getenv("LINGO_API_KEY")
        if not self.api_key:
            raise ValueError("Missing LINGO_API_KEY environment variable.")
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def _request(
        self,
        endpoint: str,
        *,
        method: str = "POST",
        json: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        files: Optional[Dict[str, Any]] = None,
        timeout: int = 30,
    ) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(
            method=method,
            url=url,
            json=json,
            data=data,
            files=files,
            timeout=timeout,
        )
        if not response.ok:
            raise RuntimeError(
                f"Lingo API error {response.status_code}: {response.text}"
            )
        return response.json()

    def detect_language(self, text: str) -> Dict[str, Any]:
        return self._request("/detect-language", json={"text": text})

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        return self._request(
            "/translate",
            json={
                "text": text,
                "from": source_lang,
                "to": target_lang,
            },
        )

    def speech_to_text(self, audio_bytes: bytes, language: str = "auto") -> Dict[str, Any]:
        files = {
            "audio": ("input.wav", audio_bytes, "audio/wav"),
        }
        form_data = {"language": language}
        return self._request("/speech-to-text", files=files, data=form_data)

    def text_to_speech(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> Dict[str, Any]:
        payload = {"text": text, "language": language}
        if voice:
            payload["voice"] = voice
        return self._request("/text-to-speech", json=payload)


class MockLingoClient:
    """Fallback mock client when Lingo API key is unavailable."""

    def detect_language(self, text: str) -> Dict[str, Any]:
        return {"language": "en"}

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        return {"text": text, "detectedLanguage": source_lang}

    def speech_to_text(self, audio_bytes: bytes, language: str = "auto") -> Dict[str, Any]:
        return {"text": "mock transcription", "detectedLanguage": "en"}

    def text_to_speech(
        self, text: str, language: str, voice: Optional[str] = None
    ) -> Dict[str, Any]:
        return {"audioUrl": ""}


def get_lingo_client():
    try:
        return LingoClient()
    except ValueError:
        logger.warning(
            "LINGO_API_KEY not set; using mock Lingo client. "
            "Translations will be simulated."
        )
        return MockLingoClient()

