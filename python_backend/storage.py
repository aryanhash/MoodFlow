from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
from models import (
    User,
    UserCreate,
    MoodEntry,
    MoodEntryCreate,
    Task,
    TaskCreate,
    TaskUpdate,
    UserSettings,
    UserSettingsCreate,
    UserSettingsUpdate,
    MoodType,
    DifficultyType,
    PeerMatch,
    PeerChatMessage,
)

class MemStorage:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.mood_entries: Dict[str, MoodEntry] = {}
        self.tasks: Dict[str, Task] = {}
        self.user_settings: Dict[str, UserSettings] = {}
        self.peer_profiles: List[PeerMatch] = []
        self.peer_sessions: Dict[str, Dict[str, any]] = {}
        self._seed_data()

    def _seed_data(self):
        """Seed the storage with initial data."""
        task_seed_data = [
            # Calm tasks
            {"userId": "default", "title": "Morning meditation and journaling", "duration": 15, "difficulty": DifficultyType.EASY, "mood": MoodType.CALM, "completed": 0},
            {"userId": "default", "title": "Review project documentation", "duration": 30, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.CALM, "completed": 0},
            {"userId": "default", "title": "Email responses and admin tasks", "duration": 20, "difficulty": DifficultyType.EASY, "mood": MoodType.CALM, "completed": 0},
            {"userId": "default", "title": "Organize workspace and files", "duration": 25, "difficulty": DifficultyType.EASY, "mood": MoodType.CALM, "completed": 0},
            {"userId": "default", "title": "Light reading and research", "duration": 40, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.CALM, "completed": 0},
            
            # Energized tasks
            {"userId": "default", "title": "Tackle challenging coding problem", "duration": 90, "difficulty": DifficultyType.HARD, "mood": MoodType.ENERGIZED, "completed": 0},
            {"userId": "default", "title": "Brainstorm new project ideas", "duration": 45, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.ENERGIZED, "completed": 0},
            {"userId": "default", "title": "Team collaboration meeting", "duration": 60, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.ENERGIZED, "completed": 0},
            {"userId": "default", "title": "Learn new technology or framework", "duration": 75, "difficulty": DifficultyType.HARD, "mood": MoodType.ENERGIZED, "completed": 0},
            {"userId": "default", "title": "Creative design work", "duration": 50, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.ENERGIZED, "completed": 0},
            
            # Stressed tasks
            {"userId": "default", "title": "Simple file organization", "duration": 15, "difficulty": DifficultyType.EASY, "mood": MoodType.STRESSED, "completed": 0},
            {"userId": "default", "title": "Take a short walk outside", "duration": 10, "difficulty": DifficultyType.EASY, "mood": MoodType.STRESSED, "completed": 0},
            {"userId": "default", "title": "Listen to calming music", "duration": 20, "difficulty": DifficultyType.EASY, "mood": MoodType.STRESSED, "completed": 0},
            {"userId": "default", "title": "Gentle stretching exercises", "duration": 15, "difficulty": DifficultyType.EASY, "mood": MoodType.STRESSED, "completed": 0},
            {"userId": "default", "title": "Clear inbox - simple replies only", "duration": 25, "difficulty": DifficultyType.EASY, "mood": MoodType.STRESSED, "completed": 0},
            
            # Focused tasks
            {"userId": "default", "title": "Deep work: Write comprehensive report", "duration": 120, "difficulty": DifficultyType.HARD, "mood": MoodType.FOCUSED, "completed": 0},
            {"userId": "default", "title": "Code review and refactoring", "duration": 60, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.FOCUSED, "completed": 0},
            {"userId": "default", "title": "Strategic planning session", "duration": 90, "difficulty": DifficultyType.HARD, "mood": MoodType.FOCUSED, "completed": 0},
            {"userId": "default", "title": "Complex problem-solving task", "duration": 75, "difficulty": DifficultyType.HARD, "mood": MoodType.FOCUSED, "completed": 0},
            {"userId": "default", "title": "Detailed analysis and research", "duration": 80, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.FOCUSED, "completed": 0},
            
            # Neutral tasks
            {"userId": "default", "title": "Routine tasks and follow-ups", "duration": 30, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.NEUTRAL, "completed": 0},
            {"userId": "default", "title": "Read industry articles", "duration": 25, "difficulty": DifficultyType.EASY, "mood": MoodType.NEUTRAL, "completed": 0},
            {"userId": "default", "title": "Update project tracker", "duration": 15, "difficulty": DifficultyType.EASY, "mood": MoodType.NEUTRAL, "completed": 0},
            {"userId": "default", "title": "Review meeting notes", "duration": 20, "difficulty": DifficultyType.EASY, "mood": MoodType.NEUTRAL, "completed": 0},
            {"userId": "default", "title": "Plan tomorrow's schedule", "duration": 30, "difficulty": DifficultyType.MEDIUM, "mood": MoodType.NEUTRAL, "completed": 0},
        ]
        
        for task_data in task_seed_data:
            task_id = str(uuid.uuid4())
            self.tasks[task_id] = Task(
                id=task_id,
                **task_data
            )
        
        # Default settings
        default_settings = UserSettings(
            id=str(uuid.uuid4()),
            userId="default",
            webcamConsent=False,
            localOnlyProcessing=True,
            dataLogging=True,
            preferredLanguage="en"
        )
        self.user_settings["default"] = default_settings

        # Seed peer profiles
        self.peer_profiles = [
            PeerMatch(
                matchId="peer-ava",
                displayName="Ava",
                language="en",
                availability="Online now",
                sharedExperiences=["burnout recovery", "tech industry", "mindfulness"],
                timeZone="UTC-5",
                avatarColor="#8b5cf6",
                introduction="Hey there! I’ve been through burnout while working in tech. Happy to share what helped me bounce back."
            ),
            PeerMatch(
                matchId="peer-raj",
                displayName="Raj",
                language="hi",
                availability="Available in evenings",
                sharedExperiences=["family stress", "meditation", "career transition"],
                timeZone="UTC+5:30",
                avatarColor="#ec4899",
                introduction="नमस्ते! मैंने करियर बदलते समय बहुत तनाव झेला है। अगर आप बात करना चाहें तो मैं यहाँ हूँ।"
            ),
            PeerMatch(
                matchId="peer-lucia",
                displayName="Lucía",
                language="es",
                availability="Usually online weekends",
                sharedExperiences=["anxiety management", "creative pursuits", "community volunteering"],
                timeZone="UTC+1",
                avatarColor="#f97316",
                introduction="¡Hola! Compartir con otras personas creativas me ayudó muchísimo a manejar la ansiedad. Te escucho."
            ),
        ]

    # User methods
    async def get_user(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    async def get_user_by_username(self, username: str) -> Optional[User]:
        for user in self.users.values():
            if user.username == username:
                return user
        return None

    async def create_user(self, user_data: UserCreate) -> User:
        user_id = str(uuid.uuid4())
        user = User(id=user_id, **user_data.dict())
        self.users[user_id] = user
        return user

    # Mood methods
    async def create_mood_entry(self, entry_data: MoodEntryCreate) -> MoodEntry:
        entry_id = str(uuid.uuid4())
        entry = MoodEntry(
            id=entry_id,
            timestamp=datetime.now(),
            **entry_data.dict()
        )
        self.mood_entries[entry_id] = entry
        return entry

    async def get_mood_history(self, user_id: str, limit: int = 10) -> List[MoodEntry]:
        entries = [
            entry for entry in self.mood_entries.values()
            if entry.userId == user_id
        ]
        entries.sort(key=lambda x: x.timestamp, reverse=True)
        return entries[:limit]

    async def get_latest_mood(self, user_id: str) -> Optional[MoodEntry]:
        history = await self.get_mood_history(user_id, 1)
        return history[0] if history else None

    async def count_recent_negative_moods(self, user_id: str, limit: int = 10) -> int:
        """Count recent moods considered negative (e.g. stressed)."""
        history = await self.get_mood_history(user_id, limit)
        negative_moods = {MoodType.STRESSED}
        return sum(1 for entry in history if entry.mood in negative_moods)

    async def get_mood_entries_since(self, user_id: str, since: datetime) -> List[MoodEntry]:
        entries = [
            entry
            for entry in self.mood_entries.values()
            if entry.userId == user_id and entry.timestamp >= since
        ]
        entries.sort(key=lambda x: x.timestamp, reverse=True)
        return entries

    async def count_negative_moods_since(
        self,
        user_id: str,
        since: datetime,
        min_confidence: int = 80,
    ) -> int:
        entries = await self.get_mood_entries_since(user_id, since)
        return sum(
            1
            for entry in entries
            if entry.mood == MoodType.STRESSED and entry.confidence >= min_confidence
        )

    # Peer support methods
    async def get_peer_match(self, preferred_language: Optional[str] = None) -> PeerMatch:
        if preferred_language:
            lang = preferred_language.split("-")[0].lower()
            for profile in self.peer_profiles:
                if profile.language.lower().startswith(lang):
                    return profile
        # fallback to first profile
        return self.peer_profiles[0]

    async def create_peer_session(self, user_id: str, match: PeerMatch) -> str:
        session_id = str(uuid.uuid4())
        self.peer_sessions[session_id] = {
            "userId": user_id,
            "match": match,
            "messages": [],
        }
        return session_id

    async def append_peer_message(
        self,
        session_id: str,
        message: PeerChatMessage,
    ) -> None:
        session = self.peer_sessions.get(session_id)
        if not session:
            raise ValueError("Session not found")
        session["messages"].append(message)

    async def get_peer_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.peer_sessions.get(session_id)

    # Task methods
    async def get_all_tasks(self) -> List[Task]:
        return list(self.tasks.values())

    async def get_tasks_by_mood(self, mood: MoodType) -> List[Task]:
        tasks = [task for task in self.tasks.values() if task.mood == mood]
        import random
        random.shuffle(tasks)
        return tasks

    async def create_task(self, task_data: TaskCreate) -> Task:
        task_id = str(uuid.uuid4())
        task = Task(id=task_id, **task_data.dict())
        self.tasks[task_id] = task
        return task

    async def update_task_completion(self, task_id: str, completed: bool) -> Optional[Task]:
        task = self.tasks.get(task_id)
        if task:
            task.completed = 1 if completed else 0
            self.tasks[task_id] = task
            return task
        return None

    # Settings methods
    async def get_user_settings(self, user_id: str) -> Optional[UserSettings]:
        return self.user_settings.get(user_id)

    async def update_user_settings(self, user_id: str, updates: UserSettingsUpdate) -> UserSettings:
        settings = self.user_settings.get(user_id)
        
        if not settings:
            settings = UserSettings(
                id=str(uuid.uuid4()),
                userId=user_id,
                webcamConsent=False,
                localOnlyProcessing=True,
                dataLogging=True,
                preferredLanguage="en"
            )
        
        # Update fields if provided
        update_dict = updates.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(settings, field, value)
        
        self.user_settings[user_id] = settings
        return settings

# Global storage instance
storage = MemStorage()
