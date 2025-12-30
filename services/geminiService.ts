
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  async analyzeQuestions(files: FileData[]): Promise<AnalysisResult> {
    // 严格遵循规范：直接使用 process.env.API_KEY
    // 系统环境会自动管理该变量，确保调用链路的安全与稳定
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("未检测到 API Key 环境。请确保运行环境已配置有效的 API_KEY。");
    }

    const ai = new GoogleGenAI({ apiKey });
    const syllabusStr = JSON.stringify(SYLLABUS, null, 2);
    const prompt = ANALYSIS_PROMPT(syllabusStr);

    // 将所有上传的文件（图片/PDF）转换为 AI 可读取的 Part 格式
    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.base64.split(',')[1] // 提取 Base64 纯净数据
      }
    }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ 
          parts: [
            ...fileParts, 
            { text: prompt }
          ] 
        }],
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

      // 获取并校验 AI 返回的结果
      const text = response.text;
      if (!text) throw new Error("AI 分析报告生成空值。");

      return JSON.parse(text);
    } catch (e: any) {
      console.error("Gemini SDK Analysis Error:", e);
      // 将具体的 API 错误透传给前端 UI
      throw new Error(e.message || "请求分析服务失败，请检查网络或 Key 权限。");
    }
  }
}
