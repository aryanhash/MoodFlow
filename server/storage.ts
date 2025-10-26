import { 
  type User, 
  type InsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type Task,
  type InsertTask,
  type UserSettings,
  type InsertUserSettings,
  type MoodType,
  type DifficultyType
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mood methods
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodHistory(userId: string, limit?: number): Promise<MoodEntry[]>;
  getLatestMood(userId: string): Promise<MoodEntry | undefined>;
  
  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTasksByMood(mood: MoodType): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskCompletion(taskId: string, completed: boolean): Promise<Task | undefined>;
  
  // Settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private moodEntries: Map<string, MoodEntry>;
  private tasks: Map<string, Task>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.moodEntries = new Map();
    this.tasks = new Map();
    this.userSettings = new Map();
    
    this.seedData();
  }

  private seedData() {
    const taskSeedData: Array<Omit<Task, 'id'>> = [
      // Calm tasks
      { userId: "default", title: "Morning meditation and journaling", duration: 15, difficulty: "easy", mood: "calm", completed: 0 },
      { userId: "default", title: "Review project documentation", duration: 30, difficulty: "medium", mood: "calm", completed: 0 },
      { userId: "default", title: "Email responses and admin tasks", duration: 20, difficulty: "easy", mood: "calm", completed: 0 },
      { userId: "default", title: "Organize workspace and files", duration: 25, difficulty: "easy", mood: "calm", completed: 0 },
      { userId: "default", title: "Light reading and research", duration: 40, difficulty: "medium", mood: "calm", completed: 0 },
      
      // Energized tasks
      { userId: "default", title: "Tackle challenging coding problem", duration: 90, difficulty: "hard", mood: "energized", completed: 0 },
      { userId: "default", title: "Brainstorm new project ideas", duration: 45, difficulty: "medium", mood: "energized", completed: 0 },
      { userId: "default", title: "Team collaboration meeting", duration: 60, difficulty: "medium", mood: "energized", completed: 0 },
      { userId: "default", title: "Learn new technology or framework", duration: 75, difficulty: "hard", mood: "energized", completed: 0 },
      { userId: "default", title: "Creative design work", duration: 50, difficulty: "medium", mood: "energized", completed: 0 },
      
      // Stressed tasks
      { userId: "default", title: "Simple file organization", duration: 15, difficulty: "easy", mood: "stressed", completed: 0 },
      { userId: "default", title: "Take a short walk outside", duration: 10, difficulty: "easy", mood: "stressed", completed: 0 },
      { userId: "default", title: "Listen to calming music", duration: 20, difficulty: "easy", mood: "stressed", completed: 0 },
      { userId: "default", title: "Gentle stretching exercises", duration: 15, difficulty: "easy", mood: "stressed", completed: 0 },
      { userId: "default", title: "Clear inbox - simple replies only", duration: 25, difficulty: "easy", mood: "stressed", completed: 0 },
      
      // Focused tasks
      { userId: "default", title: "Deep work: Write comprehensive report", duration: 120, difficulty: "hard", mood: "focused", completed: 0 },
      { userId: "default", title: "Code review and refactoring", duration: 60, difficulty: "medium", mood: "focused", completed: 0 },
      { userId: "default", title: "Strategic planning session", duration: 90, difficulty: "hard", mood: "focused", completed: 0 },
      { userId: "default", title: "Complex problem-solving task", duration: 75, difficulty: "hard", mood: "focused", completed: 0 },
      { userId: "default", title: "Detailed analysis and research", duration: 80, difficulty: "medium", mood: "focused", completed: 0 },
      
      // Neutral tasks
      { userId: "default", title: "Routine tasks and follow-ups", duration: 30, difficulty: "medium", mood: "neutral", completed: 0 },
      { userId: "default", title: "Read industry articles", duration: 25, difficulty: "easy", mood: "neutral", completed: 0 },
      { userId: "default", title: "Update project tracker", duration: 15, difficulty: "easy", mood: "neutral", completed: 0 },
      { userId: "default", title: "Review meeting notes", duration: 20, difficulty: "easy", mood: "neutral", completed: 0 },
      { userId: "default", title: "Plan tomorrow's schedule", duration: 30, difficulty: "medium", mood: "neutral", completed: 0 },
    ];
    
    taskSeedData.forEach(task => {
      const id = randomUUID();
      this.tasks.set(id, { ...task, id });
    });
    
    const defaultSettings: UserSettings = {
      id: randomUUID(),
      userId: "default",
      webcamConsent: 0,
      localOnlyProcessing: 1,
      dataLogging: 1,
    };
    this.userSettings.set("default", defaultSettings);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = randomUUID();
    const entry: MoodEntry = {
      id,
      userId: insertEntry.userId,
      mood: insertEntry.mood,
      confidence: insertEntry.confidence,
      textInput: insertEntry.textInput ?? null,
      faceAnalysis: insertEntry.faceAnalysis ?? null,
      timestamp: new Date(),
    };
    this.moodEntries.set(id, entry);
    return entry;
  }

  async getMoodHistory(userId: string, limit: number = 10): Promise<MoodEntry[]> {
    const entries = Array.from(this.moodEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return entries;
  }

  async getLatestMood(userId: string): Promise<MoodEntry | undefined> {
    const history = await this.getMoodHistory(userId, 1);
    return history[0];
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByMood(mood: MoodType): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.mood === mood)
      .sort(() => Math.random() - 0.5); // Shuffle for variety
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      ...insertTask, 
      id,
      completed: insertTask.completed ?? 0
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskCompletion(taskId: string, completed: boolean): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.completed = completed ? 1 : 0;
      this.tasks.set(taskId, task);
      return task;
    }
    return undefined;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.userSettings.get(userId);
  }

  async updateUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings> {
    let settings = this.userSettings.get(userId);
    
    if (!settings) {
      const id = randomUUID();
      settings = {
        id,
        userId,
        webcamConsent: 0,
        localOnlyProcessing: 1,
        dataLogging: 1,
        ...updates,
      };
    } else {
      settings = { ...settings, ...updates };
    }
    
    this.userSettings.set(userId, settings);
    return settings;
  }
}

export const storage = new MemStorage();
