
export interface SyllabusTopic {
  id: string;
  title: string;
  description: string;
  subPoints: string[];
}

export interface AnalysisResult {
  coveredTopics: string[]; // IDs of SyllabusTopic
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
