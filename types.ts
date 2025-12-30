
export interface SyllabusTopic {
  id: string;
  title: string;
  description: string;
  subPoints: string[];
}

export interface TopicScore {
  topicId: string;
  score: number; // 0-100 的覆盖深度评分
}

export interface AnalysisResult {
  topicScores: TopicScore[]; // 各单元的覆盖明细
  missingTopics: {
    topicId: string;
    reason: string;
    suggestion: string;
  }[];
  overallScore: number;
  aiCommentary: string;
  questionCount: number;
}

export interface FileData {
  id: string;
  name: string;
  base64: string;
  type: string;
}
