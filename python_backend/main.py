import asyncio
import random
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from typing import List, Optional

from models import (
    MoodDetectionRequest,
    MoodDetectionResponse,
    ErrorResponse,
    Task,
    TaskCreate,
    TaskUpdate,
    UserSettings,
    UserSettingsUpdate,
    MoodType,
    ChatMessageRequest,
    ChatMessageResponse,
    TextToSpeechRequest,
    TextToSpeechResponse,
    CrisisSummary,
    HelplineInfo,
    SupportSMSRequest,
    SupportSMSResponse,
    PeerSupportRequest,
    PeerSupportResponse,
    PeerChatRequest,
    PeerChatResponse,
    PeerChatMessage,
    PeerMatch,
)
from mood_analysis import analyze_text_sentiment, analyze_facial_expression, mock_face_analysis, fuse_mood_analysis
from storage import storage
from lingo_client import get_lingo_client

load_dotenv()

# Meal recommendations based on mood
MEAL_RECOMMENDATIONS = {
    MoodType.CALM: [
        {
            "id": "calm-1",
            "name": "Mediterranean Quinoa Bowl",
            "description": "A soothing bowl with quinoa, olives, tomatoes, and fresh herbs",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["quinoa", "olives", "cherry tomatoes", "fresh basil", "feta cheese"],
            "prepTime": "15 minutes",
            "calories": 420
        },
        {
            "id": "calm-2", 
            "name": "Herbal Tea & Oatmeal",
            "description": "Warm oatmeal with chamomile tea and honey",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["oats", "chamomile tea", "honey", "almonds", "banana"],
            "prepTime": "10 minutes",
            "calories": 350
        },
        {
            "id": "calm-3",
            "name": "Lavender Honey Smoothie",
            "description": "Calming smoothie with lavender and honey",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["lavender", "honey", "almond milk", "banana", "vanilla"],
            "prepTime": "5 minutes",
            "calories": 280
        },
        {
            "id": "calm-4",
            "name": "Gentle Vegetable Soup",
            "description": "Light, nourishing soup for peaceful moments",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["vegetable broth", "zucchini", "carrots", "herbs", "lemon"],
            "prepTime": "20 minutes",
            "calories": 180
        }
    ],
    MoodType.ENERGIZED: [
        {
            "id": "energized-1",
            "name": "Power Protein Smoothie",
            "description": "High-energy smoothie with protein powder and fresh fruits",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["protein powder", "banana", "spinach", "almond milk", "berries"],
            "prepTime": "5 minutes",
            "calories": 280
        },
        {
            "id": "energized-2",
            "name": "Grilled Chicken Power Bowl",
            "description": "Lean protein with complex carbs for sustained energy",
            "image": "/assets/Healthy_dinner_salmon_plate_ec0bbd3d-D136SqCS.png",
            "ingredients": ["grilled chicken", "brown rice", "sweet potato", "broccoli", "avocado"],
            "prepTime": "25 minutes",
            "calories": 520
        },
        {
            "id": "energized-3",
            "name": "Energy Boosting Trail Mix",
            "description": "Quick energy snack with nuts and dried fruits",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["almonds", "cashews", "dried cranberries", "dark chocolate", "coconut"],
            "prepTime": "2 minutes",
            "calories": 320
        },
        {
            "id": "energized-4",
            "name": "Green Energy Bowl",
            "description": "Vibrant bowl packed with energizing nutrients",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["kale", "quinoa", "edamame", "avocado", "lime"],
            "prepTime": "15 minutes",
            "calories": 380
        }
    ],
    MoodType.STRESSED: [
        {
            "id": "stressed-1",
            "name": "Comfort Soup",
            "description": "Warm, nourishing soup to calm and comfort",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["vegetable broth", "carrots", "celery", "ginger", "turmeric"],
            "prepTime": "20 minutes",
            "calories": 180
        },
        {
            "id": "stressed-2",
            "name": "Warm Milk & Toast",
            "description": "Simple, comforting combination",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["whole grain bread", "warm milk", "honey", "cinnamon"],
            "prepTime": "5 minutes",
            "calories": 250
        },
        {
            "id": "stressed-3",
            "name": "Chamomile & Banana Smoothie",
            "description": "Calming smoothie to reduce stress",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["chamomile tea", "banana", "almond milk", "honey", "vanilla"],
            "prepTime": "5 minutes",
            "calories": 220
        },
        {
            "id": "stressed-4",
            "name": "Soft Scrambled Eggs",
            "description": "Gentle, easy-to-digest comfort food",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["eggs", "butter", "salt", "pepper", "chives"],
            "prepTime": "8 minutes",
            "calories": 200
        }
    ],
    MoodType.FOCUSED: [
        {
            "id": "focused-1",
            "name": "Brain-Boosting Salad",
            "description": "Nutrient-dense salad with omega-3 rich ingredients",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["salmon", "walnuts", "spinach", "blueberries", "olive oil"],
            "prepTime": "15 minutes",
            "calories": 380
        },
        {
            "id": "focused-2",
            "name": "Green Tea & Nuts",
            "description": "Light snack with focus-enhancing nutrients",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["green tea", "almonds", "dark chocolate", "berries"],
            "prepTime": "2 minutes",
            "calories": 200
        },
        {
            "id": "focused-3",
            "name": "Blueberry Oatmeal",
            "description": "Antioxidant-rich breakfast for mental clarity",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["oats", "blueberries", "walnuts", "honey", "cinnamon"],
            "prepTime": "10 minutes",
            "calories": 320
        },
        {
            "id": "focused-4",
            "name": "Matcha Energy Bowl",
            "description": "Sustained energy bowl with matcha and superfoods",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["matcha", "quinoa", "chia seeds", "berries", "coconut"],
            "prepTime": "12 minutes",
            "calories": 350
        }
    ],
    MoodType.NEUTRAL: [
        {
            "id": "neutral-1",
            "name": "Balanced Buddha Bowl",
            "description": "Well-rounded meal with all food groups",
            "image": "/assets/Healthy_lunch_buddha_bowl_b1a819ea-DIXGCSbu.png",
            "ingredients": ["quinoa", "chickpeas", "vegetables", "tahini", "seeds"],
            "prepTime": "20 minutes",
            "calories": 450
        },
        {
            "id": "neutral-2",
            "name": "Classic Avocado Toast",
            "description": "Simple, nutritious breakfast option",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["whole grain bread", "avocado", "lemon", "salt", "pepper"],
            "prepTime": "10 minutes",
            "calories": 320
        },
        {
            "id": "neutral-3",
            "name": "Mixed Berry Smoothie",
            "description": "Balanced smoothie with mixed berries",
            "image": "/assets/Healthy_breakfast_avocado_toast_b085d880-DXX5vWJ7.png",
            "ingredients": ["mixed berries", "yogurt", "honey", "oats", "milk"],
            "prepTime": "5 minutes",
            "calories": 280
        },
        {
            "id": "neutral-4",
            "name": "Grilled Salmon & Vegetables",
            "description": "Simple, healthy protein with seasonal vegetables",
            "image": "/assets/Healthy_dinner_salmon_plate_ec0bbd3d-D136SqCS.png",
            "ingredients": ["salmon", "asparagus", "sweet potato", "olive oil", "herbs"],
            "prepTime": "25 minutes",
            "calories": 420
        }
    ]
}

app = FastAPI(title="MoodLiftMeals API", version="1.0.0")
lingo_client = get_lingo_client()
DEFAULT_ANALYSIS_LANGUAGE = "en"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


FALLBACK_EMPATHY_RESPONSES = [
    "I hear you. That sounds heavy, and it makes sense you'd feel that way. Let’s take this one small step at a time together. 💜",
    "Thank you for trusting me with that. Your feelings matter, and I’m here to help you breathe through them.",
    "It’s okay to feel exactly how you do right now. You’re not alone, and we can find a gentle next step whenever you’re ready.",
]

CRISIS_KEYWORDS_EN = [
    "suicide",
    "kill myself",
    "hurt myself",
    "self harm",
    "self-harm",
    "end my life",
    "ending my life",
    "can't go on",
    "cant go on",
    "hopeless",
    "worthless",
    "overdose",
    "cutting",
    "bleeding",
    "die",
    "want to die",
    "give up",
]

HELPLINE_DIRECTORY = {
    "en": {
        "code": "US",
        "name": "988 Suicide & Crisis Lifeline (USA)",
        "phone": "988",
        "url": "https://988lifeline.org",
        "language": "en",
    },
    "hi": {
        "code": "IN",
        "name": "Kiran Mental Health Helpline (India)",
        "phone": "1800-599-0019",
        "url": "https://www.mohfw.gov.in/",
        "language": "hi",
    },
    "es": {
        "code": "ES",
        "name": "Línea 024 Contigo (España)",
        "phone": "024",
        "url": "https://www.sanidad.gob.es",
        "language": "es",
    },
    "zh": {
        "code": "CN",
        "name": "Beijing Suicide Research & Prevention Center",
        "phone": "800-810-1117",
        "url": "http://www.crisis.org.cn/",
        "language": "zh",
    },
    "ar": {
        "code": "AE",
        "name": "UAE Mental Health Support Line",
        "phone": "800-4673",
        "url": "https://www.mohap.gov.ae",
        "language": "ar",
    },
    "default": {
        "code": "INTL",
        "name": "Find a helpline – International directory",
        "phone": "",
        "url": "https://findahelpline.com/",
        "language": "en",
    },
}

PEER_MODERATION_BLOCKLIST = [
    "hate",
    "kill",
    "violence",
    "abuse",
    "threat",
]

PEER_REPLY_TEMPLATES = [
    "Thank you for sharing that with me. I’ve felt something similar, and taking things one moment at a time helped.",
    "You’re doing really well by opening up. Would you like to try a grounding exercise together?",
    "I hear you. It can be heavy, but you don’t have to carry it alone. I’m right here with you.",
    "That sounds challenging. What’s one small kindness you could offer yourself today?",
]


def detect_crisis_keywords(text: Optional[str]) -> List[str]:
    if not text:
        return []
    lowered = text.lower()
    hits: List[str] = []
    for keyword in CRISIS_KEYWORDS_EN:
        if keyword in lowered:
            hits.append(keyword)
    # Preserve order, remove duplicates
    seen = set()
    unique_hits = []
    for item in hits:
        if item not in seen:
            seen.add(item)
            unique_hits.append(item)
    return unique_hits


def get_helpline_for_language(language: Optional[str]) -> HelplineInfo:
    if not language:
        data = HELPLINE_DIRECTORY["default"]
    else:
        lang_code = language.split("-")[0].lower()
        data = HELPLINE_DIRECTORY.get(lang_code, HELPLINE_DIRECTORY["default"])
    return HelplineInfo(**data)

# CORS middleware
# CORS for local dev (Vite) and same-origin deployments
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (frontend)
if os.path.exists("../dist/public"):
    app.mount("/assets", StaticFiles(directory="../dist/public/assets"), name="assets")
    app.mount("/static", StaticFiles(directory="../dist/public"), name="static")

@app.get("/")
async def serve_frontend():
    """Serve the React frontend."""
    if os.path.exists("../dist/public/index.html"):
        return FileResponse("../dist/public/index.html")
    return {"message": "Frontend not built yet"}

@app.get("/favicon.png")
async def serve_favicon():
    """Serve the favicon."""
    favicon_path = "../dist/public/favicon.png"
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")

# Mood Detection API
@app.post("/api/mood/detect", response_model=MoodDetectionResponse)
async def detect_mood(request: MoodDetectionRequest):
    """Detect mood from text and optionally face analysis."""
    try:
        raw_text = request.text.strip()
        original_language = None
        translated_text = None
        translated_language = None
        translation_applied = False

        analysis_text = ""

        if raw_text:
            analysis_text = raw_text
            try:
                detection_result = await asyncio.to_thread(
                    lingo_client.detect_language, raw_text
                )
                original_language = detection_result.get("language") or detection_result.get("detectedLanguage")
            except Exception as e:
                print(f"Language detection error: {e}")

            source_lang = original_language or "auto"
            translated_language = original_language
            if source_lang.lower() != DEFAULT_ANALYSIS_LANGUAGE:
                try:
                    translation_result = await asyncio.to_thread(
                        lingo_client.translate,
                        raw_text,
                        source_lang,
                        DEFAULT_ANALYSIS_LANGUAGE,
                    )
                    translated_text = translation_result.get("text") or raw_text
                    analysis_text = translated_text
                    translated_language = DEFAULT_ANALYSIS_LANGUAGE
                    translation_applied = (
                        translated_text.strip().lower() != raw_text.strip().lower()
                        or source_lang.lower() != DEFAULT_ANALYSIS_LANGUAGE
                    )
                except Exception as e:
                    print(f"Translation to English failed: {e}")
                    translated_text = raw_text
                    analysis_text = raw_text
            else:
                translated_text = raw_text
                translated_language = DEFAULT_ANALYSIS_LANGUAGE
        else:
            raw_text = ""

        if translated_text is None:
            translated_text = raw_text or None
        if translated_language is None:
            translated_language = (
                DEFAULT_ANALYSIS_LANGUAGE
                if (translated_text and (original_language is None or original_language.lower() == DEFAULT_ANALYSIS_LANGUAGE))
                else original_language
            )

        # Analyze text sentiment (only if text is provided)
        text_result = None
        if analysis_text.strip():
            text_result = analyze_text_sentiment(analysis_text)
        
        # Analyze face using real facial expression analysis
        face_result = None
        if request.useWebcam and request.imageData:
            try:
                # Use real facial expression analysis
                face_result = analyze_facial_expression(request.imageData)
            except Exception as e:
                print(f"Face analysis error: {e}")
                # Fallback to mock analysis
                face_result = mock_face_analysis()
        
        # Fuse the results
        fusion_result = fuse_mood_analysis(text_result, face_result)
        sources = dict(fusion_result.sources)
        if translation_applied:
            sources["translation"] = True
        if original_language:
            sources["detectedLanguage"] = original_language

        keyword_hits = detect_crisis_keywords(analysis_text)
        if translated_text and translated_text != analysis_text:
            keyword_hits = list({kw: None for kw in (keyword_hits + detect_crisis_keywords(translated_text))}.keys())
        if raw_text and raw_text != analysis_text:
            keyword_hits = list({kw: None for kw in (keyword_hits + detect_crisis_keywords(raw_text))}.keys())

        lookback_since = datetime.now() - timedelta(days=3)
        historical_negative = await storage.count_negative_moods_since(
            request.userId,
            lookback_since,
            min_confidence=80,
        )
        current_entry_negative = fusion_result.mood == MoodType.STRESSED and fusion_result.confidence >= 80
        negative_streak = historical_negative + (1 if current_entry_negative else 0)

        crisis_reasons: List[str] = []
        if keyword_hits:
            crisis_reasons.append("keywords")
        if negative_streak >= 3:
            crisis_reasons.append("streak")
        crisis_flag = bool(crisis_reasons)
        helpline_info = get_helpline_for_language(request.preferredLanguage or original_language) if crisis_flag else None
        if crisis_flag:
            sources["crisisFlag"] = True

        # Save mood entry
        from models import MoodEntryCreate
        mood_entry_data = MoodEntryCreate(
            userId=request.userId,
            mood=fusion_result.mood,
            confidence=fusion_result.confidence,
            textInput=translated_text or raw_text or None,
            faceAnalysis=str(face_result.dict()) if face_result else None,
            originalText=raw_text or None,
            originalLanguage=original_language,
            translatedText=translated_text or None,
            translatedLanguage=translated_language,
            translationProvider="lingo" if translation_applied else None,
            crisisFlag=crisis_flag,
            crisisKeywords=keyword_hits or None,
            crisisReasons=crisis_reasons or None,
            negativeMoodStreak=negative_streak if crisis_flag else historical_negative,
            helplineCode=helpline_info.code if helpline_info else None,
            helplineName=helpline_info.name if helpline_info else None,
            helplinePhone=helpline_info.phone if helpline_info else None,
            helplineUrl=helpline_info.url if helpline_info else None,
            helplineLanguage=helpline_info.language if helpline_info else None,
        )
        mood_entry = await storage.create_mood_entry(mood_entry_data)

        english_message = f"Your mood: {fusion_result.mood.value.capitalize()} ({fusion_result.confidence}% confidence)"
        target_language = (
            request.preferredLanguage
            or original_language
            or DEFAULT_ANALYSIS_LANGUAGE
        )
        localized_message = english_message
        localized_language = DEFAULT_ANALYSIS_LANGUAGE
        if target_language and target_language.lower() != DEFAULT_ANALYSIS_LANGUAGE:
            try:
                translation_back = await asyncio.to_thread(
                    lingo_client.translate,
                    english_message,
                    DEFAULT_ANALYSIS_LANGUAGE,
                    target_language,
                )
                localized_message = translation_back.get("text") or english_message
                localized_language = target_language
            except Exception as e:
                print(f"Result translation error: {e}")
        else:
            localized_language = DEFAULT_ANALYSIS_LANGUAGE
        
        return MoodDetectionResponse(
            mood=fusion_result.mood,
            confidence=fusion_result.confidence,
            sources=sources,
            entry=mood_entry,
            originalText=raw_text or None,
            originalLanguage=original_language,
            translatedText=translated_text or None,
            translatedLanguage=translated_language,
            localizedMessage=localized_message,
            localizedLanguage=localized_language,
            translationApplied=translation_applied,
            crisis=CrisisSummary(
                triggered=crisis_flag,
                reasons=crisis_reasons,
                keywords=keyword_hits,
                negativeMoodStreak=negative_streak if crisis_flag else historical_negative,
                helpline=helpline_info,
            ),
        )
    except Exception as e:
        print(f"Mood detection error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")


async def generate_empathy_response(prompt: str) -> str:
    fallback = random.choice(FALLBACK_EMPATHY_RESPONSES)
    if not OPENAI_API_KEY:
        return fallback

    def _call() -> str:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENAI_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an empathetic, supportive mental health companion named MoodFlow. "
                            "Respond with short, compassionate messages (max 3 sentences) that validate feelings, "
                            "encourage gentle next steps, and never offer medical or legal advice."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 220,
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("choices"):
            return data["choices"][0]["message"]["content"].strip()
        return fallback

    try:
        return await asyncio.to_thread(_call)
    except Exception as exc:
        print(f"Empathy generation failed: {exc}")
        return fallback


@app.post("/api/chat/empathy", response_model=ChatMessageResponse)
async def chat_empathy(request_data: ChatMessageRequest):
    """Multilingual empathy chat companion."""
    incoming_text = request_data.message.strip()
    if not incoming_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    detected_language = None
    translated_to_en = incoming_text
    translation_to_en_applied = False

    try:
        detection = await asyncio.to_thread(
            lingo_client.detect_language, incoming_text
        )
        detected_language = detection.get("language") or detection.get("detectedLanguage")
    except Exception as exc:
        print(f"Chat language detection error: {exc}")

    if detected_language and detected_language.lower() != DEFAULT_ANALYSIS_LANGUAGE:
        try:
            translation = await asyncio.to_thread(
                lingo_client.translate,
                incoming_text,
                detected_language,
                DEFAULT_ANALYSIS_LANGUAGE,
            )
            translated_to_en = translation.get("text") or incoming_text
            translation_to_en_applied = True
        except Exception as exc:
            print(f"Chat translation to English failed: {exc}")
            translated_to_en = incoming_text

    empathy_text_en = await generate_empathy_response(translated_to_en)

    target_language = request_data.language or detected_language or DEFAULT_ANALYSIS_LANGUAGE
    final_text = empathy_text_en
    translation_back_applied = False

    crisis_keyword_hits = detect_crisis_keywords(translated_to_en)

    if target_language.lower() != DEFAULT_ANALYSIS_LANGUAGE:
        try:
            translation_back = await asyncio.to_thread(
                lingo_client.translate,
                empathy_text_en,
                DEFAULT_ANALYSIS_LANGUAGE,
                target_language,
            )
            final_text = translation_back.get("text") or empathy_text_en
            translation_back_applied = True
        except Exception as exc:
            print(f"Chat translation back failed: {exc}")
            final_text = empathy_text_en
    else:
        target_language = DEFAULT_ANALYSIS_LANGUAGE

    peer_support_suggested = False
    try:
        negative_mood_count = await storage.count_recent_negative_moods(request_data.userId)
        peer_support_suggested = negative_mood_count >= 3
    except Exception as exc:
        print(f"Peer support suggestion check failed: {exc}")
    if crisis_keyword_hits:
        peer_support_suggested = True

    helpline_info = get_helpline_for_language(request_data.language or detected_language) if crisis_keyword_hits else None

    return ChatMessageResponse(
        message=final_text,
        language=target_language,
        detectedLanguage=detected_language,
        translationApplied=translation_to_en_applied or translation_back_applied,
        peerSupportSuggested=peer_support_suggested,
        crisisKeywords=crisis_keyword_hits or None,
        helpline=helpline_info,
    )


@app.post("/api/mood/tts", response_model=TextToSpeechResponse)
async def mood_text_to_speech(payload: TextToSpeechRequest):
    """Return a speech audio url for a given text in the user's language."""
    try:
        tts_result = await asyncio.to_thread(
            lingo_client.text_to_speech,
            payload.text,
            payload.language,
            payload.voice,
        )
        audio_url = tts_result.get("audioUrl") or tts_result.get("audio_url") or ""
        return TextToSpeechResponse(
            audioUrl=audio_url or "",
            language=payload.language,
        )
    except Exception as exc:
        print(f"TTS generation failed: {exc}")
        raise HTTPException(status_code=500, detail="Unable to generate speech audio.")


@app.post("/api/support/sms", response_model=SupportSMSResponse)
async def send_support_sms(payload: SupportSMSRequest):
    """Stubbed endpoint to simulate sending crisis support SMS notifications."""
    phone = payload.phone or "demo-recipient"
    language = payload.language or DEFAULT_ANALYSIS_LANGUAGE
    message = payload.message or "MoodFlow support check-in. We're here for you."
    print(f"[SMS STUB] outbound -> phone={phone} lang={language} message={message}")
    return SupportSMSResponse(
        success=True,
        detail="Support SMS queued (stubbed for demo).",
    )


@app.post("/api/peers/match", response_model=PeerSupportResponse)
async def request_peer_support(request_data: PeerSupportRequest):
    """Stubbed peer support match maker."""
    try:
        match = await storage.get_peer_match(request_data.language)
        session_id = await storage.create_peer_session(request_data.userId, match)

        intro_original = match.introduction or "Hello! Excited to connect with you."
        intro_translated = intro_original
        translated_from = None

        target_language = request_data.language or DEFAULT_ANALYSIS_LANGUAGE
        match_lang_norm = match.language.split("-")[0].lower()
        target_lang_norm = target_language.split("-")[0].lower()

        if target_lang_norm != match_lang_norm:
            try:
                translation = await asyncio.to_thread(
                    lingo_client.translate,
                    intro_original,
                    match.language,
                    target_language,
                )
                intro_translated = translation.get("text") or intro_original
                translated_from = match.language
            except Exception as exc:
                print(f"Peer intro translation failed: {exc}")
                intro_translated = intro_original

        intro_message = PeerChatMessage(
            sender="peer",
            text=intro_translated,
            language=target_language,
            translatedFrom=translated_from,
        )
        await storage.append_peer_message(session_id, intro_message)

        return PeerSupportResponse(
            sessionId=session_id,
            match=match,
            originalIntro=intro_original,
            translatedIntro=intro_translated if intro_translated != intro_original else None,
        )
    except Exception as exc:
        print(f"Peer match error: {exc}")
        raise HTTPException(status_code=500, detail="Unable to create peer match session.")


def contains_moderation_flag(text: str) -> bool:
    lowered = text.lower()
    return any(block in lowered for block in PEER_MODERATION_BLOCKLIST)


@app.post("/api/peers/chat", response_model=PeerChatResponse)
async def peer_chat_message(payload: PeerChatRequest):
    """Stubbed peer chat with translation and moderation."""
    session = await storage.get_peer_session(payload.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Peer session not found.")

    match: PeerMatch = session["match"]

    # Detect original language of user message
    detected_language = payload.language
    try:
        detection = await asyncio.to_thread(
            lingo_client.detect_language,
            payload.message,
        )
        detected_language = detection.get("language") or detected_language
    except Exception as exc:
        print(f"Peer chat detection failed: {exc}")

    # Translate user message into peer's language if needed
    user_text_for_peer = payload.message
    user_translated_from = None
    detected_norm = (detected_language or DEFAULT_ANALYSIS_LANGUAGE).split("-")[0].lower()
    match_lang_norm = match.language.split("-")[0].lower()

    if detected_norm != match_lang_norm:
        try:
            translation = await asyncio.to_thread(
                lingo_client.translate,
                payload.message,
                detected_language or DEFAULT_ANALYSIS_LANGUAGE,
                match.language,
            )
            user_text_for_peer = translation.get("text") or payload.message
            user_translated_from = detected_language
        except Exception as exc:
            print(f"Peer chat user translation failed: {exc}")
            user_text_for_peer = payload.message

    user_message = PeerChatMessage(
        sender="user",
        text=payload.message,
        language=payload.language,
        translatedFrom=user_translated_from,
    )
    await storage.append_peer_message(payload.sessionId, user_message)

    moderation_flagged = contains_moderation_flag(payload.message)
    moderation_message = None

    if moderation_flagged:
        moderation_message = (
            "A moderator has flagged parts of this message. Please keep the space compassionate."
        )

    # Compose peer reply (stubbed)
    peer_reply_en = random.choice(PEER_REPLY_TEMPLATES)
    if moderation_flagged:
        peer_reply_en = (
            "I hear that you’re going through a lot. Let’s focus on keeping this conversation safe and kind."
        )

    # Translate peer reply to match's language if needed
    peer_reply_in_match_lang = peer_reply_en
    if match_lang_norm != "en":
        try:
            translation = await asyncio.to_thread(
                lingo_client.translate,
                peer_reply_en,
                "en",
                match.language,
            )
            peer_reply_in_match_lang = translation.get("text") or peer_reply_en
        except Exception as exc:
            print(f"Peer reply translation to match language failed: {exc}")
            peer_reply_in_match_lang = peer_reply_en

    # Translate peer reply back to user language
    peer_reply_for_user = peer_reply_in_match_lang
    translated_from_lang = None
    target_lang_norm = payload.language.split("-")[0].lower()
    if target_lang_norm != match_lang_norm:
        try:
            translation = await asyncio.to_thread(
                lingo_client.translate,
                peer_reply_in_match_lang,
                match.language,
                payload.language,
            )
            peer_reply_for_user = translation.get("text") or peer_reply_in_match_lang
            translated_from_lang = match.language
        except Exception as exc:
            print(f"Peer reply translation back failed: {exc}")
            peer_reply_for_user = peer_reply_in_match_lang

    peer_message = PeerChatMessage(
        sender="peer",
        text=peer_reply_for_user,
        language=payload.language,
        translatedFrom=translated_from_lang,
        flagged=moderation_flagged,
    )
    await storage.append_peer_message(payload.sessionId, peer_message)

    return PeerChatResponse(
        sessionId=payload.sessionId,
        userMessage=user_message,
        peerMessage=peer_message,
        moderation=moderation_message,
    )


@app.get("/api/peers/session/{session_id}")
async def get_peer_session(session_id: str, userId: str = Query(default="default")):
    session = await storage.get_peer_session(session_id)
    if not session or session.get("userId") != userId:
        raise HTTPException(status_code=404, detail="Peer session not found.")
    return {
        "sessionId": session_id,
        "match": session["match"],
        "messages": session["messages"],
    }


# Get latest mood
@app.get("/api/mood/latest")
async def get_latest_mood(userId: str = Query(default="default")):
    """Get the latest mood entry for a user."""
    try:
        latest_mood = await storage.get_latest_mood(userId)
        if not latest_mood:
            raise HTTPException(status_code=404, detail="No mood entries found")
        return latest_mood
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error")

# Get mood history
@app.get("/api/mood/history")
async def get_mood_history(userId: str = Query(default="default"), limit: int = Query(default=10)):
    """Get mood history for a user."""
    try:
        history = await storage.get_mood_history(userId, limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error")

# Get tasks by mood
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks(mood: Optional[str] = Query(default=None)):
    """Get tasks, optionally filtered by mood."""
    try:
        if not mood:
            tasks = await storage.get_all_tasks()
            return tasks
        
        # Validate mood
        from models import MoodType
        try:
            mood_type = MoodType(mood)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mood type")
        
        tasks = await storage.get_tasks_by_mood(mood_type)
        if not tasks:
            # Fallback to neutral or any tasks if none for mood
            try:
                neutral = await storage.get_tasks_by_mood(MoodType.NEUTRAL)
                if neutral:
                    return neutral
            except Exception:
                pass
            return await storage.get_all_tasks()
        return tasks
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error")

# Update task completion
@app.patch("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update task completion status."""
    try:
        task = await storage.update_task_completion(task_id, task_update.completed)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid request")

# Create task
@app.post("/api/tasks", response_model=Task)
async def create_task(task_data: TaskCreate):
    """Create a new task."""
    try:
        task = await storage.create_task(task_data)
        return task
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid request")

# Get user settings
@app.get("/api/settings")
async def get_settings(userId: str = Query(default="default")):
    """Get user settings."""
    try:
        settings = await storage.get_user_settings(userId)
        if not settings:
            # Return default settings
            return {
                "webcamConsent": False,
                "localOnlyProcessing": True,
                "dataLogging": True,
                "preferredLanguage": "en",
            }
        
        return {
            "webcamConsent": settings.webcamConsent,
            "localOnlyProcessing": settings.localOnlyProcessing,
            "dataLogging": settings.dataLogging,
            "preferredLanguage": settings.preferredLanguage or "en",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error")

# Update user settings
@app.patch("/api/settings")
async def update_settings(settings_update: UserSettingsUpdate, userId: str = Query(default="default")):
    """Update user settings."""
    try:
        settings = await storage.update_user_settings(userId, settings_update)
        return {
            "webcamConsent": settings.webcamConsent,
            "localOnlyProcessing": settings.localOnlyProcessing,
            "dataLogging": settings.dataLogging,
            "preferredLanguage": settings.preferredLanguage or "en",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid request")

# Get meal recommendations by mood
@app.get("/api/meals")
async def get_meal_recommendations(mood: Optional[str] = Query(default=None)):
    """Get meal recommendations based on mood."""
    try:
        if not mood:
            # Return all meals if no mood specified
            all_meals = []
            for mood_meals in MEAL_RECOMMENDATIONS.values():
                all_meals.extend(mood_meals)
            return all_meals
        
        # Validate mood
        try:
            mood_type = MoodType(mood)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mood type")
        
        # Return meals for specific mood
        meals = MEAL_RECOMMENDATIONS.get(mood_type, [])
        return meals
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
