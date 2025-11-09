from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum

class MoodType(str, Enum):
    CALM = "calm"
    ENERGIZED = "energized"
    STRESSED = "stressed"
    FOCUSED = "focused"
    NEUTRAL = "neutral"

class DifficultyType(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# User Models
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    
    class Config:
        from_attributes = True

# Mood Entry Models
class MoodEntryBase(BaseModel):
    userId: str = Field(default="default")
    mood: MoodType
    confidence: int = Field(ge=0, le=100)
    textInput: Optional[str] = None  # legacy field preserved for compatibility
    faceAnalysis: Optional[str] = None
    originalText: Optional[str] = None
    originalLanguage: Optional[str] = None
    translatedText: Optional[str] = None
    translatedLanguage: Optional[str] = None
    translationProvider: Optional[str] = None
    crisisFlag: bool = False
    crisisKeywords: Optional[List[str]] = None
    crisisReasons: Optional[List[str]] = None
    negativeMoodStreak: Optional[int] = None
    helplineCode: Optional[str] = None
    helplineName: Optional[str] = None
    helplinePhone: Optional[str] = None
    helplineUrl: Optional[str] = None
    helplineLanguage: Optional[str] = None

class MoodEntryCreate(MoodEntryBase):
    pass

class MoodEntry(MoodEntryBase):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Task Models
class TaskBase(BaseModel):
    userId: str = Field(default="default")
    title: str
    duration: int = Field(gt=0)
    difficulty: DifficultyType
    mood: MoodType

class TaskCreate(TaskBase):
    completed: Optional[int] = Field(default=0, ge=0, le=1)

class Task(TaskBase):
    id: str
    completed: int
    
    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    completed: bool

# User Settings Models
class UserSettingsBase(BaseModel):
    userId: str = Field(default="default")
    webcamConsent: bool = False
    localOnlyProcessing: bool = True
    dataLogging: bool = True
    preferredLanguage: Optional[str] = Field(default="en")

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    id: str
    
    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    webcamConsent: Optional[bool] = None
    localOnlyProcessing: Optional[bool] = None
    dataLogging: Optional[bool] = None
    preferredLanguage: Optional[str] = None

# Mood Detection Models
class MoodDetectionRequest(BaseModel):
    text: str = Field(min_length=0)  # Allow empty text for camera-only detection
    useWebcam: Optional[bool] = False
    userId: str = Field(default="default")
    imageData: Optional[str] = None
    preferredLanguage: Optional[str] = None

class TextSentimentResult(BaseModel):
    mood: MoodType
    confidence: int

class FaceAnalysisResult(BaseModel):
    mood: MoodType
    confidence: int

class MoodFusionResult(BaseModel):
    mood: MoodType
    confidence: int
    sources: dict

class MoodDetectionResponse(BaseModel):
    mood: MoodType
    confidence: int
    sources: dict
    entry: MoodEntry
    originalText: Optional[str] = None
    originalLanguage: Optional[str] = None
    translatedText: Optional[str] = None
    translatedLanguage: Optional[str] = None
    localizedMessage: Optional[str] = None
    localizedLanguage: Optional[str] = None
    translationApplied: bool = False
    crisis: Optional["CrisisSummary"] = None


class ChatMessageRequest(BaseModel):
    message: str
    userId: str = Field(default="default")
    language: Optional[str] = None


class ChatMessageResponse(BaseModel):
    message: str
    language: str
    detectedLanguage: Optional[str] = None
    translationApplied: bool = False
    peerSupportSuggested: bool = False
    crisisKeywords: Optional[List[str]] = None
    helpline: Optional["HelplineInfo"] = None


class PeerSupportRequest(BaseModel):
    userId: str = Field(default="default")
    language: Optional[str] = None
    mood: Optional[MoodType] = None
    experiences: Optional[List[str]] = None


class PeerMatch(BaseModel):
    matchId: str
    displayName: str
    language: str
    availability: str
    sharedExperiences: List[str] = []
    timeZone: Optional[str] = None
    avatarColor: Optional[str] = None
    introduction: Optional[str] = None


class PeerSupportResponse(BaseModel):
    sessionId: str
    match: PeerMatch
    originalIntro: Optional[str] = None
    translatedIntro: Optional[str] = None


class PeerChatMessage(BaseModel):
    sender: Literal["user", "peer", "moderator"]
    text: str
    language: str
    translatedFrom: Optional[str] = None
    flagged: bool = False


class PeerChatRequest(BaseModel):
    sessionId: str
    message: str
    language: str


class PeerChatResponse(BaseModel):
    sessionId: str
    userMessage: PeerChatMessage
    peerMessage: PeerChatMessage
    moderation: Optional[str] = None


class TextToSpeechRequest(BaseModel):
    text: str
    language: str = Field(default="en", min_length=2, max_length=12)
    voice: Optional[str] = None


class TextToSpeechResponse(BaseModel):
    audioUrl: str
    language: str


class HelplineInfo(BaseModel):
    code: str
    name: str
    phone: str
    url: Optional[str] = None
    language: Optional[str] = None


class CrisisSummary(BaseModel):
    triggered: bool = False
    reasons: List[str] = []
    keywords: List[str] = []
    negativeMoodStreak: int = 0
    helpline: Optional[HelplineInfo] = None


class SupportSMSRequest(BaseModel):
    phone: Optional[str] = None
    message: Optional[str] = None
    language: Optional[str] = None


class SupportSMSResponse(BaseModel):
    success: bool
    detail: str


MoodDetectionResponse.model_rebuild()
ChatMessageResponse.model_rebuild()
PeerSupportResponse.model_rebuild()
PeerChatResponse.model_rebuild()

# Error Models
class ErrorResponse(BaseModel):
    error: str


