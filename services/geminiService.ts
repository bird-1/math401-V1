
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_PROMPT, SYLLABUS } from "../constants";
import { AnalysisResult, FileData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // 密钥严格从环境变量获取。
    // 本地下载运行时，请确保通过构建工具（如 Vite/Webpack）注入，或临时在此处替换为字符串。
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.error("Gemini API Key 未配置！请在环境变量中设置 API_KEY。");
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

    // 使用旗舰级模型 gemini-3-pro-preview 处理复杂的数学教研分析
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
              description: "识别出的已覆盖单元 ID 列表，例如 ['unit1', 'unit2']"
            },
            missingTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topicId: { type: Type.STRING, description: "遗漏的单元 ID" },
                  reason: { type: Type.STRING, description: "判定遗漏的具体教研理由" },
                  suggestion: { type: Type.STRING, description: "针对该遗漏点的专业补题或复习建议" }
                },
                required: ["topicId", "reason", "suggestion"]
              }
            },
            overallScore: { type: Type.NUMBER, description: "基于大纲覆盖度的综合评分 (0-100)" },
            aiCommentary: { type: Type.STRING, description: "资深教研员视角的整体分析点评" },
            questionCount: { type: Type.NUMBER, description: "AI 识别出的题目总数" }
          },
          required: ["coveredTopics", "missingTopics", "overallScore", "aiCommentary", "questionCount"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 未能返回有效分析，请检查上传的题目是否清晰可见。");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON 解析失败:", text);
      throw new Error("分析报告格式解析异常，请尝试重新生成。");
    }
  }
}
