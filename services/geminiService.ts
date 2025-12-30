
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // 优先从环境变量获取，这是标准生产规范
    // 如果您在本地下载运行，请确保您的构建工具（如 Vite/Webpack）已注入此变量
    // 或者临时将 process.env.API_KEY 替换为您的密钥字符串
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.error("【系统警告】未检测到有效的 API_KEY 环境配置。请检查 .env 文件或在 shell 中设置环境变量。");
      // 这里的兜底是为了防止应用完全崩溃，但 API 调用仍会失败，直到密钥被正确注入
    }

    this.ai = new GoogleGenAI({ apiKey: apiKey || "" });
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

    // 使用旗舰级模型 gemini-3-pro-preview
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
            coveredTopics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "识别出的已覆盖单元 ID 列表"
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
      throw new Error("AI 分析未能生成有效内容，请检查题目清晰度。");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON 解析失败，原始文本:", text);
      throw new Error("分析报告生成格式错误，请尝试重新运行。");
    }
  }
}
