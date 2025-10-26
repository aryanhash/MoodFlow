import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeTextSentiment, mockFaceAnalysis, fuseMoodAnalysis } from "./moodAnalysis";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mood Detection API
  app.post("/api/mood/detect", async (req, res) => {
    try {
      const schema = z.object({
        text: z.string().min(1),
        useWebcam: z.boolean().optional(),
        userId: z.string().default("default"),
      });
      
      const { text, useWebcam, userId } = schema.parse(req.body);
      
      // Analyze text sentiment
      const textResult = analyzeTextSentiment(text);
      
      // Optionally analyze face (mocked)
      let faceResult;
      if (useWebcam) {
        faceResult = mockFaceAnalysis();
      }
      
      // Fuse the results
      const fusionResult = fuseMoodAnalysis(textResult, faceResult);
      
      // Save mood entry
      const moodEntry = await storage.createMoodEntry({
        userId,
        mood: fusionResult.mood,
        confidence: fusionResult.confidence,
        textInput: text,
        faceAnalysis: faceResult ? JSON.stringify(faceResult) : null,
      });
      
      res.json({
        mood: fusionResult.mood,
        confidence: fusionResult.confidence,
        sources: fusionResult.sources,
        entry: moodEntry,
      });
    } catch (error) {
      console.error("Error detecting mood:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Get latest mood
  app.get("/api/mood/latest", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default";
      const latestMood = await storage.getLatestMood(userId);
      
      if (!latestMood) {
        return res.status(404).json({ error: "No mood entries found" });
      }
      
      res.json(latestMood);
    } catch (error) {
      console.error("Error getting latest mood:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Get mood history
  app.get("/api/mood/history", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default";
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getMoodHistory(userId, limit);
      
      res.json(history);
    } catch (error) {
      console.error("Error getting mood history:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Get tasks by mood
  app.get("/api/tasks", async (req, res) => {
    try {
      const mood = req.query.mood as string;
      
      if (!mood) {
        const allTasks = await storage.getAllTasks();
        return res.json(allTasks);
      }
      
      const tasks = await storage.getTasksByMood(mood as any);
      res.json(tasks);
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Update task completion
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        completed: z.boolean(),
      });
      
      const { completed } = schema.parse(req.body);
      const task = await storage.updateTaskCompletion(id, completed);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Create task
  app.post("/api/tasks", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string().default("default"),
        title: z.string().min(1),
        duration: z.number().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]),
        mood: z.enum(["calm", "energized", "stressed", "focused", "neutral"]),
      });
      
      const taskData = schema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "default";
      const settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Return default settings
        return res.json({
          webcamConsent: false,
          localOnlyProcessing: true,
          dataLogging: true,
        });
      }
      
      res.json({
        webcamConsent: settings.webcamConsent === 1,
        localOnlyProcessing: settings.localOnlyProcessing === 1,
        dataLogging: settings.dataLogging === 1,
      });
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Update user settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string().default("default"),
        webcamConsent: z.boolean().optional(),
        localOnlyProcessing: z.boolean().optional(),
        dataLogging: z.boolean().optional(),
      });
      
      const { userId, webcamConsent, localOnlyProcessing, dataLogging } = schema.parse(req.body);
      
      const updates: any = {};
      if (webcamConsent !== undefined) updates.webcamConsent = webcamConsent ? 1 : 0;
      if (localOnlyProcessing !== undefined) updates.localOnlyProcessing = localOnlyProcessing ? 1 : 0;
      if (dataLogging !== undefined) updates.dataLogging = dataLogging ? 1 : 0;
      
      const settings = await storage.updateUserSettings(userId, updates);
      
      res.json({
        webcamConsent: settings.webcamConsent === 1,
        localOnlyProcessing: settings.localOnlyProcessing === 1,
        dataLogging: settings.dataLogging === 1,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
