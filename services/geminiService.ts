
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  async analyzeQuestions(files: FileData[]): Promise<AnalysisResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const syllabusStr = JSON.stringify(SYLLABUS, null, 2);
    const prompt = ANALYSIS_PROMPT(syllabusStr);

    const parts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.base64.split(',')[1]
      }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [...parts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topicId: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                },
                required: ["topicId", "score"]
              }
            },
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
          required: ["topicScores", "missingTopics", "overallScore", "aiCommentary", "questionCount"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 未返回有效分析数据。");

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("解析报告失败，请确保上传了清晰的题目。");
    }
  }
}
