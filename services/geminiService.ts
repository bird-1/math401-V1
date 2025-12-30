
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  async analyzeQuestions(files: FileData[]): Promise<AnalysisResult> {
    // 安全获取 API Key
    const apiKey = (globalThis as any).process?.env?.API_KEY;
    
    if (!apiKey || apiKey.includes('AIza') === false) {
      throw new Error("检测到 API Key 配置异常。请确保 index.html 中的 API_KEY 已替换为您的有效密钥。");
    }

    const ai = new GoogleGenAI({ apiKey });
    const syllabusStr = JSON.stringify(SYLLABUS, null, 2);
    const prompt = ANALYSIS_PROMPT(syllabusStr);

    const parts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.base64.split(',')[1]
      }
    }));

    try {
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

      return JSON.parse(text);
    } catch (e: any) {
      // 透传底层错误便于调试
      console.error("Gemini API Error:", e);
      throw new Error(e.message || "分析请求失败，请检查网络或 API Key 状态。");
    }
  }
}
