
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // FIX: Always use process.env.API_KEY directly as a hard requirement for initialization
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async analyzeQuestions(files: FileData[]): Promise<AnalysisResult> {
    const syllabusStr = JSON.stringify(SYLLABUS, null, 2);
    const prompt = ANALYSIS_PROMPT(syllabusStr);

    const parts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.base64.split(',')[1]
      }
    }));

    // FIX: Using gemini-3-pro-preview for complex text and multimodal reasoning tasks
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [...parts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coveredTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topicId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["topicId", "reason", "suggestion"]
              }
            },
            overallScore: { type: Type.NUMBER },
            aiCommentary: { type: Type.STRING },
            questionCount: { type: Type.NUMBER }
          },
          required: ["coveredTopics", "missingTopics", "overallScore", "aiCommentary", "questionCount"]
        }
      }
    });

    try {
      // FIX: Accessing .text as a property rather than a method call as per SDK guidelines
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      throw new Error("AI分析结果解析失败");
    }
  }
}
