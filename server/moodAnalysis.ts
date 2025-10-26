import { MoodType } from "@shared/schema";

interface TextSentimentResult {
  mood: MoodType;
  confidence: number;
}

interface FaceAnalysisResult {
  mood: MoodType;
  confidence: number;
}

interface MoodFusionResult {
  mood: MoodType;
  confidence: number;
  sources: {
    text?: TextSentimentResult;
    face?: FaceAnalysisResult;
  };
}

const sentimentKeywords = {
  calm: ["calm", "peaceful", "relaxed", "serene", "tranquil", "quiet", "still", "gentle", "content", "restful"],
  energized: ["energized", "excited", "motivated", "active", "enthusiastic", "pumped", "hyper", "driven", "dynamic", "vigorous"],
  stressed: ["stressed", "anxious", "worried", "overwhelmed", "tense", "nervous", "frantic", "uneasy", "pressured", "strained"],
  focused: ["focused", "concentrated", "determined", "attentive", "sharp", "clear", "engaged", "mindful", "intent", "absorbed"],
  neutral: ["okay", "fine", "normal", "alright", "regular", "steady", "balanced", "moderate", "even"],
};

export function analyzeTextSentiment(text: string): TextSentimentResult {
  const lowercaseText = text.toLowerCase();
  const moodScores: Record<MoodType, number> = {
    calm: 0,
    energized: 0,
    stressed: 0,
    focused: 0,
    neutral: 0,
  };
  
  // Count keyword matches for each mood
  for (const [mood, keywords] of Object.entries(sentimentKeywords)) {
    keywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        moodScores[mood as MoodType] += 1;
      }
    });
  }
  
  // Check for negations to detect stressed mood
  if (lowercaseText.includes("not") || lowercaseText.includes("don't") || lowercaseText.includes("can't")) {
    moodScores.stressed += 0.5;
  }
  
  // Check for positive indicators
  if (lowercaseText.includes("great") || lowercaseText.includes("awesome") || lowercaseText.includes("happy")) {
    moodScores.energized += 1;
  }
  
  // Check for negative indicators
  if (lowercaseText.includes("tired") || lowercaseText.includes("exhausted") || lowercaseText.includes("bad")) {
    moodScores.stressed += 1;
  }
  
  // Find the mood with highest score
  let detectedMood: MoodType = "neutral";
  let maxScore = 0;
  
  for (const [mood, score] of Object.entries(moodScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood as MoodType;
    }
  }
  
  // Calculate confidence based on score strength
  const totalWords = lowercaseText.split(/\s+/).length;
  const confidence = Math.min(95, Math.max(60, (maxScore / Math.max(1, totalWords / 10)) * 100));
  
  return {
    mood: detectedMood,
    confidence: Math.round(confidence),
  };
}

export function mockFaceAnalysis(): FaceAnalysisResult {
  // Mock implementation - in real app, this would use face-api.js
  const moods: MoodType[] = ["calm", "energized", "stressed", "focused", "neutral"];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  const confidence = Math.floor(Math.random() * 20) + 70; // 70-90%
  
  return {
    mood: randomMood,
    confidence,
  };
}

export function fuseMoodAnalysis(
  textResult: TextSentimentResult,
  faceResult?: FaceAnalysisResult
): MoodFusionResult {
  if (!faceResult) {
    // Only text analysis available
    return {
      mood: textResult.mood,
      confidence: textResult.confidence,
      sources: { text: textResult },
    };
  }
  
  // Both text and face analysis available - use weighted average
  const textWeight = 0.6; // Text sentiment is slightly more reliable
  const faceWeight = 0.4;
  
  // If moods match, boost confidence
  if (textResult.mood === faceResult.mood) {
    const avgConfidence = (textResult.confidence * textWeight + faceResult.confidence * faceWeight);
    const boostedConfidence = Math.min(95, avgConfidence * 1.1);
    
    return {
      mood: textResult.mood,
      confidence: Math.round(boostedConfidence),
      sources: { text: textResult, face: faceResult },
    };
  }
  
  // Moods differ - pick the one with higher confidence
  const textScore = textResult.confidence * textWeight;
  const faceScore = faceResult.confidence * faceWeight;
  
  if (textScore > faceScore) {
    return {
      mood: textResult.mood,
      confidence: Math.round(textResult.confidence * 0.9), // Slight penalty for disagreement
      sources: { text: textResult, face: faceResult },
    };
  } else {
    return {
      mood: faceResult.mood,
      confidence: Math.round(faceResult.confidence * 0.9),
      sources: { text: textResult, face: faceResult },
    };
  }
}
