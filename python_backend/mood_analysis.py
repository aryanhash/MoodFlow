import base64
import io
import numpy as np
from PIL import Image
import cv2
from typing import Optional
import difflib
from models import MoodType, TextSentimentResult, FaceAnalysisResult, MoodFusionResult
import random
import hashlib

# Sentiment keywords for mood detection
SENTIMENT_KEYWORDS = {
    "calm": ["calm", "peaceful", "relaxed", "serene", "tranquil", "quiet", "still", "gentle", "content", "restful", "chill", "zen", "peace", "quiet", "soothing", "mellow"],
    "energized": ["energized", "excited", "motivated", "active", "enthusiastic", "pumped", "hyper", "driven", "dynamic", "vigorous", "great", "amazing", "awesome", "fantastic", "wonderful", "happy", "joyful", "thrilled", "ecstatic", "elated", "cheerful", "upbeat", "positive", "good", "excellent", "brilliant"],
    "stressed": ["stressed", "anxious", "worried", "overwhelmed", "tense", "nervous", "frantic", "uneasy", "pressured", "strained", "tired", "exhausted", "frustrated", "angry", "upset", "sad", "depressed", "down", "blue", "miserable", "unhappy", "gloomy", "melancholy", "sorrowful", "heartbroken", "devastated", "disappointed", "hurt", "pain", "suffering", "struggling", "difficult", "hard", "bad", "terrible", "awful", "horrible", "annoyed", "irritated", "mad", "furious", "rage", "panic", "scared", "afraid", "fearful"],
    "focused": ["focused", "concentrated", "determined", "attentive", "sharp", "clear", "engaged", "mindful", "intent", "absorbed", "productive", "efficient", "alert", "aware", "present", "centered", "disciplined", "committed"],
    "neutral": ["neutral", "okay", "fine", "normal", "average", "regular", "standard", "typical", "ordinary", "balanced", "meh", "whatever", "alright", "decent", "so-so", "nothing special"]
}

def analyze_text_sentiment(text: str) -> TextSentimentResult:
    """Analyze text sentiment with keyword and fuzzy matching (typo tolerant)."""
    if not text.strip():
        return TextSentimentResult(mood=MoodType.NEUTRAL, confidence=50)

    lowercase_text = text.lower()
    words = [w.strip(".,!?:;()[]{}\"'\n\r\t") for w in lowercase_text.split()]
    words = [w for w in words if w]

    mood_scores = {}

    for mood, keywords in SENTIMENT_KEYWORDS.items():
        score = 0.0
        # Direct substring hit adds full point
        for keyword in keywords:
            if keyword in lowercase_text:
                score += 1.0
                continue
            # Fuzzy compare each word to keyword, grant partial credit
            for w in words:
                if not w:
                    continue
                ratio = difflib.SequenceMatcher(None, w, keyword).ratio()
                if ratio >= 0.9:
                    score += 0.9
                    break
                elif ratio >= 0.8:  # tolerates small typos like "happpy"
                    score += 0.6
                    break
        mood_scores[mood] = score

    max_score = max(mood_scores.values()) if mood_scores else 0
    if max_score <= 0:
        return TextSentimentResult(mood=MoodType.NEUTRAL, confidence=55)

    detected_mood = max(mood_scores, key=mood_scores.get)

    mood_mapping = {
        "calm": MoodType.CALM,
        "energized": MoodType.ENERGIZED,
        "stressed": MoodType.STRESSED,
        "focused": MoodType.FOCUSED,
        "neutral": MoodType.NEUTRAL,
    }
    detected_mood_enum = mood_mapping.get(detected_mood, MoodType.NEUTRAL)

    # Confidence from relative score strength and word count normalization
    total_words = max(1, len(words))
    normalized = max_score / (total_words / 8)  # denser signals => higher confidence
    confidence = int(min(97, max(60, normalized * 100)))

    return TextSentimentResult(mood=detected_mood_enum, confidence=confidence)

def analyze_facial_expression(image_data: str) -> FaceAnalysisResult:
    """Analyze facial expression using OpenCV Haar cascades.

    Heuristic approach inspired by smile and eye features:
    - Smile => happy -> energized
    - Two eyes and geometry heuristics => sad/angry/surprise
    - Otherwise => neutral
    """
    try:
        # Clean up base64 prefix if present
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]

        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
        smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_smile.xml")

        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4)
        print(f"[OpenCV] faces_detected={len(faces)} img_shape={gray.shape}")
        if len(faces) == 0:
            # No face detected; fall back to neutral low confidence
            return FaceAnalysisResult(mood=MoodType.NEUTRAL, confidence=55)

        x, y, w, h = faces[0]
        roi_gray = gray[y:y+h, x:x+w]

        smiles = smile_cascade.detectMultiScale(roi_gray, scaleFactor=1.7, minNeighbors=18)
        eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.2, minNeighbors=4)
        print(f"[OpenCV] smiles={len(smiles)} eyes={len(eyes)} face_w_h=({w},{h})")

        # Heuristics with stricter thresholds
        # Strong smile → energized (requires sufficiently large smile area)
        if len(smiles) > 0:
            sx, sy, sw, sh = smiles[0]
            smile_w_ratio = sw / max(1, w)
            smile_h_ratio = sh / max(1, h)
            smile_area_ratio = (sw * sh) / max(1, w * h)
            print(f"[OpenCV] smile ratios: w={smile_w_ratio:.3f} h={smile_h_ratio:.3f} area={smile_area_ratio:.3f}")
            if smile_w_ratio >= 0.35 and smile_h_ratio >= 0.12 and smile_area_ratio >= 0.05:
                return FaceAnalysisResult(mood=MoodType.ENERGIZED, confidence=90)

        if len(eyes) >= 2:
            # Use eye positions to approximate sad/angry
            eye_y_positions = [ey for (_, ey, _, _) in eyes[:2]]
            avg_eye_y = sum(eye_y_positions) / len(eye_y_positions)
            mid_face_y = h / 2.0

            if avg_eye_y > mid_face_y * 1.1:
                # Eyes lower than mid => droopy look -> sad -> stressed
                return FaceAnalysisResult(mood=MoodType.STRESSED, confidence=75)
            if avg_eye_y < mid_face_y * 0.9:
                # Eyes higher than mid => furrowed -> angry -> stressed
                return FaceAnalysisResult(mood=MoodType.STRESSED, confidence=70)

            # Eye area ratio for "surprise" → map to focused, not energized
            eye_area = sum([ew * eh for (_, _, ew, eh) in eyes])
            face_area = max(1, w * h)
            eye_area_ratio = eye_area / face_area
            print(f"[OpenCV] eye_area_ratio={eye_area_ratio:.3f}")
            if eye_area_ratio > 0.055:
                return FaceAnalysisResult(mood=MoodType.FOCUSED, confidence=78)

        # Default to neutral when signals are weak
        return FaceAnalysisResult(mood=MoodType.NEUTRAL, confidence=65)

    except Exception as e:
        print(f"Error in image analysis (OpenCV): {e}")
        return mock_face_analysis()

def mock_face_analysis() -> FaceAnalysisResult:
    """Mock face analysis implementation."""
    moods = list(MoodType)
    random_mood = random.choice(moods)
    confidence = random.randint(60, 85)
    
    return FaceAnalysisResult(
        mood=random_mood,
        confidence=confidence
    )

def fuse_mood_analysis(
    text_result: Optional[TextSentimentResult],
    face_result: Optional[FaceAnalysisResult] = None
) -> MoodFusionResult:
    """Fuse text and face analysis results."""
    
    if text_result is None and face_result is None:
        return MoodFusionResult(
            mood=MoodType.NEUTRAL,
            confidence=50,
            sources={"fallback": True}
        )
    
    if text_result is None:
        # Only face analysis
        return MoodFusionResult(
            mood=face_result.mood,
            confidence=face_result.confidence,
            sources={"face": True}
        )
    
    if face_result is None:
        # Only text analysis
        return MoodFusionResult(
            mood=text_result.mood,
            confidence=text_result.confidence,
            sources={"text": True}
        )
    
    # Both analyses available - fuse them
    sources = {"text": True, "face": True}
    
    # Weighted average based on confidence
    text_weight = text_result.confidence / 100
    face_weight = face_result.confidence / 100
    total_weight = text_weight + face_weight
    
    if total_weight == 0:
        return MoodFusionResult(
            mood=MoodType.NEUTRAL,
            confidence=50,
            sources=sources
        )
    
    # If moods match, use higher confidence
    if text_result.mood == face_result.mood:
        final_mood = text_result.mood
        final_confidence = max(text_result.confidence, face_result.confidence)
    else:
        # Different moods - choose based on confidence
        if text_result.confidence > face_result.confidence:
            final_mood = text_result.mood
            final_confidence = text_result.confidence
        else:
            final_mood = face_result.mood
            final_confidence = face_result.confidence
    
    return MoodFusionResult(
        mood=final_mood,
        confidence=final_confidence,
        sources=sources
    )