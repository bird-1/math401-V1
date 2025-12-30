
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  async analyzeQuestions(files: FileData[]): Promise<AnalysisResult> {
    // 实例化 AI 客户端，API_KEY 由 index.html 中的脚本或环境变量注入
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const syllabusStr = JSON.stringify(SYLLABUS, null, 2);
    const prompt = ANALYSIS_PROMPT(syllabusStr);

    const parts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.base64.split(',')[1]
      }
    }));

    // 使用高精度模型 gemini-3-pro-preview 进行教研级分析
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
            coveredTopics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "覆盖的单元ID"
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
          required: ["coveredTopics", "missingTopics", "overallScore", "aiCommentary", "questionCount"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 未返回分析结果，请确认图片是否包含清晰的数学题目。");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("解析 JSON 失败:", text);
      throw new Error("报告格式解析异常，请重新尝试分析。");
    }
  }
}
